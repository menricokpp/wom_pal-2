import { CollectorRecord } from '../types';

export interface SyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  activeDevicesCount: number;
  error: string | null;
}

// BroadcastChannel for instant local inter-tab synchronization
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('wom_palembang2_realtime_bus') 
  : null;

// 1. Fetch all collectors from server
export async function fetchServerCollectors(): Promise<{ collectors: CollectorRecord[]; lastUpdated: string; activeDevices: number } | null> {
  try {
    const res = await fetch('/api/collectors', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.collectors)) {
      return {
        collectors: data.collectors,
        lastUpdated: data.lastUpdated,
        activeDevices: data.activeDevices || 1,
      };
    }
    return null;
  } catch (err: any) {
    console.warn('[Realtime] Gagal memuat data dari server, fallback ke local storage:', err.message);
    return null;
  }
}

// 2. Broadcast and save updated collectors to server (all devices will receive this update)
export async function updateServerCollectors(collectors: CollectorRecord[]): Promise<boolean> {
  try {
    // Notify same-device tabs immediately
    if (channel) {
      channel.postMessage({ type: 'UPDATE', collectors, lastUpdated: new Date().toISOString() });
    }

    const res = await fetch('/api/collectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectors }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return !!data.success;
  } catch (err: any) {
    console.error('[Realtime] Gagal sinkronisasi data ke server:', err);
    return false;
  }
}

// 3. Update single collector
export async function updateSingleCollector(id: string, collector: CollectorRecord): Promise<boolean> {
  try {
    if (channel) {
      channel.postMessage({ type: 'SINGLE_UPDATE', id, collector, lastUpdated: new Date().toISOString() });
    }

    const res = await fetch(`/api/collectors/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collector),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return !!data.success;
  } catch (err: any) {
    console.error('[Realtime] Gagal update kolektor ke server:', err);
    return false;
  }
}

// 4. Reset to initial collectors
export async function resetServerCollectors(): Promise<CollectorRecord[] | null> {
  try {
    if (channel) {
      channel.postMessage({ type: 'RESET', lastUpdated: new Date().toISOString() });
    }

    const res = await fetch('/api/collectors/reset', {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.collectors)) {
      return data.collectors;
    }
    return null;
  } catch (err: any) {
    console.error('[Realtime] Gagal reset data di server:', err);
    return null;
  }
}

// 5. Connect to SSE real-time stream across all devices with fallback polling
export function subscribeToRealtimeStream(callbacks: {
  onData: (collectors: CollectorRecord[], lastUpdated: string) => void;
  onPresence?: (count: number) => void;
  onStatusChange?: (status: { isConnected: boolean; error: string | null }) => void;
}): () => void {
  let eventSource: EventSource | null = null;
  let isClosed = false;
  let reconnectTimer: any = null;
  let pollingTimer: any = null;
  let isConnected = false;

  // Listen to BroadcastChannel for instant local updates across tabs
  const handleChannelMessage = (ev: MessageEvent) => {
    if (isClosed || !ev.data) return;
    if (ev.data.type === 'UPDATE' && Array.isArray(ev.data.collectors)) {
      callbacks.onData(ev.data.collectors, ev.data.lastUpdated || new Date().toISOString());
    }
  };
  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }

  // Fallback poller in case SSE drops or client is behind an SSE-buffering proxy
  const pollServer = async () => {
    if (isClosed) return;
    const res = await fetchServerCollectors();
    if (res && res.collectors) {
      callbacks.onData(res.collectors, res.lastUpdated);
      if (res.activeDevices) callbacks.onPresence?.(res.activeDevices);
      if (!isConnected) {
        callbacks.onStatusChange?.({ isConnected: true, error: null });
      }
    }
  };

  // Re-sync when user wakes up device or returns to tab
  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === 'visible') {
      pollServer();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
  }

  function connect() {
    if (isClosed) return;

    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.onopen = () => {
        isConnected = true;
        callbacks.onStatusChange?.({ isConnected: true, error: null });
        clearInterval(pollingTimer);
      };

      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return; // ignore comments/pings
          const msg = JSON.parse(event.data);

          if (msg.type === 'INIT' || msg.type === 'UPDATE' || msg.type === 'RESET') {
            if (Array.isArray(msg.collectors)) {
              callbacks.onData(msg.collectors, msg.lastUpdated || new Date().toISOString());
            }
          }

          if (typeof msg.clientCount === 'number') {
            callbacks.onPresence?.(msg.clientCount);
          }
        } catch (e) {
          console.error('[Realtime SSE] Error parsing message:', e);
        }
      };

      eventSource.onerror = () => {
        isConnected = false;
        callbacks.onStatusChange?.({ isConnected: false, error: 'Menghubungkan ke Cloud Server...' });
        eventSource?.close();

        // Start fallback polling every 5 seconds while disconnected
        clearInterval(pollingTimer);
        pollingTimer = setInterval(pollServer, 5000);

        if (!isClosed) {
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    } catch (e: any) {
      isConnected = false;
      callbacks.onStatusChange?.({ isConnected: false, error: e.message });
      clearInterval(pollingTimer);
      pollingTimer = setInterval(pollServer, 6000);
      if (!isClosed) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 4000);
      }
    }
  }

  connect();

  return () => {
    isClosed = true;
    clearTimeout(reconnectTimer);
    clearInterval(pollingTimer);
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
