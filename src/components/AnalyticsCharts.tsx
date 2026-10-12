import React, { useState } from 'react';
import { CollectorRecord, IncentiveCalculationResult } from '../types';
import { formatRupiah, formatNumber, formatPercent } from '../utils/calculations';
import { formatIndonesianMonthYear } from '../utils/dateUtils';
import { 
  BarChart3, 
  Trophy, 
  PieChart, 
  TrendingUp, 
  CalendarCheck,
  CheckCircle,
  Truck
} from 'lucide-react';

interface AnalyticsChartsProps {
  collectors: CollectorRecord[];
  incentives: Record<string, IncentiveCalculationResult>;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  collectors,
  incentives,
}) => {
  const [metricView, setMetricView] = useState<'recovery' | 'incentive'>('recovery');

  const activeCollectors = collectors.filter((c) => c.isActive);

  // Sorted by Aktual Sore Amt descending
  const sortedByRecovery = [...activeCollectors].sort(
    (a, b) => b.aktualSoreAmt - a.aktualSoreAmt
  );

  // Sorted by Incentive earned descending
  const sortedByIncentive = [...activeCollectors].sort((a, b) => {
    const incA = incentives[a.id]?.grandTotal || 0;
    const incB = incentives[b.id]?.grandTotal || 0;
    return incB - incA;
  });

  const maxRecovery = Math.max(...activeCollectors.map((c) => c.aktualSoreAmt), 1);
  const maxIncentive = Math.max(...activeCollectors.map((c) => incentives[c.id]?.grandTotal || 0), 1);

  // Total incentive components
  let totalPenyelesaianAdjusted = 0;
  let totalTarikBarangAdjusted = 0;
  let totalBtcAdjusted = 0;
  let totalInsentifRapor = 0;

  for (const c of activeCollectors) {
    const inc = incentives[c.id];
    if (inc && inc.isEligiblePayout) {
      totalPenyelesaianAdjusted += inc.penyelesaianAdjusted;
      totalTarikBarangAdjusted += inc.tarikBarangAdjusted;
      totalBtcAdjusted += inc.btcOrSuccessRateIncentive;
      totalInsentifRapor += inc.insentifRapor;
    }
  }

  const grandPool = totalPenyelesaianAdjusted + totalTarikBarangAdjusted + totalBtcAdjusted + totalInsentifRapor || 1;
  const pctPenyelesaian = Math.round((totalPenyelesaianAdjusted / grandPool) * 100);
  const pctTarik = Math.round((totalTarikBarangAdjusted / grandPool) * 100);
  const pctBtc = Math.round((totalBtcAdjusted / grandPool) * 100);
  const pctRapor = Math.max(0, 100 - pctPenyelesaian - pctTarik - pctBtc);

  return (
    <div className="space-y-6 mb-6">
      {/* Top 3 Podium & Leaderboard Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-blue-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              <span>Papan Peringkat Collector Berprestasi</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Top Performer Cabang Palembang 2 - Periode {formatIndonesianMonthYear(new Date())}
            </h3>
          </div>

          <div className="flex space-x-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setMetricView('recovery')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                metricView === 'recovery'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Berdasarkan Realisasi (Rp)
            </button>
            <button
              onClick={() => setMetricView('incentive')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                metricView === 'incentive'
                  ? 'bg-amber-500 text-blue-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Berdasarkan Insentif (Rp)
            </button>
          </div>
        </div>

        {/* Podium Display (Top 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          {/* Rank 2 */}
          {sortedByIncentive[1] && (
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex flex-col items-center text-center relative order-2 md:order-1">
              <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-sm shadow mb-2">
                2
              </div>
              <div className="font-bold text-white text-sm truncate max-w-[200px]">
                {sortedByIncentive[1].name}
              </div>
              <div className="text-[11px] text-blue-300 font-mono mb-2">
                NIK: {sortedByIncentive[1].nik} ({sortedByIncentive[1].primaryRole})
              </div>
              <div className="text-lg font-black text-amber-300">
                {metricView === 'incentive'
                  ? formatRupiah(incentives[sortedByIncentive[1].id]?.grandTotal || 0)
                  : formatRupiah(sortedByIncentive[1].aktualSoreAmt)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {incentives[sortedByIncentive[1].id]?.raporPredicate}
              </div>
            </div>
          )}

          {/* Rank 1 (Champion) */}
          {sortedByIncentive[0] && (
            <div className="bg-gradient-to-b from-amber-500/20 via-blue-900/60 to-slate-900 rounded-xl p-5 border-2 border-amber-400/80 flex flex-col items-center text-center relative order-1 md:order-2 shadow-lg shadow-amber-500/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-blue-950 font-black flex items-center justify-center text-base shadow-md mb-2 ring-4 ring-amber-400/30">
                👑 1
              </div>
              <div className="font-extrabold text-white text-base truncate max-w-[220px]">
                {sortedByIncentive[0].name}
              </div>
              <div className="text-[11px] text-amber-200 font-mono mb-2">
                NIK: {sortedByIncentive[0].nik} ({sortedByIncentive[0].primaryRole})
              </div>
              <div className="text-2xl font-black text-amber-400">
                {metricView === 'incentive'
                  ? formatRupiah(incentives[sortedByIncentive[0].id]?.grandTotal || 0)
                  : formatRupiah(sortedByIncentive[0].aktualSoreAmt)}
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold mt-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {incentives[sortedByIncentive[0].id]?.raporPredicate} (Skor: {incentives[sortedByIncentive[0].id]?.raporTotalScore})
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {sortedByIncentive[2] && (
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex flex-col items-center text-center relative order-3">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-extrabold flex items-center justify-center text-sm shadow mb-2">
                3
              </div>
              <div className="font-bold text-white text-sm truncate max-w-[200px]">
                {sortedByIncentive[2].name}
              </div>
              <div className="text-[11px] text-blue-300 font-mono mb-2">
                NIK: {sortedByIncentive[2].nik} ({sortedByIncentive[2].primaryRole})
              </div>
              <div className="text-lg font-black text-amber-300">
                {metricView === 'incentive'
                  ? formatRupiah(incentives[sortedByIncentive[2].id]?.grandTotal || 0)
                  : formatRupiah(sortedByIncentive[2].aktualSoreAmt)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {incentives[sortedByIncentive[2].id]?.raporPredicate}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar comparison Realisasi vs Target Harian (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Perbandingan Realisasi Aktual Sore per Collector
              </h4>
              <p className="text-xs text-slate-500">Visualisasi pencapaian rupiah collection sore ini</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {sortedByRecovery.map((col) => {
              const pctOfMax = Math.round((col.aktualSoreAmt / maxRecovery) * 100);
              const inc = incentives[col.id];

              return (
                <div key={col.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      {col.name}
                      <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 font-normal">
                        {col.primaryRole}
                      </span>
                    </span>
                    <span className="font-extrabold text-blue-900">
                      {formatRupiah(col.aktualSoreAmt)}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        col.aktualSoreAmt > 100000000
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                          : col.aktualSoreAmt > 30000000
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-r from-blue-400 to-blue-500'
                      }`}
                      style={{ width: `${Math.max(pctOfMax, 3)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>
                      Target Harian: {formatRupiah(col.targetHarian)} • {col.aktualSoreAct} Kontrak
                    </span>
                    <span>
                      Estimasi Insentif: <strong className="text-slate-700">{formatRupiah(inc?.grandTotal || 0)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Komposisi Insentif & Milestone Mingguan (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Komposisi Sumber Insentif */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              Komposisi Insentif Tim Cabang
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Total Insentif Tim Terbentuk: <strong className="text-slate-900">{formatRupiah(grandPool)}</strong>
            </p>

            {/* Visual Stacked Progress Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3 shadow-inner">
              <div
                style={{ width: `${pctPenyelesaian}%` }}
                className="bg-blue-600 h-full"
                title={`Insentif Penyelesaian: ${pctPenyelesaian}%`}
              ></div>
              <div
                style={{ width: `${pctTarik}%` }}
                className="bg-indigo-500 h-full"
                title={`Insentif Tarik Barang: ${pctTarik}%`}
              ></div>
              <div
                style={{ width: `${pctBtc}%` }}
                className="bg-amber-500 h-full"
                title={`Insentif BTC / Success: ${pctBtc}%`}
              ></div>
              <div
                style={{ width: `${pctRapor}%` }}
                className="bg-purple-600 h-full"
                title={`Insentif Rapor (Ketentuan Baru): ${pctRapor}%`}
              ></div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span className="text-slate-700">Insentif Penyelesaian Mingguan</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatRupiah(totalPenyelesaianAdjusted)}</div>
                  <div className="text-[10px] text-slate-500">{pctPenyelesaian}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-700">Insentif Tarik Kendaraan (× BASTK)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatRupiah(totalTarikBarangAdjusted)}</div>
                  <div className="text-[10px] text-slate-500">{pctTarik}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700">Insentif BTC & Success Rate</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatRupiah(totalBtcAdjusted)}</div>
                  <div className="text-[10px] text-slate-500">{pctBtc}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-purple-50/50 border border-purple-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                  <span className="text-purple-950 font-semibold">Insentif Rapor (Ketentuan Baru)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-950">{formatRupiah(totalInsentifRapor)}</div>
                  <div className="text-[10px] text-purple-700">{pctRapor}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Kalender Milestone Mingguan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              Kalender Milestone Cut-Off Mingguan
            </h4>
            <div className="space-y-2.5 text-xs mt-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div>
                  <div className="font-bold text-emerald-950">W1 - Tanggal 7</div>
                  <div className="text-[11px] text-emerald-700">FE Target &gt;40% | MR &gt;30%</div>
                </div>
                <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded shadow-xs border border-emerald-200">
                  Rp 750.000
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
                <div>
                  <div className="font-bold text-blue-950">W2 - Tanggal 14</div>
                  <div className="text-[11px] text-blue-700">FE Target &gt;60% | MR &gt;50%</div>
                </div>
                <span className="text-xs font-extrabold text-blue-800 bg-white px-2.5 py-1 rounded shadow-xs border border-blue-200">
                  Rp 750.000
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-purple-200 bg-purple-50/50">
                <div>
                  <div className="font-bold text-purple-950">W3 - Tanggal 21</div>
                  <div className="text-[11px] text-purple-700">FE Target &gt;75% | MR &gt;65%</div>
                </div>
                <span className="text-xs font-extrabold text-purple-800 bg-white px-2.5 py-1 rounded shadow-xs border border-purple-200">
                  Rp 500.000
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                <div>
                  <div className="font-bold text-amber-950">W4 - Tanggal 28 (Closing)</div>
                  <div className="text-[11px] text-amber-700">FE Target &gt;95% | MR &gt;75%</div>
                </div>
                <span className="text-xs font-extrabold text-amber-800 bg-white px-2.5 py-1 rounded shadow-xs border border-amber-200">
                  Rp 500.000
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
