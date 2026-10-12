import React from 'react';
import { 
  TrendingUp, 
  Coins, 
  Award, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Users
} from 'lucide-react';
import { CollectorRecord, IncentiveCalculationResult } from '../types';
import { formatRupiah, formatNumber, formatPercent } from '../utils/calculations';

interface ExecutiveSummaryProps {
  collectors: CollectorRecord[];
  incentives: Record<string, IncentiveCalculationResult>;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  collectors,
  incentives,
}) => {
  const activeCollectors = collectors.filter((c) => c.isActive);

  // Aggregate metrics
  const totalBahanAwalAmt = collectors.reduce((acc, c) => acc + c.bahanAwalAmt, 0);
  const totalBahanAwalAct = collectors.reduce((acc, c) => acc + c.bahanAwalAct, 0);

  const totalAktualSoreAmt = collectors.reduce((acc, c) => acc + c.aktualSoreAmt, 0);
  const totalAktualSoreAct = collectors.reduce((acc, c) => acc + c.aktualSoreAct, 0);

  const totalRealisasiAmt = collectors.reduce((acc, c) => acc + c.realisasiAmt, 0);
  const totalRealisasiAct = collectors.reduce((acc, c) => acc + Math.max(0, c.bahanAwalAct - c.aktualSoreAct), 0);

  const totalKurangClosing = collectors.reduce((acc, c) => acc + c.kurangClosing, 0);
  const totalTargetHarian = collectors.reduce((acc, c) => acc + c.targetHarian, 0);

  const totalInsentif = Object.values(incentives).reduce(
    (acc, inc) => acc + (inc.isEligiblePayout ? inc.grandTotal : 0),
    0
  );

  const totalMotor = collectors.reduce((acc, c) => acc + c.unitTarikan.motor, 0);
  const totalMobil = collectors.reduce((acc, c) => acc + c.unitTarikan.mobil, 0);

  const avgDkh = activeCollectors.length
    ? activeCollectors.reduce((acc, c) => acc + c.dkhPct, 0) / activeCollectors.length
    : 0;

  const avgBtc = activeCollectors.length
    ? activeCollectors.reduce((acc, c) => acc + c.btcPct, 0) / activeCollectors.length
    : 0;

  // Best performer based on total incentive earned
  let topCollectorName = '-';
  let maxInsentif = 0;
  for (const c of activeCollectors) {
    const inc = incentives[c.id];
    if (inc && inc.grandTotal > maxInsentif) {
      maxInsentif = inc.grandTotal;
      topCollectorName = c.name;
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Bahan Awal Cabang */}
      <div className="bg-white rounded-xl p-4.5 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase">Portfolio Bahan Awal</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-slate-900 tracking-tight">
          {formatRupiah(totalBahanAwalAmt)}
        </div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center">
            <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Total Akun
          </span>
          <span className="font-bold text-slate-700">{formatNumber(totalBahanAwalAct)} Kontrak</span>
        </div>
      </div>

      {/* 2. Realisasi Penyelesaian Hari Ini */}
      <div className="bg-white rounded-xl p-4.5 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase">Realisasi Penyelesaian</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-emerald-600 tracking-tight">
          {formatRupiah(totalRealisasiAmt)}
        </div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <span>Tertagih Hari Ini</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded" title={`Sisa OS Sore: ${formatRupiah(totalAktualSoreAmt)} (${totalAktualSoreAct} akun)`}>
            {formatNumber(totalRealisasiAct)} Kontrak ({formatRupiah(totalRealisasiAmt)})
          </span>
        </div>
      </div>

      {/* 3. Estimasi Insentif Tim */}
      <div className="bg-white rounded-xl p-4.5 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase">Estimasi Insentif Tim</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-amber-600 tracking-tight">
          {formatRupiah(totalInsentif)}
        </div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <span>Top Insentif</span>
          <span className="font-semibold text-slate-800 truncate max-w-[130px]" title={topCollectorName}>
            {topCollectorName}
          </span>
        </div>
      </div>

      {/* 4. Tarikan Kendaraan & Kepatuhan Operasional */}
      <div className="bg-white rounded-xl p-4.5 shadow-sm border border-slate-200/90 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase">Kinerja Unit &amp; BASTK</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold text-indigo-700">{totalMotor + totalMobil} Unit</span>
          <span className="text-xs text-slate-500 font-medium">Kendaraan Tertagih</span>
        </div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <span>Rincian Unit</span>
          <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
            {totalMotor} Motor • {totalMobil} Mobil
          </span>
        </div>
      </div>
    </div>
  );
};
