import React, { useState, useEffect, useMemo } from 'react';
import { CollectorRecord, IncentiveCalculationResult, CalculationMode } from './types';
import { INITIAL_COLLECTORS } from './data/initialData';
import { calculateIncentive, formatRupiah } from './utils/calculations';
import { Header } from './components/Header';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { SegmentDashboard } from './components/SegmentDashboard';
import { IncentiveCalculator } from './components/IncentiveCalculator';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { MatrixGuide } from './components/MatrixGuide';
import { CollectorPerformanceDashboard } from './components/CollectorPerformanceDashboard';
import { EditCollectorModal } from './components/EditCollectorModal';
import { ManageCollectorsModal } from './components/ManageCollectorsModal';
import { CollectorReportSlipModal } from './components/CollectorReportSlipModal';
import { RealtimeUpdateGuideModal } from './components/RealtimeUpdateGuideModal';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import {
  fetchServerCollectors,
  updateServerCollectors,
  updateSingleCollector,
  resetServerCollectors,
  subscribeToRealtimeStream,
  type SyncState,
} from './services/realtimeSync';
import { 
  Table2, 
  Calculator, 
  BarChart3, 
  BookOpen, 
  Bell, 
  Sparkles,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  Radio
} from 'lucide-react';

const STORAGE_KEY = 'wom_palembang2_collectors_v5';

export default function App() {
  // Load data from localStorage or fallback to INITIAL_COLLECTORS
  const [collectors, setCollectors] = useState<CollectorRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CollectorRecord[] = JSON.parse(saved);
        // Exclude any Cabang, Total, or non-person rows
        const onlyCOs = parsed.filter((c) => {
          const upper = c.name.toUpperCase();
          return (
            !upper.includes('CABANG') &&
            !upper.includes('TOTAL') &&
            !upper.includes('BRANCH') &&
            !upper.includes('PALEMBANG 2') &&
            !upper.includes('REKAP')
          );
        });

        if (onlyCOs.length > 0) {
          // Ensure role alignment for known core collectors (9 CO FE/NOOD & 2 CO MR)
          return onlyCOs.map((c) => {
            const upper = c.name.toUpperCase();
            if (upper.includes('RAKA GILANG') || upper.includes('EMIR')) {
              return { ...c, primaryRole: 'MR' as const };
            }
            if (upper.includes('ZHUIDY') || upper.includes('MAULANA') || upper.includes('ARJUNA') || upper.includes('RIZAL')) {
              return { ...c, primaryRole: 'FE' as const };
            }
            if (upper.includes('RIKO TORNANDO')) {
              return { ...c, primaryRole: 'FE' as const };
            }
            return c;
          });
        }
      }
    } catch (e) {
      console.error('Error loading stored collectors:', e);
    }
    return INITIAL_COLLECTORS;
  });

  const [activeTab, setActiveTab] = useState<'monitoring' | 'performance' | 'calculator' | 'analytics' | 'matrix'>('monitoring');
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('current_date');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  // Real-time server sync state across all devices
  const [syncState, setSyncState] = useState<SyncState>({
    isConnected: true,
    isSyncing: false,
    lastSyncedAt: null,
    activeDevicesCount: 1,
    error: null,
  });

  // Real-time synchronization effect across all devices via Server-Sent Events (SSE)
  useEffect(() => {
    let isMounted = true;

    // Fetch initial persistent state from server
    fetchServerCollectors().then((result) => {
      if (isMounted && result && result.collectors.length > 0) {
        setCollectors(result.collectors);
        setLastUpdated(new Date(result.lastUpdated));
        setSyncState((prev) => ({
          ...prev,
          isConnected: true,
          lastSyncedAt: new Date(result.lastUpdated),
          activeDevicesCount: result.activeDevices || 1,
        }));
      }
    });

    // Subscribe to SSE stream for live updates from any device
    const unsubscribe = subscribeToRealtimeStream({
      onData: (serverCollectors, serverLastUpdated) => {
        if (!isMounted) return;
        setCollectors(serverCollectors);
        setLastUpdated(new Date(serverLastUpdated));
        setSyncState((prev) => ({
          ...prev,
          isConnected: true,
          lastSyncedAt: new Date(serverLastUpdated),
          error: null,
        }));
      },
      onPresence: (count) => {
        if (!isMounted) return;
        setSyncState((prev) => ({ ...prev, activeDevicesCount: count }));
      },
      onStatusChange: (status) => {
        if (!isMounted) return;
        setSyncState((prev) => ({
          ...prev,
          isConnected: status.isConnected,
          error: status.error,
        }));
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    setSyncState((prev) => ({ ...prev, isSyncing: true }));
    const result = await fetchServerCollectors();
    if (result && result.collectors.length > 0) {
      setCollectors(result.collectors);
      setLastUpdated(new Date(result.lastUpdated));
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        isConnected: true,
        lastSyncedAt: new Date(result.lastUpdated),
        activeDevicesCount: result.activeDevices,
      }));
      setLiveNotification('⚡ Berhasil tersinkronisasi dengan Cloud Server.');
      setTimeout(() => setLiveNotification(null), 3000);
    } else {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  // Live real-time clock & date update every second to ensure the date always stays current
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals state
  const [editingCollector, setEditingCollector] = useState<CollectorRecord | null>(null);
  const [viewingSlipCollector, setViewingSlipCollector] = useState<CollectorRecord | null>(null);
  const [isManageCollectorsOpen, setIsManageCollectorsOpen] = useState(false);
  const [isUpdateGuideOpen, setIsUpdateGuideOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Save to localStorage as offline cache whenever collectors change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectors));
    } catch (e) {
      console.error('Error saving collectors:', e);
    }
  }, [collectors]);

  // Real-time calculation of incentives for all collectors based on calculationMode
  const incentivesMap = useMemo(() => {
    const map: Record<string, IncentiveCalculationResult> = {};
    for (const c of collectors) {
      map[c.id] = calculateIncentive(c, calculationMode);
    }
    return map;
  }, [collectors, calculationMode]);

  // Real-time simulated payment ticker (Field simulation)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setCollectors((prev) => {
        const active = prev.filter((c) => c.isActive);
        if (active.length === 0) return prev;

        const randomIdx = Math.floor(Math.random() * active.length);
        const target = active[randomIdx];

        // Add small realistic incremental payment (e.g. 500k - 2.5M)
        const paymentBumps = [550000, 750000, 1250000, 1800000, 2400000];
        const bump = paymentBumps[Math.floor(Math.random() * paymentBumps.length)];

        const updatedTarget: CollectorRecord = {
          ...target,
          aktualSoreAmt: target.aktualSoreAmt + bump,
          aktualSoreAct: target.aktualSoreAct + 1,
          realisasiAmt: target.realisasiAmt + bump,
          kurangClosing: target.kurangClosing + bump,
          weeklyProgress: {
            ...target.weeklyProgress,
            w1: Math.min(100, Number((target.weeklyProgress.w1 + 0.4).toFixed(1))),
          },
          updatedAt: new Date().toISOString(),
        };

        setLiveNotification(
          `⚡ Penerimaan Pembayaran: ${target.name} (+${formatRupiah(bump)})`
        );
        setTimeout(() => setLiveNotification(null), 3500);

        return prev.map((c) => (c.id === target.id ? updatedTarget : c));
      });

      setLastUpdated(new Date());
    }, 8000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handler: Save collector edits
  const handleSaveCollector = (updated: CollectorRecord) => {
    setCollectors((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setLastUpdated(new Date());
    setLiveNotification(`Data ${updated.name} berhasil diperbarui di semua device.`);
    setTimeout(() => setLiveNotification(null), 3000);
    updateSingleCollector(updated.id, updated);
  };

  // Handler: Add new collector
  const handleAddCollector = (newColData: Omit<CollectorRecord, 'id' | 'updatedAt'>) => {
    const newId = `col-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newCol: CollectorRecord = {
      ...newColData,
      id: newId,
      updatedAt: new Date().toISOString(),
    };
    const nextList = [...collectors, newCol];
    setCollectors(nextList);
    setLastUpdated(new Date());
    setLiveNotification(`Petugas CO baru "${newCol.name}" berhasil ditambahkan.`);
    setTimeout(() => setLiveNotification(null), 3500);
    updateServerCollectors(nextList);
  };

  // Handler: Delete collector
  const handleDeleteCollector = (id: string) => {
    const target = collectors.find((c) => c.id === id);
    const nextList = collectors.filter((c) => c.id !== id);
    setCollectors(nextList);
    setLastUpdated(new Date());
    setLiveNotification(`Petugas CO "${target?.name || ''}" berhasil dihapus.`);
    setTimeout(() => setLiveNotification(null), 3500);
    updateServerCollectors(nextList);
  };

  // Handler: Toggle active status
  const handleToggleActiveCollector = (id: string) => {
    const nextList = collectors.map((c) => {
      if (c.id === id) {
        const updatedActive = !c.isActive;
        setLiveNotification(`Status "${c.name}" diubah menjadi ${updatedActive ? 'Aktif' : 'Nonaktif'}.`);
        setTimeout(() => setLiveNotification(null), 3000);
        return { ...c, isActive: updatedActive, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setCollectors(nextList);
    setLastUpdated(new Date());
    updateServerCollectors(nextList);
  };

  // Handler: Reset to Excel Baseline
  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setCollectors(INITIAL_COLLECTORS);
    localStorage.removeItem(STORAGE_KEY);
    setLastUpdated(new Date());
    setIsResetConfirmOpen(false);
    setLiveNotification('Data berhasil di-reset ke baseline Excel WOM Cabang Palembang 2.');
    setTimeout(() => setLiveNotification(null), 3000);
    resetServerCollectors();
  };

  // Handler: Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Rank',
      'Nama Collector',
      'NIK',
      'Role',
      'Status',
      'Beban Awal (Act)',
      'Beban Awal (Amt)',
      'Aktual Sore (Act)',
      'Aktual Sore (Amt)',
      'OS Berjalan',
      'Recovery Rate %',
      'Kurang Closing',
      'Target Harian',
      'Flow Ever %',
      'Balance / Ball %',
      'Flow No OD / Fwd %',
      'Stay %',
      'Delq 30+ %',
      'BTC %',
      'DKH %',
      'W1 %',
      'W2 %',
      'W3 %',
      'W4 %',
      'Tarik Motor',
      'Tarik Mobil',
      'BASTK',
      'Rapor Predikat',
      'Rapor Skor',
      'Insentif Penyelesaian (Adj)',
      'Insentif Tarik Unit (Adj)',
      'Insentif BTC',
      'Insentif Rapor (Ketentuan Baru)',
      'Total Estimasi Insentif',
      'Status Payout',
    ];

    const rows = collectors.map((c, idx) => {
      const inc = incentivesMap[c.id];
      const isFE = c.primaryRole === 'FE' || c.primaryRole === 'NOOD';
      const flowEver = isFE ? (c.raporFE?.flowEver ?? 45) : (c.raporMR?.flowEver ?? 50);
      const balance = isFE ? (c.raporFE?.balance ?? (c.ball0130Pct ?? 8)) : (c.raporMR?.balance ?? (c.ball3160Pct ?? 1.5));
      const secondaryFlow = isFE ? (c.raporFE?.flowNoOd ?? 2.5) : (c.raporMR?.flowForward ?? 6.0);
      const osBerjalan = Math.max(0, c.bahanAwalAmt - c.aktualSoreAmt);
      const recoveryRate = c.bahanAwalAmt > 0 ? ((c.aktualSoreAmt / c.bahanAwalAmt) * 100).toFixed(1) : '0.0';

      return [
        idx + 1,
        `"${c.name}"`,
        `"${c.nik}"`,
        c.primaryRole,
        c.isActive ? 'Aktif' : 'Nonaktif',
        c.bahanAwalAct,
        c.bahanAwalAmt,
        c.aktualSoreAct,
        c.aktualSoreAmt,
        osBerjalan,
        recoveryRate,
        c.kurangClosing,
        c.targetHarian,
        flowEver,
        balance,
        secondaryFlow,
        c.stayPct ?? 0,
        c.delq30Pct ?? 0,
        c.btcPct,
        c.dkhPct,
        c.weeklyProgress.w1,
        c.weeklyProgress.w2,
        c.weeklyProgress.w3,
        c.weeklyProgress.w4,
        c.unitTarikan.motor,
        c.unitTarikan.mobil,
        c.bastkStatus,
        inc ? inc.raporPredicate : '-',
        inc ? inc.raporTotalScore : '-',
        inc ? inc.penyelesaianAdjusted : 0,
        inc ? inc.tarikBarangAdjusted : 0,
        inc ? inc.btcOrSuccessRateIncentive : 0,
        inc ? inc.insentifRapor : 0,
        inc ? inc.grandTotal : 0,
        inc && inc.isEligiblePayout ? 'Eligible' : 'Under Target',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `WOM_Finance_Monitoring_Palembang2_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler: Apply parsed data from user's custom Excel file
  const handleApplyExcelData = async (updatedCollectors: CollectorRecord[], message: string) => {
    setCollectors(updatedCollectors);
    setLastUpdated(new Date());
    setLiveNotification(`⚡ ${message} (Tersinkronisasi otomatis ke semua perangkat)`);
    setTimeout(() => setLiveNotification(null), 5000);

    // Kirim langsung ke server agar tersinkronisasi secara real-time ke semua HP, tablet, dan komputer lain
    setSyncState((prev) => ({ ...prev, isSyncing: true }));
    const success = await updateServerCollectors(updatedCollectors);
    setSyncState((prev) => ({
      ...prev,
      isSyncing: false,
      isConnected: success ? true : prev.isConnected,
      lastSyncedAt: new Date(),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <Header
        onOpenAddModal={() => {
          const first = collectors.find((c) => c.isActive) || collectors[0];
          setEditingCollector(first);
        }}
        onOpenManageCollectors={() => setIsManageCollectorsOpen(true)}
        onOpenExcelUpload={() => setIsExcelUploadOpen(true)}
        onResetData={handleResetData}
        onExportCsv={handleExportCsv}
        onOpenUpdateGuide={() => setIsUpdateGuideOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        lastUpdated={lastUpdated}
        currentDate={currentDate}
        isRealtimeConnected={syncState.isConnected}
        activeDevicesCount={syncState.activeDevicesCount}
        onManualSync={handleManualSync}
      />

      {/* Floating Live Event Toast */}
      {liveNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-blue-950 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-blue-700 flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{liveNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Executive KPI Summary */}
        <ExecutiveSummary collectors={collectors} incentives={incentivesMap} />

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 pt-2 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'monitoring'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Monitoring Insentif 4 Pilar</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'performance'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Data Performance &amp; KPI CO</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-100 text-emerald-800">
              Beban, Flow &amp; Balance
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Simulator & What-If Insentif</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Leaderboard & Grafik Visual</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Matriks Regulasi 2026</span>
          </button>
        </div>

        {/* Tab 1: Monitoring Dashboard */}
        {activeTab === 'monitoring' && (
          <SegmentDashboard
            collectors={collectors}
            incentives={incentivesMap}
            calculationMode={calculationMode}
            onToggleCalculationMode={setCalculationMode}
            onEditCollector={(col) => setEditingCollector(col)}
            onViewSlip={(col) => setViewingSlipCollector(col)}
            onOpenExcelUpload={() => setIsExcelUploadOpen(true)}
            currentDate={currentDate}
          />
        )}

        {/* Tab 2: Dedicated Performance & KPI CO Dashboard */}
        {activeTab === 'performance' && (
          <CollectorPerformanceDashboard
            collectors={collectors}
            incentives={incentivesMap}
            onEditCollector={(col) => setEditingCollector(col)}
            onViewSlip={(col) => setViewingSlipCollector(col)}
            onOpenExcelUpload={() => setIsExcelUploadOpen(true)}
            onOpenManageCollectors={() => setIsManageCollectorsOpen(true)}
          />
        )}

        {/* Tab 2: Calculator Simulator */}
        {activeTab === 'calculator' && (
          <IncentiveCalculator
            collectors={collectors}
            onApplyToCollector={handleSaveCollector}
          />
        )}

        {/* Tab 3: Visual Leaderboard & Charts */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts
            collectors={collectors}
            incentives={incentivesMap}
          />
        )}

        {/* Tab 4: Official Presentation Matrix */}
        {activeTab === 'matrix' && <MatrixGuide />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            PT WAHANA OTTOMITRA MULTIARTHA TBK (WOM Finance) • Cabang Palembang 2
          </div>
          <div className="text-[11px] text-slate-500">
            Sistem Monitoring CORE Remedial & Insentif Terintegrasi • Periode 2026
          </div>
        </div>
      </footer>

      {/* Edit Collector Modal */}
      <EditCollectorModal
        isOpen={!!editingCollector}
        collector={editingCollector}
        onClose={() => setEditingCollector(null)}
        onSave={handleSaveCollector}
      />

      {/* Manage Collectors Modal (Add, Delete, Activate/Deactivate CO) */}
      <ManageCollectorsModal
        isOpen={isManageCollectorsOpen}
        collectors={collectors}
        onClose={() => setIsManageCollectorsOpen(false)}
        onAddCollector={handleAddCollector}
        onDeleteCollector={handleDeleteCollector}
        onToggleActive={handleToggleActiveCollector}
        onSelectForEdit={(col) => {
          setIsManageCollectorsOpen(false);
          setEditingCollector(col);
        }}
      />

      {/* Official Printable Report & Slip Modal */}
      <CollectorReportSlipModal
        isOpen={!!viewingSlipCollector}
        collector={viewingSlipCollector}
        incentive={viewingSlipCollector ? incentivesMap[viewingSlipCollector.id] : null}
        onClose={() => setViewingSlipCollector(null)}
      />

      {/* Realtime Update Guide Modal */}
      <RealtimeUpdateGuideModal
        isOpen={isUpdateGuideOpen}
        onClose={() => setIsUpdateGuideOpen(false)}
        onOpenEditModal={() => {
          const first = collectors.find((c) => c.isActive) || collectors[0];
          setEditingCollector(first);
        }}
        onGoToSimulator={() => setActiveTab('calculator')}
        onOpenExcelUpload={() => {
          setIsUpdateGuideOpen(false);
          setIsExcelUploadOpen(true);
        }}
      />

      {/* Direct User Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelUploadOpen}
        onClose={() => setIsExcelUploadOpen(false)}
        collectors={collectors}
        onApplyExcelData={handleApplyExcelData}
      />

      {/* Safe Reset Confirmation Modal (Replaces window.confirm) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Reset ke Baseline Excel?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Tindakan ini akan mengembalikan data seluruh 11 Collection Officer (9 FE &amp; 2 MR) ke baseline monitoring asli WOM Finance Cabang Palembang 2 dan menghapus penyimpanan cache browser.
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
