import React, { useState } from 'react';
import { 
  CollectorRecord, 
  IncentiveCalculationResult, 
  CollectorRole 
} from '../types';
import { 
  formatRupiah, 
  formatNumber, 
  formatPercent,
  calculateFERaporScore,
  calculateMRRaporScore
} from '../utils/calculations';
import { 
  TrendingUp, 
  Activity, 
  Search, 
  Edit3, 
  FileSpreadsheet, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  FileText,
  BarChart2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  MoveHorizontal,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { useHorizontalScroll } from '../utils/useHorizontalScroll';

interface CollectorPerformanceDashboardProps {
  collectors: CollectorRecord[];
  incentives: Record<string, IncentiveCalculationResult>;
  onEditCollector: (collector: CollectorRecord) => void;
  onViewSlip: (collector: CollectorRecord) => void;
  onOpenExcelUpload: () => void;
  onOpenManageCollectors?: () => void;
}

export const CollectorPerformanceDashboard: React.FC<CollectorPerformanceDashboardProps> = ({
  collectors,
  incentives,
  onEditCollector,
  onViewSlip,
  onOpenExcelUpload,
  onOpenManageCollectors,
}) => {
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'FE' | 'MR' | 'NOOD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [kpiFilter, setKpiFilter] = useState<
    'ALL' | 'EXCEPTIONAL' | 'EXCEED_TARGET' | 'ON_TARGET' | 'NEED_IMPROVEMENT' | 'UNACCEPTABLE' | 'ON_TARGET_PLUS' | 'UNDER_TARGET'
  >('ALL');
  const [noodFocus, setNoodFocus] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showMatrixLegend, setShowMatrixLegend] = useState(false);

  // Horizontal mouse wheel and drag-to-scroll hook for performance table
  const {
    containerRef,
    scrollLeftBy,
    canScrollLeft,
    canScrollRight,
    scrollProgress,
    hasOverflow,
  } = useHorizontalScroll<HTMLDivElement>({ speed: 1.3, enableDrag: true });

  // Filter CO only: 9 FE and 2 MR (strictly exclude branch summary or total rows)
  const coOnly = collectors.filter((c) => {
    const u = c.name.toUpperCase();
    return (
      !u.includes('CABANG') &&
      !u.includes('TOTAL') &&
      !u.includes('BRANCH') &&
      !u.includes('PALEMBANG 2') &&
      !u.includes('REKAP')
    );
  });

  // Calculate segment cohorts (Total 9 CO NOOD & FE adalah CO yang sama; 2 CO MR tidak diikutkan di NO OD)
  const feCollectors = coOnly.filter((c) => c.primaryRole === 'FE' && c.isActive);
  const mrCollectors = coOnly.filter((c) => c.primaryRole === 'MR' && c.isActive);
  const noodCollectors = coOnly.filter(
    (c) =>
      c.isActive &&
      c.primaryRole !== 'MR' &&
      !c.name.toUpperCase().includes('EMIR') &&
      !c.name.toUpperCase().includes('GILANG') &&
      (c.primaryRole === 'NOOD' || c.primaryRole === 'FE')
  );

  // Role & search & KPI filter
  const filteredCollectors = coOnly.filter((col) => {
    if (selectedRole === 'FE' && col.primaryRole !== 'FE') return false;
    if (selectedRole === 'MR' && col.primaryRole !== 'MR') return false;
    if (selectedRole === 'NOOD') {
      const isMR = col.primaryRole === 'MR' || col.name.toUpperCase().includes('EMIR') || col.name.toUpperCase().includes('GILANG');
      if (isMR) return false;
      const isNood = col.primaryRole === 'NOOD' || col.primaryRole === 'FE';
      if (!isNood) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!col.name.toLowerCase().includes(q) && !col.nik.toLowerCase().includes(q)) {
        return false;
      }
    }

    const inc = incentives[col.id];
    if (kpiFilter === 'EXCEPTIONAL') {
      if (!inc || inc.raporPredicate !== 'Exceptional') return false;
    } else if (kpiFilter === 'EXCEED_TARGET') {
      if (!inc || inc.raporPredicate !== 'Exceed Target') return false;
    } else if (kpiFilter === 'ON_TARGET') {
      if (!inc || inc.raporPredicate !== 'On Target') return false;
    } else if (kpiFilter === 'NEED_IMPROVEMENT') {
      if (!inc || inc.raporPredicate !== 'Need Improvement') return false;
    } else if (kpiFilter === 'UNACCEPTABLE') {
      if (!inc || inc.raporPredicate !== 'Unacceptable') return false;
    } else if (kpiFilter === 'ON_TARGET_PLUS') {
      if (!inc || (inc.raporPredicate !== 'On Target' && inc.raporPredicate !== 'Exceed Target' && inc.raporPredicate !== 'Exceptional')) return false;
    } else if (kpiFilter === 'UNDER_TARGET') {
      if (inc && (inc.raporPredicate === 'On Target' || inc.raporPredicate === 'Exceed Target' || inc.raporPredicate === 'Exceptional')) return false;
    }

    return true;
  });

  // Clean and separate aggregate statistics for each distinct portfolio
  // 1. FRONT END (FE 01-30) Aggregates
  const totalBebanFEAmt = feCollectors.reduce((acc, c) => acc + c.bahanAwalAmt, 0);
  const totalBebanFEAct = feCollectors.reduce((acc, c) => acc + c.bahanAwalAct, 0);
  const totalAktualSoreFEAmt = feCollectors.reduce((acc, c) => acc + c.aktualSoreAmt, 0);
  const totalAktualSoreFEAct = feCollectors.reduce((acc, c) => acc + c.aktualSoreAct, 0);
  const totalRealisasiFEAmt = feCollectors.reduce((acc, c) => acc + c.realisasiAmt, 0);
  const recoveryRateFE = totalBebanFEAmt > 0 ? (totalRealisasiFEAmt / totalBebanFEAmt) * 100 : 0;

  // 2. NO OVERDUE (NOOD) Aggregates (Pure NO OD portfolio data)
  const totalBebanNoodAmt = noodCollectors.reduce((acc, c) => acc + (c.noodBahanAmt ?? 0), 0);
  const totalBebanNoodAct = noodCollectors.reduce((acc, c) => acc + (c.noodBahanAct ?? 0), 0);
  const totalAktualSoreNoodAmt = noodCollectors.reduce((acc, c) => acc + (c.noodAktualSoreAmt ?? 0), 0);
  const totalAktualSoreNoodAct = noodCollectors.reduce((acc, c) => acc + (c.noodAktualSoreAct ?? 0), 0);
  const totalRealisasiNoodAmt = noodCollectors.reduce((acc, c) => acc + (c.noodRealisasiAmt ?? 0), 0);
  const recoveryRateNood = totalBebanNoodAmt > 0 ? (totalRealisasiNoodAmt / totalBebanNoodAmt) * 100 : 0;
  const avgBallNoOd = noodCollectors.length > 0
    ? noodCollectors.reduce((acc, c) => acc + (c.ballNoOdPct ?? 30.0), 0) / noodCollectors.length
    : 0;
  const avgFlowNoOd = noodCollectors.length > 0
    ? noodCollectors.reduce((acc, c) => acc + (c.flowNoOdPct ?? c.raporFE?.flowNoOd ?? 2.5), 0) / noodCollectors.length
    : 0;
  const totalAngsuran13 = noodCollectors.reduce((acc, c) => acc + (c.angsuran1_3 ?? 0), 0);
  const totalAngsuran16 = noodCollectors.reduce((acc, c) => acc + (c.angsuran1_6 ?? 0), 0);
  const totalAngsuran19 = noodCollectors.reduce((acc, c) => acc + (c.angsuran1_9 ?? 0), 0);
  const totalAkunNood = totalAngsuran13 + totalAngsuran16 + totalAngsuran19;

  // 3. MID RANGE (MR 31-60) Aggregates
  const totalBebanMRAmt = mrCollectors.reduce((acc, c) => acc + c.bahanAwalAmt, 0);
  const totalBebanMRAct = mrCollectors.reduce((acc, c) => acc + c.bahanAwalAct, 0);
  const totalAktualSoreMRAmt = mrCollectors.reduce((acc, c) => acc + c.aktualSoreAmt, 0);
  const totalRealisasiMRAmt = mrCollectors.reduce((acc, c) => acc + c.realisasiAmt, 0);

  // Averages for FE
  const avgFlowEverFE = feCollectors.length > 0
    ? feCollectors.reduce((acc, c) => acc + (c.raporFE?.flowEver ?? 0), 0) / feCollectors.length
    : 0;
  const avgBalanceFE = feCollectors.length > 0
    ? feCollectors.reduce((acc, c) => acc + (c.raporFE?.balance ?? (c.ball0130Pct ?? 0)), 0) / feCollectors.length
    : 0;
  const avgFlowNoOdFE = feCollectors.length > 0
    ? feCollectors.reduce((acc, c) => acc + (c.raporFE?.flowNoOd ?? 0), 0) / feCollectors.length
    : 0;
  const avgBall0130FE = feCollectors.length > 0
    ? feCollectors.reduce((acc, c) => acc + (c.ball0130Pct ?? 0), 0) / feCollectors.length
    : 0;
  const avgBtcFE = feCollectors.length > 0
    ? feCollectors.reduce((acc, c) => acc + (c.btcPct ?? 0), 0) / feCollectors.length
    : 0;

  // Averages for MR
  const avgFlowEverMR = mrCollectors.length > 0
    ? mrCollectors.reduce((acc, c) => acc + (c.raporMR?.flowEver ?? 0), 0) / mrCollectors.length
    : 0;
  const avgBalanceMR = mrCollectors.length > 0
    ? mrCollectors.reduce((acc, c) => acc + (c.raporMR?.balance ?? (c.ball3160Pct ?? 0)), 0) / mrCollectors.length
    : 0;
  const avgSuccessRateMR = mrCollectors.length > 0
    ? mrCollectors.reduce((acc, c) => acc + (c.successRateMRPct ?? 0), 0) / mrCollectors.length
    : 0;

  // Predicate distribution
  let exceptionalCount = 0;
  let exceedCount = 0;
  let onTargetCount = 0;
  let needImprovementCount = 0;
  let unacceptableCount = 0;

  coOnly.forEach((c) => {
    const inc = incentives[c.id];
    if (inc) {
      if (inc.raporPredicate === 'Exceptional') exceptionalCount++;
      else if (inc.raporPredicate === 'Exceed Target') exceedCount++;
      else if (inc.raporPredicate === 'On Target') onTargetCount++;
      else if (inc.raporPredicate === 'Need Improvement') needImprovementCount++;
      else unacceptableCount++;
    }
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Explanation */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-5 text-white shadow-xl border border-blue-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Sistem Evaluasi Kinerja & KPI Kolektor 2026</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Dashboard Performance CO: Beban Awal, Flow Rate &amp; Balance
            </h2>
            <p className="text-xs text-blue-200 mt-1 max-w-3xl leading-relaxed">
              Pantau dan kelola seluruh indikator penentu KPI resmi: <strong>Beban Awal (Act &amp; Amt)</strong>, 
              <strong> Flow Ever (%)</strong>, <strong>Balance / Ballance (%)</strong>, <strong>Flow No OD / Flow Forward (%)</strong>, 
              serta <strong>Skor Rapor Kinerja</strong>. Seluruh data dapat diubah langsung atau diupdate massal via upload file Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenManageCollectors && (
              <button
                onClick={onOpenManageCollectors}
                className="flex items-center text-xs font-bold px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white border border-blue-400 shadow-md transition-all cursor-pointer ring-1 ring-blue-300/30"
                title="Kelola jumlah petugas CO: Tambah CO baru atau kurangi / nonaktifkan CO"
              >
                <Users className="w-4 h-4 mr-1.5 text-amber-300" />
                <span>Kelola Petugas CO ({coOnly.length})</span>
              </button>
            )}

            <button
              onClick={onOpenExcelUpload}
              className="flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/50 transition-all cursor-pointer ring-1 ring-emerald-300/30"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-amber-300" />
              <span>Upload Excel (Beban &amp; KPI)</span>
            </button>

            <button
              onClick={() => setShowMatrixLegend(!showMatrixLegend)}
              className="flex items-center text-xs font-semibold px-3 py-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-700/80 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>{showMatrixLegend ? 'Tutup Matriks KPI' : 'Lihat Matriks Bobot'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Matrix Legend */}
        {showMatrixLegend && (
          <div className="mt-4 pt-4 border-t border-blue-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in duration-200">
            {/* FE Matrix */}
            <div className="bg-blue-900/60 p-3.5 rounded-xl border border-blue-700/60">
              <div className="flex items-center justify-between font-bold text-amber-300 text-xs mb-2">
                <span>1. Matriks Front End (FE 01-30)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-200">
                  9 CO Aktif
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-blue-100">
                <li className="flex justify-between items-center py-0.5 border-b border-blue-800/50">
                  <span>Flow Ever 01-30 (Bobot 30%)</span>
                  <span className="font-mono text-emerald-300">≤45% (T5) s/d &gt;60% (T1)</span>
                </li>
                <li className="flex justify-between items-center py-0.5 border-b border-blue-800/50">
                  <span>Balance / Ball 01-30 (Bobot 30%)</span>
                  <span className="font-mono text-emerald-300">≤8.5% (T5) s/d &gt;10.0% (T1)</span>
                </li>
                <li className="flex justify-between items-center py-0.5">
                  <span>Flow No OD (Bobot 40%)</span>
                  <span className="font-mono text-emerald-300">≤2.7% (T5) s/d &gt;3.9% (T1)</span>
                </li>
              </ul>
            </div>

            {/* MR Matrix */}
            <div className="bg-purple-950/50 p-3.5 rounded-xl border border-purple-800/60">
              <div className="flex items-center justify-between font-bold text-amber-300 text-xs mb-2">
                <span>2. Matriks Mid Range (MR 31-60)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-200">
                  Resmi WOM 2026
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-purple-100">
                <li className="flex justify-between items-center py-0.5 border-b border-purple-900/50">
                  <span>Flow Ever 31-60 (Bobot 30%)</span>
                  <span className="font-mono text-emerald-300">≤55% (T5, 1.5) s/d &gt;70% (T1, 0.3)</span>
                </li>
                <li className="flex justify-between items-center py-0.5 border-b border-purple-900/50">
                  <span>Balance 31-60 (Bobot 30%)</span>
                  <span className="font-mono text-emerald-300">≤1.8% (T5, 1.5) s/d &gt;2.4% (T1, 0.3)</span>
                </li>
                <li className="flex justify-between items-center py-0.5">
                  <span>Flow Forward 1-30 (Bobot 40%)</span>
                  <span className="font-mono text-emerald-300">≤6.6% (T5, 2.0) s/d &gt;9.6% (T1, 0.4)</span>
                </li>
              </ul>
            </div>

            {/* Official Conversion Table from User Image */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/50 shadow-md">
              <div className="flex items-center justify-between font-bold text-amber-300 text-xs mb-2">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  3. Tabel Konversi Point ke Raport
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-blue-950 font-black">
                  Syarat Cair: On Target
                </span>
              </div>
              <div className="border border-slate-700 rounded-lg overflow-hidden text-[10px]">
                <table className="w-full text-center">
                  <thead className="bg-slate-800 text-slate-300 font-bold uppercase text-[9px] border-b border-slate-700">
                    <tr>
                      <th className="py-1 px-1.5">Point</th>
                      <th className="py-1 px-2 text-left">Raport</th>
                      <th className="py-1 px-1.5 text-right">Status Insentif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-white">
                    <tr className="bg-purple-950/40">
                      <td className="py-1 px-1.5 font-mono text-purple-300 font-bold">4,5 – 5,00</td>
                      <td className="py-1 px-2 text-left font-black text-purple-300">EXCEPTIONAL</td>
                      <td className="py-1 px-1.5 text-right font-semibold text-emerald-400">DIBAYARKAN (100%)</td>
                    </tr>
                    <tr className="bg-blue-950/40">
                      <td className="py-1 px-1.5 font-mono text-blue-300 font-bold">4 – 4,99</td>
                      <td className="py-1 px-2 text-left font-bold text-blue-300">EXCEED TARGET</td>
                      <td className="py-1 px-1.5 text-right font-semibold text-emerald-400">DIBAYARKAN (100%)</td>
                    </tr>
                    <tr className="bg-emerald-950/40">
                      <td className="py-1 px-1.5 font-mono text-emerald-300 font-bold">3 – 3,99</td>
                      <td className="py-1 px-2 text-left font-bold text-emerald-300">ON TARGET</td>
                      <td className="py-1 px-1.5 text-right font-black text-emerald-400">DIBAYARKAN (MINIMAL)</td>
                    </tr>
                    <tr className="bg-amber-950/30">
                      <td className="py-1 px-1.5 font-mono text-amber-300">1,5 – 2,99</td>
                      <td className="py-1 px-2 text-left font-bold text-amber-300">NEED IMPROVEMENT</td>
                      <td className="py-1 px-1.5 text-right font-mono text-red-400">Rp 0 (HOLD)</td>
                    </tr>
                    <tr className="bg-rose-950/30">
                      <td className="py-1 px-1.5 font-mono text-rose-300">1 – 1,99</td>
                      <td className="py-1 px-2 text-left font-bold text-rose-300">UNACCEPTABLE</td>
                      <td className="py-1 px-1.5 text-right font-mono text-red-400">Rp 0 (HOLD)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {selectedRole === 'NOOD' ? (
          <>
            {/* NOOD Card 1: Beban Awal Portofolio NOOD */}
            <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-xs hover:border-teal-400 transition-all bg-gradient-to-br from-white to-teal-50/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-950 uppercase tracking-wider">
                  Beban Awal NO OD
                </span>
                <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-teal-950 truncate">
                  {formatRupiah(totalBebanNoodAmt)}
                </div>
                <div className="text-[11px] text-teal-700 mt-0.5 flex items-center gap-1 font-semibold">
                  <span>{totalBebanNoodAct} Kontrak Akun</span>
                  <span>•</span>
                  <span className="text-[10px] text-teal-600">Portofolio No Overdue</span>
                </div>
              </div>
            </div>

            {/* NOOD Card 2: Sisa OS Sore NO OD */}
            <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-xs hover:border-teal-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Sisa OS Sore NO OD
                </span>
                <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900 truncate">
                  {formatRupiah(totalAktualSoreNoodAmt)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  <span>{totalAktualSoreNoodAct} Sisa Akun</span>
                  <span> • Tertagih: </span>
                  <strong className="text-emerald-700">{recoveryRateNood.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* NOOD Card 3: Rata BALL No_OD % */}
            <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-xs hover:border-teal-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Rata BALL No_OD
                </span>
                <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900">
                  {formatPercent(avgBallNoOd)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  <span className="text-teal-700 font-bold">
                    Target Cabang NO OD ({noodCollectors.length} CO)
                  </span>
                </div>
              </div>
            </div>

            {/* NOOD Card 4: Rata Flow No OD % */}
            <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-xs hover:border-teal-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Rata Flow No OD
                </span>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900">
                  {formatPercent(avgFlowNoOd)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span className={avgFlowNoOd <= 2.7 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {avgFlowNoOd <= 2.7 ? '✓ Sangat Baik (≤2.7% Bobot 40%)' : 'Batas Aman ≤3.1%'}
                  </span>
                </div>
              </div>
            </div>

            {/* NOOD Card 5: Total Akun Angsuran 1-9 */}
            <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-xs hover:border-teal-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Akun Angsuran A1-9
                </span>
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900">
                  {totalAkunNood} Kontrak
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">
                  A3: <strong>{totalAngsuran13}</strong> • A6: <strong>{totalAngsuran16}</strong> • A9: <strong>{totalAngsuran19}</strong>
                </div>
              </div>
            </div>
          </>
        ) : selectedRole === 'FE' ? (
          <>
            {/* FE Card 1: Beban Awal Portofolio FE */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs hover:border-blue-300 transition-all bg-gradient-to-br from-white to-blue-50/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                  Total Beban FE (01-30)
                </span>
                <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-blue-950 truncate">
                  {formatRupiah(totalBebanFEAmt)}
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5 flex items-center gap-1 font-semibold">
                  <span>{totalBebanFEAct} Kontrak Akun</span>
                  <span>•</span>
                  <span className="text-[10px] text-blue-600">Portofolio FE Harian</span>
                </div>
              </div>
            </div>

            {/* FE Card 2: Sisa OS Sore FE */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Sisa OS Sore FE
                </span>
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900 truncate">
                  {formatRupiah(totalAktualSoreFEAmt)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>{totalAktualSoreFEAct} Sisa Akun</span>
                  <span> • Realisasi: </span>
                  <strong className="text-emerald-700">{formatRupiah(totalRealisasiFEAmt)} ({recoveryRateFE.toFixed(1)}%)</strong>
                </div>
              </div>
            </div>

            {/* FE Card 3: Rata Flow Ever FE */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Rata Flow Ever FE
                </span>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900">
                  {formatPercent(avgFlowEverFE)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span className={avgFlowEverFE <= 45 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {avgFlowEverFE <= 45 ? '✓ Target FE ≤45% Tercapai' : 'Target FE ≤45% (Perlu Pengawasan)'}
                  </span>
                </div>
              </div>
            </div>

            {/* FE Card 4: Rata Ball 01-30 FE */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Rata Ball 01-30
                </span>
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900">
                  {formatPercent(avgBalanceFE)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>Target Ball FE ≤8.5% (Bobot 30%)</span>
                </div>
              </div>
            </div>

            {/* FE Card 5: Kepatuhan KPI FE */}
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pencapaian KPI FE
                </span>
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-purple-700" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-emerald-700">
                  {feCollectors.filter((c) => (incentives[c.id]?.raporTotalScore ?? 0) >= 3.0).length} / {feCollectors.length} CO Lolos
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>Syarat Payout: Skor Rapor ≥ 3.0</span>
                </div>
              </div>
            </div>
          </>
        ) : selectedRole === 'MR' ? (
          <>
            {/* MR Card 1: Beban Awal MR */}
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all bg-gradient-to-br from-white to-purple-50/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider">
                  Beban Awal MR (31-60)
                </span>
                <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-purple-950 truncate">
                  {formatRupiah(totalBebanMRAmt)}
                </div>
                <div className="text-[11px] text-purple-700 mt-0.5 flex items-center gap-1 font-semibold">
                  <span>{totalBebanMRAct} Kontrak Akun</span>
                  <span>•</span>
                  <span>Portofolio Mid Range</span>
                </div>
              </div>
            </div>

            {/* MR Card 2: Sisa OS Sore MR */}
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Sisa OS Sore MR
                </span>
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900 truncate">
                  {formatRupiah(totalAktualSoreMRAmt)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>Realisasi Tertagih: </span>
                  <strong className="text-emerald-700">{formatRupiah(totalRealisasiMRAmt)}</strong>
                </div>
              </div>
            </div>

            {/* MR Card 3: Rata Success Rate MR */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                  Rata Success Rate MR
                </span>
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-emerald-700">
                  {formatPercent(avgSuccessRateMR)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>Rollback + BTC + Pelunasan (Target ≥30%)</span>
                </div>
              </div>
            </div>

            {/* MR Card 4: Rata Ball 31-60 */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Rata Ball 31-60
                </span>
                <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-slate-900">
                  {formatPercent(avgBalanceMR)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>Target Ball MR ≤1.5%</span>
                </div>
              </div>
            </div>

            {/* MR Card 5: Kepatuhan KPI MR */}
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Kepatuhan KPI MR
                </span>
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-emerald-700">
                  {mrCollectors.filter((c) => (incentives[c.id]?.raporTotalScore ?? 0) >= 3.0).length} / {mrCollectors.length} CO Lolos
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>Pencairan Insentif Aktif</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* COMPARATIVE Card 1: Portofolio NO OVERDUE */}
            <div className="bg-white p-3.5 rounded-xl border border-teal-300 shadow-xs hover:border-teal-400 transition-all bg-gradient-to-br from-white to-teal-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                    Portofolio NO OD
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-teal-100 text-teal-900">
                    Cabang
                  </span>
                </div>
                <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-teal-950 truncate">
                  {formatRupiah(totalBebanNoodAmt)}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 flex items-center justify-between">
                  <span>{totalBebanNoodAct} Akun NO OD</span>
                  <span className="text-teal-800 font-bold">Ball: {formatPercent(avgBallNoOd)}</span>
                </div>
              </div>
            </div>

            {/* COMPARATIVE Card 2: Portofolio FRONT END */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-300 shadow-xs hover:border-blue-400 transition-all bg-gradient-to-br from-white to-blue-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider">
                    Portofolio FE (01-30)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-blue-100 text-blue-900">
                    Cabang
                  </span>
                </div>
                <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-blue-950 truncate">
                  {formatRupiah(totalBebanFEAmt)}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 flex items-center justify-between">
                  <span>{totalBebanFEAct} Akun FE</span>
                  <span className="text-blue-800 font-bold">Ever: {formatPercent(avgFlowEverFE)}</span>
                </div>
              </div>
            </div>

            {/* COMPARATIVE Card 3: Portofolio MID RANGE */}
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider">
                  Portofolio MR (31-60)
                </span>
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-purple-950 truncate">
                  {formatRupiah(totalBebanMRAmt)}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 flex items-center justify-between">
                  <span>{totalBebanMRAct} Akun MR</span>
                  <span className="text-purple-800 font-bold">Success: {formatPercent(avgSuccessRateMR)}</span>
                </div>
              </div>
            </div>

            {/* COMPARATIVE Card 4: Kualitas Portofolio NO OD vs FE */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Flow NO OD vs FE
                </span>
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-teal-800 font-bold">NO OD: {formatPercent(avgFlowNoOd)}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-blue-900 font-bold">FE Ever: {formatPercent(avgFlowEverFE)}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  <span>Nilai kedua portofolio berdiri sendiri</span>
                </div>
              </div>
            </div>

            {/* COMPARATIVE Card 5: Kepatuhan KPI Cabang */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pencapaian KPI
                </span>
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-purple-700" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-base font-black text-emerald-700 flex items-center gap-1.5">
                  <span>{exceptionalCount + exceedCount + onTargetCount} / {coOnly.length} CO Lolos</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                  <span>Exc: <strong>{exceptionalCount}</strong></span>
                  <span>•</span>
                  <span>Exceed: <strong>{exceedCount}</strong></span>
                  <span>•</span>
                  <span>On: <strong>{onTargetCount}</strong></span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Control Bar: Filters, Search & Bulk Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
        {/* Segment Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedRole('NOOD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              selectedRole === 'NOOD'
                ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-400'
                : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
            }`}
            title="Tampilkan Tabel Khusus NO OVERDUE (Beban Awal Rp 5,28 M - Rp 9,35 M, Ball No_OD & Angsuran 1-9)"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-0.5 text-amber-300" />
            <span>Tabel 1: NO OVERDUE (NO OD) ({noodCollectors.length})</span>
          </button>
          <button
            onClick={() => setSelectedRole('FE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              selectedRole === 'FE'
                ? 'bg-blue-900 text-white shadow-xs ring-2 ring-blue-500'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
            }`}
            title="Tampilkan Tabel Khusus FRONT END (Beban Awal Rp 304 Jt - Rp 1,06 M, BTC %, Ball 01-30)"
          >
            <Layers className="w-3.5 h-3.5 mr-0.5 text-blue-400" />
            <span>Tabel 2: FRONT END (FE 01-30) ({feCollectors.length})</span>
          </button>
          <button
            onClick={() => setSelectedRole('MR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              selectedRole === 'MR'
                ? 'bg-purple-900 text-white shadow-xs ring-2 ring-purple-400'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
            }`}
            title="Tampilkan Tabel Khusus MID RANGE (Beban Awal Rp 354 Jt - Rp 526 Jt, Success Rate MR)"
          >
            <BarChart2 className="w-3.5 h-3.5 mr-0.5 text-purple-400" />
            <span>Tabel 3: MID RANGE (MR 31-60) ({mrCollectors.length})</span>
          </button>
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              selectedRole === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
            title="Tampilkan Ketiga Tabel Secara Terpisah & Berurutan (Tanpa Digabung Dalam Satu Baris)"
          >
            <MoveHorizontal className="w-3.5 h-3.5 mr-0.5 text-amber-400" />
            <span>Semua Portofolio (3 Tabel Terpisah)</span>
          </button>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-300 mx-1"></span>

          {/* Status KPI Filter */}
          <select
            value={kpiFilter}
            onChange={(e) => setKpiFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Predikat Rapor</option>
            <option value="EXCEPTIONAL">Exceptional (4,5 - 5,00)</option>
            <option value="EXCEED_TARGET">Exceed Target (4,0 - 4,49)</option>
            <option value="ON_TARGET">On Target (3,0 - 3,99)</option>
            <option value="NEED_IMPROVEMENT">Need Improvement (1,5 - 2,99)</option>
            <option value="UNACCEPTABLE">Unacceptable (1,0 - 1,99)</option>
            <option value="ON_TARGET_PLUS">Kategori Lolos (On Target+)</option>
            <option value="UNDER_TARGET">Kategori Di Bawah Target</option>
          </select>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Nama CO atau NIK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Portfolio Separation Callout Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-50 border border-teal-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 bg-teal-700 text-white rounded-lg shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>Struktur Portofolio Cabang Palembang 2:</span>
              <span className="text-[10px] px-2 py-0.2 rounded font-black bg-teal-100 text-teal-900 border border-teal-300">
                Data NO OD &amp; FE Berdiri Sendiri (Tidak Digabung)
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              Di template Excel resmi WOM Finance, setiap CO mengelola <strong>2 portofolio penagihan terpisah</strong>: 
              Portofolio <strong>NO OVERDUE (NO OD)</strong> (Beban Rp 5,2 M - 9,3 M, Ball No_OD %, Angsuran 1-9) dan Portofolio <strong>FRONT END (FE 01-30)</strong> (Beban Rp 300 Jt - 1,06 M, BTC %, Ball 01-30). 
              Hanya nama CO yang sama, seluruh nilai nominal dan parameternya <strong>terpisah</strong>.
            </p>
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 text-[11px] font-semibold">
          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
            Tabel NO OD: 9 CO Aktif
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
            Tabel FE: 9 CO Aktif
          </span>
        </div>
      </div>

      {/* Dedicated Portfolio Tables Display */}
      {(() => {
        // Filter helpers for each distinct portfolio
        const filterCollectorByKpi = (col: CollectorRecord) => {
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (!col.name.toLowerCase().includes(q) && !col.nik.toLowerCase().includes(q)) {
              return false;
            }
          }
          const inc = incentives[col.id];
          if (kpiFilter === 'EXCEPTIONAL') {
            if (!inc || inc.raporPredicate !== 'Exceptional') return false;
          } else if (kpiFilter === 'EXCEED_TARGET') {
            if (!inc || inc.raporPredicate !== 'Exceed Target') return false;
          } else if (kpiFilter === 'ON_TARGET') {
            if (!inc || inc.raporPredicate !== 'On Target') return false;
          } else if (kpiFilter === 'NEED_IMPROVEMENT') {
            if (!inc || inc.raporPredicate !== 'Need Improvement') return false;
          } else if (kpiFilter === 'UNACCEPTABLE') {
            if (!inc || inc.raporPredicate !== 'Unacceptable') return false;
          } else if (kpiFilter === 'ON_TARGET_PLUS') {
            if (!inc || (inc.raporPredicate !== 'On Target' && inc.raporPredicate !== 'Exceed Target' && inc.raporPredicate !== 'Exceptional')) return false;
          } else if (kpiFilter === 'UNDER_TARGET') {
            if (inc && (inc.raporPredicate === 'On Target' || inc.raporPredicate === 'Exceed Target' || inc.raporPredicate === 'Exceptional')) return false;
          }
          return true;
        };

        // Render Table 1: NO OVERDUE (NO OD)
        const renderNoodTable = () => {
          const list = noodCollectors.filter(filterCollectorByKpi);
          return (
            <div className="bg-white rounded-xl shadow-xs border border-teal-300/80 overflow-hidden">
              {/* Header Banner NO OD */}
              <div className="p-3.5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-700">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-teal-700 text-amber-300 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-white">
                        TABEL 1: PORTOFOLIO NO OVERDUE (NO OD) — PALEMBANG 2
                      </h4>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-teal-100 text-teal-900">
                        {list.length} Kolektor Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-200 mt-0.5">
                      Portofolio akun awal bulan • Beban Awal Rp 5,28 M s/d Rp 9,35 M • Parameter: BALL No_OD %, Aktual Sore %, Angsuran Ke- 1-9
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-teal-100 flex items-center gap-2">
                  <span>Total Beban: <strong className="text-amber-300 font-mono">{formatRupiah(totalBebanNoodAmt)}</strong></span>
                  <span>•</span>
                  <span>{totalBebanNoodAct} Akun</span>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-teal-950 text-teal-100 font-bold uppercase tracking-wider text-[11px] border-b border-teal-800 sticky top-0">
                    <tr>
                      <th className="py-3 px-3 text-center w-10 text-teal-300">No</th>
                      <th className="py-3 px-3 min-w-[190px]">Collector &amp; NIK</th>
                      <th className="py-3 px-3 text-right min-w-[145px] bg-teal-900 text-amber-300">
                        Beban Awal NO OD
                      </th>
                      <th className="py-3 px-3 text-center min-w-[110px] bg-teal-900 text-amber-300">
                        BALL No_OD (%)
                      </th>
                      <th className="py-3 px-3 text-right min-w-[145px]">Sisa OS Sore NO OD</th>
                      <th className="py-3 px-3 text-center min-w-[110px] text-teal-200">
                        Flow No OD (%)
                      </th>
                      <th className="py-3 px-3 text-right min-w-[145px] bg-emerald-950 text-emerald-300 font-bold">
                        Realisasi NO OD
                      </th>
                      <th className="py-3 px-3 text-right min-w-[130px]">Kurang Closing</th>
                      <th className="py-3 px-3 text-right min-w-[120px]">Target Harian</th>
                      <th className="py-3 px-3 text-center min-w-[85px]">Angsuran 1-3</th>
                      <th className="py-3 px-3 text-center min-w-[85px]">Angsuran 1-6</th>
                      <th className="py-3 px-3 text-center min-w-[85px] bg-amber-950 text-amber-300 font-bold">Angsuran 1-9</th>
                      <th className="py-3 px-3 text-center min-w-[100px] bg-teal-900 text-amber-300 font-bold">Total Akun A1-9</th>
                      <th className="py-3 px-3 text-center min-w-[125px]">Status Rapor</th>
                      <th className="py-3 px-3 text-center min-w-[90px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((col, idx) => {
                      const inc = incentives[col.id];
                      const isExpanded = expandedId === `nood-${col.id}`;
                      const nBahanAmt = col.noodBahanAmt ?? 0;
                      const nBahanAct = col.noodBahanAct ?? 0;
                      const nSoreAmt = col.noodAktualSoreAmt ?? 0;
                      const nSoreAct = col.noodAktualSoreAct ?? 0;
                      const nRealAmt = col.noodRealisasiAmt ?? Math.max(0, nBahanAmt - nSoreAmt);
                      const nAkunSelesai = Math.max(0, nBahanAct - nSoreAct);
                      const nRecoveryRate = nBahanAmt > 0 ? ((nRealAmt / nBahanAmt) * 100).toFixed(1) : '0.0';
                      const totalNoodAccounts = (col.angsuran1_3 || 0) + (col.angsuran1_6 || 0) + (col.angsuran1_9 || 0);

                      return (
                        <React.Fragment key={col.id}>
                          <tr className={`hover:bg-teal-50/50 transition-colors ${isExpanded ? 'bg-teal-50/60' : ''}`}>
                            <td className="py-3 px-3 text-center font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : `nood-${col.id}`)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  title="Lihat rincian NO OD"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-teal-700" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    {col.name}
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
                                      NO OD
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    NIK: {col.nik}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right bg-teal-50/40">
                              <div className="font-bold text-teal-950 font-mono">
                                {formatRupiah(nBahanAmt)}
                              </div>
                              <div className="text-[10px] text-teal-700 font-semibold">
                                {nBahanAct} Akun NO OD
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center bg-teal-50/30">
                              <span className="inline-block px-2 py-0.5 rounded font-black text-teal-950 text-xs bg-teal-100 border border-teal-300">
                                {formatPercent(col.ballNoOdPct ?? 30.0)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="font-bold text-slate-900 font-mono">
                                {formatRupiah(nSoreAmt)}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {nSoreAct} Sisa Akun
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                (col.flowNoOdPct ?? 2.5) <= 2.7
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {formatPercent(col.flowNoOdPct ?? 2.5)}
                              </span>
                              <div className="text-[9px] text-slate-400 mt-0.5">Target ≤2.7%</div>
                            </td>
                            <td className="py-3 px-3 text-right bg-emerald-50/40">
                              <div className="font-bold text-emerald-700 font-mono">
                                {formatRupiah(nRealAmt)}
                              </div>
                              <div className="text-[10px] text-emerald-800 font-semibold">
                                {nAkunSelesai} Tertagih ({nRecoveryRate}%)
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-slate-700 font-mono">
                              {formatRupiah(col.noodKurangClosing ?? 0)}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-blue-900 font-mono">
                              {formatRupiah(col.noodTargetHarian ?? 0)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-700 bg-slate-50">
                              {col.angsuran1_3 || 0}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-700 bg-slate-50">
                              {col.angsuran1_6 || 0}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-amber-950 font-bold bg-amber-50">
                              {col.angsuran1_9 || 0}
                            </td>
                            <td className="py-3 px-3 text-center bg-teal-50 font-black text-teal-950 font-mono">
                              {totalNoodAccounts}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {inc ? (
                                <div>
                                  <div className="font-black text-xs text-slate-900 font-mono">
                                    {inc.raporTotalScore.toFixed(2)}
                                  </div>
                                  <span className="inline-block text-[9px] px-2 py-0.5 rounded-md font-bold mt-0.5 bg-teal-100 text-teal-800 border border-teal-200">
                                    {inc.raporPredicate}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => onEditCollector(col)}
                                  className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
                                  title="Ubah Beban NO OD"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onViewSlip(col)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                  title="Lihat Slip Insentif"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Detail Accordion NO OD */}
                          {isExpanded && (
                            <tr className="bg-teal-50/30 border-y border-teal-100">
                              <td colSpan={15} className="p-4">
                                <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-2xs space-y-2 text-xs">
                                  <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                                    <span className="font-extrabold text-teal-950 flex items-center gap-1.5">
                                      <ShieldCheck className="w-4 h-4 text-teal-700" />
                                      Rincian Khusus Portofolio NO OVERDUE: {col.name}
                                    </span>
                                    <span className="text-[11px] text-teal-800 font-semibold font-mono">
                                      Beban Awal: {formatRupiah(nBahanAmt)} ({nBahanAct} Akun)
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[11px] pt-1">
                                    <div className="bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                                      <span className="text-teal-900 font-bold block">1. Sisa OS Sore</span>
                                      <div className="font-black text-slate-900 text-xs mt-0.5">{formatRupiah(nSoreAmt)}</div>
                                      <span className="text-[10px] text-teal-700">{nSoreAct} Akun belum tertagih</span>
                                    </div>
                                    <div className="bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                                      <span className="text-teal-900 font-bold block">2. BALL No_OD %</span>
                                      <div className="font-black text-teal-950 text-xs mt-0.5">{formatPercent(col.ballNoOdPct ?? 30.0)}</div>
                                      <span className="text-[10px] text-teal-700">Pencapaian portofolio NO OD</span>
                                    </div>
                                    <div className="bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                                      <span className="text-teal-900 font-bold block">3. Flow No OD (Aktual Sore %)</span>
                                      <div className="font-black text-emerald-800 text-xs mt-0.5">{formatPercent(col.flowNoOdPct ?? 2.5)}</div>
                                      <span className="text-[10px] text-slate-500">Bobot 40% perhitungan Rapor FE</span>
                                    </div>
                                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                      <span className="text-amber-950 font-bold block">4. Akun Angsuran A1-9</span>
                                      <div className="font-black text-amber-950 text-xs mt-0.5">{totalNoodAccounts} Total Akun</div>
                                      <span className="text-[10px] text-amber-800">A1-3: {col.angsuran1_3 || 0} • A1-6: {col.angsuran1_6 || 0} • A1-9: {col.angsuran1_9 || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  {/* Total Cabang NO OD */}
                  <tfoot>
                    <tr className="bg-teal-950 text-white font-extrabold text-xs border-t-2 border-teal-800">
                      <td className="py-3 px-3 text-center text-amber-300">∑</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-white">CABANG PALEMBANG 2</div>
                        <div className="text-[10px] text-teal-300">Total Rekapitulasi Portofolio NO OD</div>
                      </td>
                      <td className="py-3 px-3 text-right bg-teal-900 text-amber-300 font-mono">
                        <div className="font-black">{formatRupiah(totalBebanNoodAmt)}</div>
                        <div className="text-[10px] text-teal-200">{totalBebanNoodAct} Akun NO OD</div>
                      </td>
                      <td className="py-3 px-3 text-center bg-teal-900 text-amber-300 font-black">
                        {formatPercent(avgBallNoOd)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-bold text-white">{formatRupiah(totalAktualSoreNoodAmt)}</div>
                        <div className="text-[10px] text-teal-300">{totalAktualSoreNoodAct} Sisa Akun</div>
                      </td>
                      <td className="py-3 px-3 text-center text-teal-200 font-bold">
                        {formatPercent(avgFlowNoOd)}
                      </td>
                      <td className="py-3 px-3 text-right bg-emerald-900 text-emerald-300 font-mono">
                        <div>{formatRupiah(totalRealisasiNoodAmt)}</div>
                        <div className="text-[10px] text-emerald-200">{recoveryRateNood.toFixed(1)}% Tertagih</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-teal-100">
                        {formatRupiah(noodCollectors.reduce((acc, c) => acc + (c.noodKurangClosing ?? 0), 0))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-teal-100">
                        {formatRupiah(noodCollectors.reduce((acc, c) => acc + (c.noodTargetHarian ?? 0), 0))}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-teal-200">{totalAngsuran13}</td>
                      <td className="py-3 px-3 text-center font-mono text-teal-200">{totalAngsuran16}</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-300 font-black">{totalAngsuran19}</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-300 font-black">{totalAkunNood}</td>
                      <td className="py-3 px-3 text-center text-[10px] text-emerald-300">Target Cabang Aman</td>
                      <td className="py-3 px-3 text-center text-teal-300">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        };

        // Render Table 2: FRONT END (FE 01-30)
        const renderFeTable = () => {
          const list = feCollectors.filter(filterCollectorByKpi);
          return (
            <div className="bg-white rounded-xl shadow-xs border border-blue-300/80 overflow-hidden">
              {/* Header Banner FE */}
              <div className="p-3.5 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-700">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-blue-700 text-blue-200 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-white">
                        TABEL 2: PORTOFOLIO FRONT END (FE 01-30) — PALEMBANG 2
                      </h4>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-blue-100 text-blue-900">
                        {list.length} Kolektor Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200 mt-0.5">
                      Portofolio penagihan harian bucket 01-30 • Beban Awal Rp 304 Jt s/d Rp 1,06 M • Parameter: BTC %, Ball 01-30 %, Stay 01-30 %, Flow Ever %
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-blue-100 flex items-center gap-2">
                  <span>Total Beban: <strong className="text-amber-300 font-mono">{formatRupiah(totalBebanFEAmt)}</strong></span>
                  <span>•</span>
                  <span>{totalBebanFEAct} Akun</span>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-950 text-blue-100 font-bold uppercase tracking-wider text-[11px] border-b border-blue-800 sticky top-0">
                    <tr>
                      <th className="py-3 px-3 text-center w-10 text-blue-300">No</th>
                      <th className="py-3 px-3 min-w-[190px]">Collector &amp; NIK</th>
                      <th className="py-3 px-3 text-right min-w-[145px] bg-blue-900 text-amber-300">
                        Beban Awal FE
                      </th>
                      <th className="py-3 px-3 text-center min-w-[85px] bg-blue-900 text-blue-200">BTC (%)</th>
                      <th className="py-3 px-3 text-right min-w-[145px]">Sisa OS Sore FE</th>
                      <th className="py-3 px-3 text-right min-w-[145px] bg-emerald-950 text-emerald-300 font-bold">
                        Realisasi FE
                      </th>
                      <th className="py-3 px-3 text-right min-w-[130px]">Kurang Closing FE</th>
                      <th className="py-3 px-3 text-right min-w-[120px]">Target Harian FE</th>
                      <th className="py-3 px-3 text-center min-w-[110px] bg-amber-950 text-amber-300">Ball 01-30 (%)</th>
                      <th className="py-3 px-3 text-center min-w-[100px]">Stay 01-30 (%)</th>
                      <th className="py-3 px-3 text-center min-w-[110px] bg-blue-900 text-amber-300 font-bold">Flow Ever (%)</th>
                      <th className="py-3 px-3 text-center min-w-[130px]">Skor &amp; Predikat KPI</th>
                      <th className="py-3 px-3 text-center min-w-[90px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((col, idx) => {
                      const inc = incentives[col.id];
                      const isExpanded = expandedId === `fe-${col.id}`;
                      const recoveryRate = col.bahanAwalAmt > 0 ? ((col.realisasiAmt / col.bahanAwalAmt) * 100).toFixed(1) : '0.0';
                      const akunSelesai = Math.max(0, col.bahanAwalAct - col.aktualSoreAct);
                      const flowEver = col.raporFE?.flowEver ?? 45.0;

                      return (
                        <React.Fragment key={col.id}>
                          <tr className={`hover:bg-blue-50/50 transition-colors ${isExpanded ? 'bg-blue-50/60' : ''}`}>
                            <td className="py-3 px-3 text-center font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : `fe-${col.id}`)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  title="Lihat rincian FE"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    {col.name}
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                                      FE (01-30)
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    NIK: {col.nik}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right bg-blue-50/40">
                              <div className="font-bold text-blue-950 font-mono">
                                {formatRupiah(col.bahanAwalAmt)}
                              </div>
                              <div className="text-[10px] text-blue-700 font-semibold">
                                {col.bahanAwalAct} Kontrak Akun FE
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-bold text-slate-800 text-xs font-mono">
                                {formatPercent(col.btcPct)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="font-bold text-slate-900 font-mono">
                                {formatRupiah(col.aktualSoreAmt)}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {col.aktualSoreAct} Sisa Akun
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right bg-emerald-50/40">
                              <div className="font-bold text-emerald-700 font-mono">
                                {formatRupiah(col.realisasiAmt)}
                              </div>
                              <div className="text-[10px] text-emerald-800 font-semibold">
                                {akunSelesai} Tertagih ({recoveryRate}%)
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-slate-700 font-mono">
                              {formatRupiah(col.kurangClosing)}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-blue-900 font-mono">
                              {formatRupiah(col.targetHarian)}
                            </td>
                            <td className="py-3 px-3 text-center bg-amber-50/30">
                              <span className="font-bold text-slate-800 text-xs">
                                {formatPercent(col.ball0130Pct ?? 0)}
                              </span>
                              <div className="text-[9px] text-slate-400 mt-0.5">Target ≤8.5%</div>
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-700">
                              {formatPercent(col.stayPct ?? 0)}
                            </td>
                            <td className="py-3 px-3 text-center bg-blue-50/30">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                flowEver <= 45
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {formatPercent(flowEver)}
                              </span>
                              <div className="text-[9px] text-slate-400 mt-0.5">Target ≤45%</div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {inc ? (
                                <div>
                                  <div className="font-black text-xs text-slate-900 font-mono">
                                    {inc.raporTotalScore.toFixed(2)}
                                  </div>
                                  <span className="inline-block text-[9px] px-2 py-0.5 rounded-md font-bold mt-0.5 bg-blue-100 text-blue-800 border border-blue-200">
                                    {inc.raporPredicate}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => onEditCollector(col)}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                                  title="Ubah Beban FE"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onViewSlip(col)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                  title="Lihat Slip Insentif"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Detail Accordion FE */}
                          {isExpanded && (
                            <tr className="bg-blue-50/30 border-y border-blue-100">
                              <td colSpan={13} className="p-4">
                                <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs space-y-2 text-xs">
                                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                                    <span className="font-extrabold text-blue-950 flex items-center gap-1.5">
                                      <Layers className="w-4 h-4 text-blue-700" />
                                      Rincian Khusus Portofolio FRONT END: {col.name}
                                    </span>
                                    <span className="text-[11px] text-blue-800 font-semibold font-mono">
                                      Beban Awal: {formatRupiah(col.bahanAwalAmt)} ({col.bahanAwalAct} Akun)
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[11px] pt-1">
                                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                                      <span className="text-blue-900 font-bold block">1. Flow Ever FE</span>
                                      <div className="font-black text-slate-900 text-xs mt-0.5">{formatPercent(flowEver)}</div>
                                      <span className="text-[10px] text-blue-700">Bobot 30% Rapor (Target ≤45%)</span>
                                    </div>
                                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                                      <span className="text-blue-900 font-bold block">2. Ball 01-30 FE</span>
                                      <div className="font-black text-slate-900 text-xs mt-0.5">{formatPercent(col.ball0130Pct ?? 0)}</div>
                                      <span className="text-[10px] text-blue-700">Bobot 30% Rapor (Target ≤8.5%)</span>
                                    </div>
                                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                                      <span className="text-blue-900 font-bold block">3. Flow No OD FE</span>
                                      <div className="font-black text-emerald-800 text-xs mt-0.5">{formatPercent(col.raporFE?.flowNoOd ?? 2.5)}</div>
                                      <span className="text-[10px] text-blue-700">Bobot 40% Rapor (Target ≤2.7%)</span>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                                      <span className="text-emerald-950 font-bold block">4. Realisasi Sore FE</span>
                                      <div className="font-black text-emerald-800 text-xs mt-0.5">{formatRupiah(col.realisasiAmt)}</div>
                                      <span className="text-[10px] text-emerald-700">Sisa OS: {formatRupiah(col.aktualSoreAmt)}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  {/* Total Cabang FE */}
                  <tfoot>
                    <tr className="bg-blue-950 text-white font-extrabold text-xs border-t-2 border-blue-800">
                      <td className="py-3 px-3 text-center text-amber-300">∑</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-white">CABANG PALEMBANG 2</div>
                        <div className="text-[10px] text-blue-300">Total Rekapitulasi Portofolio FE</div>
                      </td>
                      <td className="py-3 px-3 text-right bg-blue-900 text-amber-300 font-mono">
                        <div className="font-black">{formatRupiah(totalBebanFEAmt)}</div>
                        <div className="text-[10px] text-blue-200">{totalBebanFEAct} Akun FE</div>
                      </td>
                      <td className="py-3 px-3 text-center bg-blue-900 text-amber-300 font-bold">
                        {formatPercent(avgBtcFE)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-bold text-white">{formatRupiah(totalAktualSoreFEAmt)}</div>
                        <div className="text-[10px] text-blue-300">{totalAktualSoreFEAct} Sisa Akun</div>
                      </td>
                      <td className="py-3 px-3 text-right bg-emerald-900 text-emerald-300 font-mono">
                        <div>{formatRupiah(totalRealisasiFEAmt)}</div>
                        <div className="text-[10px] text-emerald-200">{recoveryRateFE.toFixed(1)}% Tertagih</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-blue-100">
                        {formatRupiah(feCollectors.reduce((acc, c) => acc + c.kurangClosing, 0))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-blue-100">
                        {formatRupiah(feCollectors.reduce((acc, c) => acc + c.targetHarian, 0))}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-blue-200">
                        {formatPercent(avgBall0130FE)}
                      </td>
                      <td className="py-3 px-3 text-center text-blue-300">
                        {formatPercent(feCollectors.reduce((acc, c) => acc + (c.stayPct ?? 0), 0) / (feCollectors.length || 1))}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-300">
                        {formatPercent(avgFlowEverFE)}
                      </td>
                      <td className="py-3 px-3 text-center text-[10px] text-emerald-300">Target Cabang Aman</td>
                      <td className="py-3 px-3 text-center text-blue-300">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        };

        // Render Table 3: MID RANGE (MR 31-60)
        const renderMrTable = () => {
          const list = mrCollectors.filter(filterCollectorByKpi);
          return (
            <div className="bg-white rounded-xl shadow-xs border border-purple-300/80 overflow-hidden">
              {/* Header Banner MR */}
              <div className="p-3.5 bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-700">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-purple-700 text-purple-200 rounded-lg">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-white">
                        TABEL 3: PORTOFOLIO MID RANGE (MR 31-60) — PALEMBANG 2
                      </h4>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-purple-100 text-purple-900">
                        {list.length} Kolektor Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-200 mt-0.5">
                      Portofolio penagihan bucket 31-60 hari • Beban Awal Rp 354 Jt s/d Rp 526 Jt • Parameter: Delq 30+ %, Ball 31-60 %, Success Rate MR %
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-purple-100 flex items-center gap-2">
                  <span>Total Beban: <strong className="text-amber-300 font-mono">{formatRupiah(totalBebanMRAmt)}</strong></span>
                  <span>•</span>
                  <span>{totalBebanMRAct} Akun</span>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-950 text-purple-100 font-bold uppercase tracking-wider text-[11px] border-b border-purple-800 sticky top-0">
                    <tr>
                      <th className="py-3 px-3 text-center w-10 text-purple-300">No</th>
                      <th className="py-3 px-3 min-w-[190px]">Collector &amp; NIK</th>
                      <th className="py-3 px-3 text-right min-w-[145px] bg-purple-900 text-amber-300">
                        Beban Awal MR
                      </th>
                      <th className="py-3 px-3 text-right min-w-[145px]">Sisa OS Sore MR</th>
                      <th className="py-3 px-3 text-right min-w-[145px] bg-emerald-950 text-emerald-300 font-bold">
                        Realisasi MR
                      </th>
                      <th className="py-3 px-3 text-right min-w-[130px]">Kurang Closing MR</th>
                      <th className="py-3 px-3 text-right min-w-[120px]">Target Harian MR</th>
                      <th className="py-3 px-3 text-center min-w-[100px]">Delq 30+ (%)</th>
                      <th className="py-3 px-3 text-center min-w-[100px]">Ball 31-60 (%)</th>
                      <th className="py-3 px-3 text-center min-w-[135px] bg-emerald-900 text-emerald-200 font-black">
                        Success Rate MR (%)
                      </th>
                      <th className="py-3 px-3 text-center min-w-[130px]">Skor &amp; Predikat KPI</th>
                      <th className="py-3 px-3 text-center min-w-[90px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((col, idx) => {
                      const inc = incentives[col.id];
                      const isExpanded = expandedId === `mr-${col.id}`;
                      const recoveryRate = col.bahanAwalAmt > 0 ? ((col.realisasiAmt / col.bahanAwalAmt) * 100).toFixed(1) : '0.0';
                      const akunSelesai = Math.max(0, col.bahanAwalAct - col.aktualSoreAct);

                      return (
                        <React.Fragment key={col.id}>
                          <tr className={`hover:bg-purple-50/50 transition-colors ${isExpanded ? 'bg-purple-50/60' : ''}`}>
                            <td className="py-3 px-3 text-center font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : `mr-${col.id}`)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  title="Lihat rincian MR"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-purple-700" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    {col.name}
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                                      MR (31-60)
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    NIK: {col.nik}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right bg-purple-50/40">
                              <div className="font-bold text-purple-950 font-mono">
                                {formatRupiah(col.bahanAwalAmt)}
                              </div>
                              <div className="text-[10px] text-purple-700 font-semibold">
                                {col.bahanAwalAct} Kontrak Akun MR
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="font-bold text-slate-900 font-mono">
                                {formatRupiah(col.aktualSoreAmt)}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {col.aktualSoreAct} Sisa Kontrak
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right bg-emerald-50/40">
                              <div className="font-bold text-emerald-700 font-mono">
                                {formatRupiah(col.realisasiAmt)}
                              </div>
                              <div className="text-[10px] text-emerald-800 font-semibold">
                                {akunSelesai} Tertagih ({recoveryRate}%)
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-slate-700 font-mono">
                              {formatRupiah(col.kurangClosing)}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-purple-900 font-mono">
                              {formatRupiah(col.targetHarian)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-700">
                              {formatPercent(col.delq30Pct ?? 0)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-700">
                              {formatPercent(col.ball3160Pct ?? 0)}
                            </td>
                            <td className="py-3 px-3 text-center bg-emerald-50 font-black text-emerald-800">
                              {formatPercent(col.successRateMRPct ?? 35.0)}
                              <div className="text-[9px] text-emerald-700 mt-0.5">Target ≥30%</div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {inc ? (
                                <div>
                                  <div className="font-black text-xs text-slate-900 font-mono">
                                    {inc.raporTotalScore.toFixed(2)}
                                  </div>
                                  <span className="inline-block text-[9px] px-2 py-0.5 rounded-md font-bold mt-0.5 bg-purple-100 text-purple-800 border border-purple-200">
                                    {inc.raporPredicate}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => onEditCollector(col)}
                                  className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer"
                                  title="Ubah Beban MR"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onViewSlip(col)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                  title="Lihat Slip Insentif"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Detail Accordion MR */}
                          {isExpanded && (
                            <tr className="bg-purple-50/30 border-y border-purple-100">
                              <td colSpan={12} className="p-4">
                                <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs space-y-2 text-xs">
                                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                                    <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
                                      <BarChart2 className="w-4 h-4 text-purple-700" />
                                      Rincian Khusus Portofolio MID RANGE: {col.name}
                                    </span>
                                    <span className="text-[11px] text-purple-800 font-semibold font-mono">
                                      Beban Awal: {formatRupiah(col.bahanAwalAmt)} ({col.bahanAwalAct} Akun)
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[11px] pt-1">
                                    <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                                      <span className="text-purple-900 font-bold block">1. Success Rate MR</span>
                                      <div className="font-black text-emerald-800 text-xs mt-0.5">{formatPercent(col.successRateMRPct ?? 35.0)}</div>
                                      <span className="text-[10px] text-purple-700">Rollback + BTC + Pelunasan (≥30%)</span>
                                    </div>
                                    <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                                      <span className="text-purple-900 font-bold block">2. Ball 31-60</span>
                                      <div className="font-black text-slate-900 text-xs mt-0.5">{formatPercent(col.ball3160Pct ?? 0)}</div>
                                      <span className="text-[10px] text-purple-700">Target Ball MR ≤1.5%</span>
                                    </div>
                                    <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                                      <span className="text-purple-900 font-bold block">3. Delq 30+</span>
                                      <div className="font-black text-slate-900 text-xs mt-0.5">{formatPercent(col.delq30Pct ?? 0)}</div>
                                      <span className="text-[10px] text-purple-700">Rasio tunggakan bucket 30+</span>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                                      <span className="text-emerald-950 font-bold block">4. Realisasi Sore MR</span>
                                      <div className="font-black text-emerald-800 text-xs mt-0.5">{formatRupiah(col.realisasiAmt)}</div>
                                      <span className="text-[10px] text-emerald-700">Sisa OS: {formatRupiah(col.aktualSoreAmt)}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  {/* Total Cabang MR */}
                  <tfoot>
                    <tr className="bg-purple-950 text-white font-extrabold text-xs border-t-2 border-purple-800">
                      <td className="py-3 px-3 text-center text-amber-300">∑</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-white">CABANG PALEMBANG 2</div>
                        <div className="text-[10px] text-purple-300">Total Rekapitulasi Portofolio MR</div>
                      </td>
                      <td className="py-3 px-3 text-right bg-purple-900 text-amber-300 font-mono">
                        <div className="font-black">{formatRupiah(totalBebanMRAmt)}</div>
                        <div className="text-[10px] text-purple-200">{totalBebanMRAct} Akun MR</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-bold text-white">{formatRupiah(totalAktualSoreMRAmt)}</div>
                        <div className="text-[10px] text-purple-300">{mrCollectors.reduce((acc, c) => acc + c.aktualSoreAct, 0)} Sisa Akun</div>
                      </td>
                      <td className="py-3 px-3 text-right bg-emerald-900 text-emerald-300 font-mono">
                        <div>{formatRupiah(totalRealisasiMRAmt)}</div>
                        <div className="text-[10px] text-emerald-200">
                          {totalBebanMRAmt > 0 ? ((totalRealisasiMRAmt / totalBebanMRAmt) * 100).toFixed(1) : 0}% Tertagih
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-purple-100">
                        {formatRupiah(mrCollectors.reduce((acc, c) => acc + c.kurangClosing, 0))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-purple-100">
                        {formatRupiah(mrCollectors.reduce((acc, c) => acc + c.targetHarian, 0))}
                      </td>
                      <td className="py-3 px-3 text-center text-purple-200 font-mono">
                        {formatPercent(mrCollectors.reduce((acc, c) => acc + (c.delq30Pct ?? 0), 0) / (mrCollectors.length || 1))}
                      </td>
                      <td className="py-3 px-3 text-center text-purple-200 font-mono">
                        {formatPercent(avgBalanceMR)}
                      </td>
                      <td className="py-3 px-3 text-center bg-emerald-900 text-emerald-300 font-bold">
                        {formatPercent(avgSuccessRateMR)}
                      </td>
                      <td className="py-3 px-3 text-center text-[10px] text-purple-200">Target Cabang ≥30%</td>
                      <td className="py-3 px-3 text-center text-purple-300">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        };

        // Render matching user selection: either single table or all 3 stacked
        return (
          <div className="space-y-6">
            {(selectedRole === 'NOOD' || selectedRole === 'ALL') && renderNoodTable()}
            {(selectedRole === 'FE' || selectedRole === 'ALL') && renderFeTable()}
            {(selectedRole === 'MR' || selectedRole === 'ALL') && renderMrTable()}
          </div>
        );
      })()}
    </div>
  );
};
