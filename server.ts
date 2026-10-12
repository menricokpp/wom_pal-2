import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_COLLECTORS } from './src/data/initialData.js';
import type { CollectorRecord } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));

// Persistent storage path
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'collectors-store.json');

// In-memory state
let currentCollectors: CollectorRecord[] = [];
let lastUpdatedTime: string = new Date().toISOString();

// Initialize data from disk or default
function initStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentCollectors = parsed;
        console.log(`[Store] Berhasil memuat ${currentCollectors.length} kolektor dari ${STORE_PATH}`);
        return;
      }
    }
  } catch (err) {
    console.error('[Store] Gagal membaca storage, menggunakan data awal:', err);
  }

  // Fallback to initial collectors
  currentCollectors = JSON.parse(JSON.stringify(INITIAL_COLLECTORS));
  saveStoreToDisk();
  console.log(`[Store] Diinisialisasi dengan ${currentCollectors.length} kolektor default.`);
}

function saveStoreToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(currentCollectors, null, 2), 'utf-8');
    lastUpdatedTime = new Date().toISOString();
  } catch (err) {
    console.error('[Store] Gagal menyimpan ke disk:', err);
  }
}

initStore();

// SSE (Server-Sent Events) clients for real-time broadcast across all devices
const sseClients = new Set<express.Response>();

function broadcast(event: { type: string; collectors: CollectorRecord[]; lastUpdated: string; clientCount: number }) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 20 seconds
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(':ping\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

// API Routes

// 1. SSE Real-Time Stream
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial state immediately to the newly connected device
  const initPayload = {
    type: 'INIT',
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size,
  };
  res.write(`data: ${JSON.stringify(initPayload)}\n\n`);

  // Notify everyone of updated device count
  broadcast({
    type: 'PRESENCE',
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size,
  });

  req.on('close', () => {
    sseClients.delete(res);
    broadcast({
      type: 'PRESENCE',
      collectors: currentCollectors,
      lastUpdated: lastUpdatedTime,
      clientCount: sseClients.size,
    });
  });
});

// 2. GET all collectors
app.get('/api/collectors', (_req, res) => {
  res.json({
    success: true,
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    activeDevices: sseClients.size,
  });
});

// 3. POST / Replace all collectors (misal: setelah Upload Excel atau bulk update)
app.post('/api/collectors', (req, res) => {
  const { collectors } = req.body;
  if (!Array.isArray(collectors)) {
    return res.status(400).json({ success: false, error: 'Data kolektor harus berupa array.' });
  }

  currentCollectors = collectors;
  saveStoreToDisk();

  // Broadcast ke SEMUA device yang sedang terbuka secara instan
  broadcast({
    type: 'UPDATE',
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size,
  });

  res.json({
    success: true,
    message: 'Data berhasil diperbarui dan disinkronkan ke seluruh perangkat.',
    lastUpdated: lastUpdatedTime,
    count: currentCollectors.length,
  });
});

// 4. PUT / Update single collector
app.put('/api/collectors/:id', (req, res) => {
  const { id } = req.params;
  const updatedCollector: CollectorRecord = req.body;

  const index = currentCollectors.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Kolektor tidak ditemukan.' });
  }

  currentCollectors[index] = {
    ...currentCollectors[index],
    ...updatedCollector,
    updatedAt: new Date().toISOString(),
  };

  saveStoreToDisk();

  broadcast({
    type: 'UPDATE',
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size,
  });

  res.json({
    success: true,
    collector: currentCollectors[index],
    lastUpdated: lastUpdatedTime,
  });
});

// 5. POST / Reset to defaults
app.post('/api/collectors/reset', (_req, res) => {
  currentCollectors = JSON.parse(JSON.stringify(INITIAL_COLLECTORS));
  saveStoreToDisk();

  broadcast({
    type: 'RESET',
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size,
  });

  res.json({
    success: true,
    message: 'Data berhasil direset ke standar awal.',
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), devices: sseClients.size });
});

// Frontend Vite integration
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[WOM Palembang 2 Server] Berjalan pada port ${PORT} (Mode: ${isProd ? 'Production' : 'Development'})`);
    console.log(`[WOM Palembang 2 Server] Real-time SSE sinkronisasi aktif pada /api/realtime/stream`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Gagal menjalankan server:', err);
  process.exit(1);
});
