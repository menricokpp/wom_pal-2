import React, { useState } from 'react';
import { 
  CollectorRecord, 
  IncentiveCalculationResult, 
  CalculationMode 
} from '../types';
import { 
  formatRupiah, 
  formatNumber, 
  formatPercent 
} from '../utils/calculations';
import { 
  formatIndonesianFullDate, 
  formatIndonesianDateShort, 
  getMilestoneDetails 
} from '../utils/dateUtils';
import { useHorizontalScroll } from '../utils/useHorizontalScroll';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  HelpCircle,
  Calendar,
  Sparkles,
  Info,
  Check,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Users,
  ShieldCheck
} from 'lucide-react';

interface SegmentDashboardProps {
  collectors: CollectorRecord[];
  incentives: Record<string, IncentiveCalculationResult>;
  calculationMode: CalculationMode;
  onToggleCalculationMode: (mode: CalculationMode) => void;
  onEditCollector: (collector: CollectorRecord) => void;
  onViewSlip: (collector: CollectorRecord) => void;
  onOpenExcelUpload?: () => void;
  currentDate?: Date;
}

export const SegmentDashboard: React.FC<SegmentDashboardProps> = ({
  collectors,
  incentives,
  calculationMode,
  onToggleCalculationMode,
  onEditCollector,
  onViewSlip,
  onOpenExcelUpload,
  currentDate,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | 'FE' | 'MR' | 'NOOD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const activeDate = currentDate || new Date();
  const milestone = getMilestoneDetails(activeDate);

  // Horizontal mouse wheel and drag-to-scroll hook
  const {
    containerRef,
    scrollLeftBy,
    canScrollLeft,
    canScrollRight,
    scrollProgress,
    hasOverflow,
  } = useHorizontalScroll<HTMLDivElement>({ speed: 1.3, enableDrag: true });

  // Filter collectors: strictly only CO (exclude any Cabang/Total)
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

  const filteredCollectors = coOnly.filter((col) => {
    // Segment filter: FE 01-30, MR 31-60, and NOOD
    if (selectedSegment === 'FE' && col.primaryRole !== 'FE') return false;
    if (selectedSegment === 'MR' && col.primaryRole !== 'MR') return false;
    if (selectedSegment === 'NOOD') {
      const isMR = col.primaryRole === 'MR' || col.name.toUpperCase().includes('EMIR') || col.name.toUpperCase().includes('GILANG');
      if (isMR) return false;
      const isNood = col.primaryRole === 'NOOD' || col.primaryRole === 'FE';
      if (!isNood) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        col.name.toLowerCase().includes(q) ||
        col.nik.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate sorted rankings by Aktual Sore Amt descending
  const sortedCollectors = [...filteredCollectors].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    const aVal = selectedSegment === 'NOOD' ? (a.noodAktualSoreAmt ?? a.aktualSoreAmt) : a.aktualSoreAmt;
    const bVal = selectedSegment === 'NOOD' ? (b.noodAktualSoreAmt ?? b.aktualSoreAmt) : b.aktualSoreAmt;
    return bVal - aVal;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const isNoodView = selectedSegment === 'NOOD';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden mb-6">
      {/* Explainer / Mode Switcher Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-blue-800">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Transparansi Perhitungan Insentif 4 Komponen</span>
          </div>
          <h3 className="text-sm font-extrabold text-white">
            Monitoring Penagihan & Insentif Kolektor Real-Time
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            Total Insentif = Penyelesaian + Tarik Unit + BTC/Success (Syarat Pencairan: <strong>Rapor Minimal On Target</strong>)
          </p>
        </div>

        {/* Calculation Mode Switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-blue-900/80 p-1 rounded-xl border border-blue-700/80 flex items-center space-x-1">
            <button
              onClick={() => onToggleCalculationMode('current_date')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                calculationMode === 'current_date'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-extrabold ring-1 ring-amber-300'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Hanya menghitung milestone yang sudah aktif berjalan sampai hari ini (W1 tgl 7)"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Realistis Hari Ini (W1)</span>
            </button>
            <button
              onClick={() => onToggleCalculationMode('full_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                calculationMode === 'full_month'
                  ? 'bg-amber-400 text-blue-950 shadow-md font-extrabold ring-1 ring-amber-300'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Menghitung akumulasi proyeksi jika seluruh milestone W1 s/d W4 tercapai"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Proyeksi Full Bulan (W1-W4)</span>
            </button>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-blue-200 hover:text-white border border-blue-600 transition-colors cursor-pointer"
            title="Klik untuk panduan cara membaca insentif"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Explainer Box */}
      {showGuide && (
        <div className="bg-blue-50/90 border-b border-blue-200 p-4 text-xs text-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-blue-950">
            <span className="flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-blue-700" />
              Panduan Membaca Nilai Insentif (Mengapa Angka Berbeda?)
            </span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕ Tutup
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
            <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-2xs">
              <strong className="text-blue-900 block mb-1 text-xs">
                1. Mengapa Nilai Insentif Hari Ini Berbeda dengan Proyeksi?
              </strong>
              <p className="text-slate-600">
                Hari ini adalah <strong>{formatIndonesianFullDate(activeDate)}</strong>. Sesuai matriks WOM Finance, cut-off milestone bertahap:
                <br />• <strong>{milestone.label}</strong> ({milestone.description})
                <br />• Cut-off milestone bulanan: W1 (Tgl 7), W2 (Tgl 14), W3 (Tgl 21), W4 (Tgl 28).
                <br />Dalam mode <em>"Realistis Hari Ini ({milestone.activeWeek})"</em>, sistem menghitung milestone aktif berjalan sehingga nominalnya realistis. Jika ingin melihat potensi penuh bila seluruh target W1-W4 tembus, aktifkan mode <em>"Proyeksi Full Bulan"</em>.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-2xs">
              <strong className="text-blue-900 block mb-1 text-xs">
                2. Rincian 4 Pilar Insentif Resmi WOM Finance 2026:
              </strong>
              <ul className="text-slate-600 space-y-1 list-disc pl-4">
                <li>
                  <strong>Pilar 1:</strong> Insentif Penyelesaian Mingguan disesuaikan %DKH (≥95%: 100%, 75-95%: 75%, &lt;75%: 0%).
                </li>
                <li>
                  <strong>Pilar 2:</strong> Tarik Barang (Motor @Rp 200k, Mobil @Rp 500k) disesuaikan BASTK (100% / 75%).
                </li>
                <li>
                  <strong>Pilar 3:</strong> Insentif BTC / Success Rate &gt;30% (+Rp 350.000).
                </li>
                <li>
                  <strong className="text-emerald-700">Pilar 4 (Ketentuan Rapor):</strong> Syarat Pencairan Insentif: Rapor Minimal ON TARGET (Skor &ge; 3.00). Tidak ada penambahan nominal uang tiering dari rapor; insentif operasional (Penyelesaian, Tarik Barang, BTC/Success) dibayarkan penuh jika On Target ke atas, atau ditahan (Rp 0) jika di bawah On Target.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Segment Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSegment('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSegment === 'ALL'
                ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-900'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Segmen ({coOnly.length} CO)
          </button>
          <button
            onClick={() => setSelectedSegment('FE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSegment === 'FE'
                ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-900'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Front End (FE 01-30) ({coOnly.filter((c) => c.primaryRole === 'FE').length} CO)
          </button>
          <button
            onClick={() => setSelectedSegment('MR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSegment === 'MR'
                ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-900'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Mid Range (MR 31-60) ({coOnly.filter((c) => c.primaryRole === 'MR').length} CO)
          </button>
          <button
            onClick={() => setSelectedSegment('NOOD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              selectedSegment === 'NOOD'
                ? 'bg-teal-700 text-white shadow-sm ring-1 ring-teal-800'
                : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
            }`}
            title="Lihat portofolio khusus CO NOOD (No Overdue / Angsuran 1-3, 1-6, 1-9 & Ball NO_OD)"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-0.5 text-amber-300" />
            <span>CO NOOD ({coOnly.filter((c) => c.primaryRole === 'NOOD' || c.ballNoOdPct !== undefined).length} CO)</span>
          </button>
        </div>

        {/* Search Field & Upload Excel Shortcut */}
        <div className="flex items-center space-x-2">
          {onOpenExcelUpload && (
            <button
              onClick={onOpenExcelUpload}
              className="hidden sm:flex items-center text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title="Upload file Excel monitoring asli (.xlsx / .xls) untuk update otomatis"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Upload Excel Anda</span>
            </button>
          )}

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Helper Bar */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-blue-950 bg-blue-100/80 px-2.5 py-1 rounded-md text-[11px] border border-blue-200/60">
            <MoveHorizontal className="w-3.5 h-3.5 text-blue-700" />
            Scroll Samping Mouse Aktif
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            💡 Putar roda mouse (scroll wheel) atau klik & drag tabel untuk geser ke kanan tanpa panah scrollbar
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasOverflow && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 mr-2">
              <span>Posisi Kolom:</span>
              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-700 rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(12, scrollProgress)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] font-semibold text-slate-700">{scrollProgress}%</span>
            </div>
          )}

          <button
            onClick={() => scrollLeftBy(-320)}
            disabled={!canScrollLeft}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-white hover:bg-blue-50 text-blue-900 border-slate-300 shadow-2xs'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            }`}
            title="Geser tabel ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Geser Kiri</span>
          </button>

          <button
            onClick={() => scrollLeftBy(320)}
            disabled={!canScrollRight}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-blue-900 hover:bg-blue-800 text-white border-blue-950 shadow-sm ring-1 ring-blue-700'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            }`}
            title="Geser tabel ke kanan untuk melihat rincian kolom insentif"
          >
            <span>Geser Kanan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="relative">
        {/* Left scroll shadow fade */}
        {canScrollLeft && (
          <div 
            onClick={() => scrollLeftBy(-300)}
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/10 to-transparent z-10 cursor-pointer pointer-events-none" 
          />
        )}

        {/* Right scroll shadow fade & prompt */}
        {canScrollRight && (
          <div 
            onClick={() => scrollLeftBy(300)}
            className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-blue-950/20 to-transparent z-10 flex items-center justify-end pr-1 cursor-pointer pointer-events-none"
            title="Ada kolom lebih lanjut di kanan, putar roda mouse atau geser"
          >
            <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-md">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        <div 
          ref={containerRef}
          className="overflow-x-auto cursor-grab active:cursor-grabbing"
        >
          <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 sticky top-0">
            <tr>
              <th className="py-3 px-3 text-center w-12">Rank</th>
              <th className="py-3 px-3 min-w-[180px]">Collector & NIK</th>
              <th className="py-3 px-3 text-right min-w-[130px] bg-blue-50/50">
                <div className="flex items-center justify-end gap-1 text-blue-950 font-bold">
                  <span>{isNoodView ? 'Beban Awal NOOD' : 'Beban Awal'}</span>
                  <Edit3 className="w-3 h-3 text-blue-600" />
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[130px]">
                <div className="flex flex-col items-end">
                  <span>{isNoodView ? 'Sisa OS NOOD (Sore)' : 'Sisa OS (Sore)'}</span>
                  <span className="text-[9px] font-normal text-slate-400 lowercase">belum selesai</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[130px] bg-emerald-50/60 text-emerald-950">
                <div className="flex flex-col items-end">
                  <span className="font-bold">{isNoodView ? 'Realisasi NOOD' : 'Realisasi Tertagih'}</span>
                  <span className="text-[9px] font-normal text-emerald-700 lowercase">penyelesaian W1</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right min-w-[120px]">{isNoodView ? 'Kurang Closing NOOD' : 'Kurang Closing'}</th>
              <th className="py-3 px-3 text-right min-w-[100px]">{isNoodView ? 'Target Harian NOOD' : 'Target Harian'}</th>
              <th className="py-3 px-3 text-center min-w-[90px]">{isNoodView ? 'BALL No_OD & Flow' : 'BTC / Delq'}</th>
              <th className="py-3 px-3 text-center min-w-[120px]">Rapor 2026</th>
              <th className="py-3 px-3 text-right min-w-[140px]">
                {calculationMode === 'current_date' ? 'Insentif Berjalan (W1)' : 'Proyeksi Full Insentif'}
              </th>
              <th className="py-3 px-3 text-center min-w-[90px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedCollectors.map((col, idx) => {
              const inc = incentives[col.id];
              const isExpanded = expandedId === col.id;

              // Read dedicated NOOD values if in NOOD view
              const displayBahanAmt = isNoodView ? (col.noodBahanAmt ?? col.bahanAwalAmt) : col.bahanAwalAmt;
              const displayBahanAct = isNoodView ? (col.noodBahanAct ?? col.bahanAwalAct) : col.bahanAwalAct;
              const displaySoreAmt = isNoodView 
                ? (col.noodAktualSoreAmt ?? (col.noodBahanAmt ? Math.max(0, col.noodBahanAmt - (col.noodRealisasiAmt ?? 0)) : col.aktualSoreAmt))
                : col.aktualSoreAmt;
              const displaySoreAct = isNoodView ? (col.noodAktualSoreAct ?? col.aktualSoreAct) : col.aktualSoreAct;
              const displayRealAmt = isNoodView 
                ? (col.noodRealisasiAmt ?? (col.noodBahanAmt ? Math.max(0, displayBahanAmt - displaySoreAmt) : col.realisasiAmt))
                : col.realisasiAmt;
              const displayKurangClosing = isNoodView ? (col.noodKurangClosing ?? col.kurangClosing) : col.kurangClosing;
              const displayTargetHarian = isNoodView ? (col.noodTargetHarian ?? col.targetHarian) : col.targetHarian;
              const displayAkunSelesai = Math.max(0, displayBahanAct - displaySoreAct);
              const displayW1 = displayBahanAmt > 0 ? Number(((displayRealAmt / displayBahanAmt) * 100).toFixed(1)) : col.weeklyProgress.w1;
              const hasPositiveClosing = displayKurangClosing > 0;

              return (
                <React.Fragment key={col.id}>
                  <tr
                    className={`hover:bg-blue-50/40 transition-colors ${
                      !col.isActive ? 'opacity-60 bg-slate-50' : ''
                    } ${isExpanded ? 'bg-blue-50/50' : ''}`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      {col.isActive ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-blue-950 ring-2 ring-amber-300'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-700/80 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">#N/A</span>
                      )}
                    </td>

                    {/* Collector Name & Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleExpand(col.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Klik untuk detail breakdown"
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
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                                col.primaryRole === 'NOOD'
                                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                  : col.primaryRole === 'FE'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}
                            >
                              {col.primaryRole === 'NOOD' ? 'NOOD' : (isNoodView ? `${col.primaryRole} (NOOD)` : col.primaryRole)}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            NIK: {col.nik}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Beban Awal (Editable) */}
                    <td className={`py-3 px-3 text-right ${isNoodView ? 'bg-teal-50/30' : 'bg-blue-50/20'}`}>
                      <div className="flex items-center justify-end gap-1.5 group">
                        <div className="text-right">
                          <div className={`font-semibold ${isNoodView ? 'text-teal-950 font-bold' : 'text-slate-800'}`}>
                            {formatRupiah(displayBahanAmt)}
                          </div>
                          <div className={`text-[10px] ${isNoodView ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                            {displayBahanAct} Kontrak
                          </div>
                        </div>
                        <button
                          onClick={() => onEditCollector(col)}
                          className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Klik untuk ubah Beban Awal kolektor ini"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Sisa OS (Aktual Sore) */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-semibold text-slate-800">
                        {formatRupiah(displaySoreAmt)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {displaySoreAct} Akun Sisa
                      </div>
                    </td>

                    {/* Realisasi Tertagih */}
                    <td className="py-3 px-3 text-right bg-emerald-50/20">
                      <div className={`font-bold ${displayRealAmt === 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {formatRupiah(displayRealAmt)}
                      </div>
                      <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                        {displayAkunSelesai} Akun ({displayW1}%)
                      </div>
                    </td>

                    {/* Kurang Closing */}
                    <td className="py-3 px-3 text-right">
                      <div
                        className={`font-semibold ${
                          hasPositiveClosing
                            ? 'text-emerald-600 font-bold'
                            : 'text-red-500'
                        }`}
                      >
                        {formatRupiah(displayKurangClosing)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {hasPositiveClosing ? 'Surplus Closing' : 'Defisit Closing'}
                      </div>
                    </td>

                    {/* Target Harian */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-medium text-slate-700">
                        {formatRupiah(displayTargetHarian)}
                      </div>
                    </td>

                    {/* BTC / Delq / NOOD */}
                    <td className="py-3 px-3 text-center">
                      {isNoodView ? (
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${
                            (col.ballNoOdPct ?? 96) >= 97
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}>
                            {formatPercent(col.ballNoOdPct ?? 96.0)}
                          </span>
                          <div className="text-[9px] text-teal-700 font-semibold mt-0.5">
                            Flow: {formatPercent(col.flowNoOdPct ?? col.raporFE?.flowNoOd ?? 2.5)}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              col.btcPct > 30
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {formatPercent(col.btcPct)}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {col.primaryRole === 'FE' ? 'BTC 1-30' : 'BTC MR'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Rapor Predicate & Status Payout */}
                    <td className="py-3 px-3 text-center">
                      {inc ? (
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inc.raporPredicate === 'Exceptional'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : inc.raporPredicate === 'Exceed Target'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : inc.raporPredicate === 'On Target'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {inc.raporPredicate}
                          </span>
                          <div className={`text-[10px] font-bold mt-0.5 ${inc.isEligiblePayout ? 'text-emerald-700' : 'text-red-600'}`}>
                            {inc.isEligiblePayout ? '✓ DIBAYARKAN' : '✕ DI BAWAH TARGET'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Estimasi Insentif */}
                    <td className="py-3 px-3 text-right">
                      {inc ? (
                        <div>
                          <div className={`text-sm font-black ${inc.isEligiblePayout ? 'text-blue-900' : 'text-slate-400 line-through'}`}>
                            {formatRupiah(inc.grandTotal)}
                          </div>
                          <div className="flex items-center justify-end text-[10px] gap-1 text-slate-500">
                            {inc.isEligiblePayout ? (
                              <span>Akumulasi: {formatRupiah(inc.accruedTotal)}</span>
                            ) : (
                              <span className="text-red-500 font-semibold">Hold: butuh Rapor On Target</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onEditCollector(col)}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-900 transition-colors cursor-pointer"
                          title="Update data harian collector"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewSlip(col)}
                          className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-100 hover:text-emerald-900 transition-colors cursor-pointer"
                          title="Lihat Slip & Rapor Lengkap"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Accordion: 4 PILAR DETAIL */}
                  {isExpanded && inc && (
                    <tr className="bg-slate-50/90 border-y border-blue-100">
                      <td colSpan={11} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                          {/* 1. Milestone Penyelesaian Mingguan */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2">
                              <span>1. Penyelesaian Mingguan</span>
                              <span className="text-blue-600 font-extrabold">
                                {formatRupiah(inc.penyelesaianAdjusted)}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                                <span className="text-slate-600">W1 (tgl 7) - {col.weeklyProgress.w1}%:</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(inc.w1Incentive)}</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                                <span className="text-slate-600">W2 (tgl 14) - {col.weeklyProgress.w2}%:</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(inc.w2Incentive)}</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                                <span className="text-slate-600">W3 (tgl 21) - {col.weeklyProgress.w3}%:</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(inc.w3Incentive)}</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600">W4 (tgl 28) - {col.weeklyProgress.w4}%:</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(inc.w4Incentive)}</span>
                              </div>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
                              <span>Total Penyelesaian:</span>
                              <span className="font-semibold text-blue-900">{formatRupiah(inc.penyelesaianAdjusted)}</span>
                            </div>
                          </div>

                          {/* 2. Tarik Barang & BASTK */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2">
                              <span>2. Tarik Unit & BASTK</span>
                              <span className="text-indigo-600 font-extrabold">
                                {formatRupiah(inc.tarikBarangAdjusted)}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                                <span className="text-slate-600">Motor ({col.unitTarikan.motor} unit @200k):</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(inc.motorIncentive)}</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                                <span className="text-slate-600">Mobil ({col.unitTarikan.mobil} unit @500k):</span>
                                <span className="font-semibold text-slate-800">{formatRupiah(inc.mobilIncentive)}</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600">BASTK Status:</span>
                                <span className="font-semibold capitalize text-slate-700">
                                  {col.bastkStatus.replace('_', ' ')} ({inc.bastkMultiplier * 100}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 3. BTC / Success Rate */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2">
                              <span>3. Insentif BTC / Success</span>
                              <span className="text-emerald-700 font-extrabold">
                                {formatRupiah(inc.btcOrSuccessRateIncentive)}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                                <span className="text-slate-600">Pencapaian:</span>
                                <span className="font-bold text-slate-800">{col.btcPct}%</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                                <span className="text-slate-600">Syarat:</span>
                                <span className="text-slate-500">&gt; 30% (+350k)</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5">
                                <span className="text-slate-600">Status:</span>
                                <span className={`font-bold ${inc.btcQualified ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {inc.btcQualified ? 'Memenuhi Syarat' : 'Belum Mencapai'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Insentif Rapor (KETENTUAN BARU) */}
                          <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-200 shadow-2xs">
                            <div className="flex items-center justify-between font-bold text-purple-950 text-xs mb-2">
                              <span>4. Insentif Rapor (Baru)</span>
                              <span className="text-purple-700 font-extrabold">
                                +{formatRupiah(inc.insentifRapor)}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between items-center py-0.5 border-b border-purple-100">
                                <span className="text-purple-900">Skor KPI Rapor:</span>
                                <span className="font-bold text-purple-950">{inc.raporTotalScore} / 5.0</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5 border-b border-purple-100">
                                <span className="text-purple-900">Predikat:</span>
                                <span className="font-bold text-purple-950">{inc.raporPredicate}</span>
                              </div>
                              <div className="flex justify-between items-center py-0.5">
                                <span className="text-purple-900">Nominal Rapor:</span>
                                <span className="font-extrabold text-emerald-700">
                                  {formatRupiah(inc.insentifRapor)}
                                </span>
                              </div>
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
        </table>
        </div>
      </div>

      {/* Table Footer info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex flex-wrap items-center justify-between gap-2">
        <span>Menampilkan {sortedCollectors.length} Collector Cabang Palembang 2</span>
        <span className="text-[11px] italic">
          * Mode Aktif: {calculationMode === 'current_date' ? `Realistis Berjalan Hari Ini (${formatIndonesianDateShort(activeDate)} / ${milestone.activeWeek})` : 'Proyeksi Full Bulan (W1-W4)'}. Formula: Penyelesaian + (Tarik Unit × BASTK) + BTC + Insentif Rapor (penyesuaian dihitung otomatis).
        </span>
      </div>
    </div>
  );
};
