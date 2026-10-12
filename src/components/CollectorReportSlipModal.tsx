import React from 'react';
import { CollectorRecord, IncentiveCalculationResult } from '../types';
import { 
  formatRupiah, 
  formatNumber, 
  formatPercent 
} from '../utils/calculations';
import { formatIndonesianFullDate, formatIndonesianMonthYear } from '../utils/dateUtils';
import { X, Printer, CheckCircle, AlertTriangle, ShieldCheck, Award } from 'lucide-react';

interface CollectorReportSlipModalProps {
  isOpen: boolean;
  collector: CollectorRecord | null;
  incentive: IncentiveCalculationResult | null;
  onClose: () => void;
}

export const CollectorReportSlipModal: React.FC<CollectorReportSlipModalProps> = ({
  isOpen,
  collector,
  incentive,
  onClose,
}) => {
  if (!isOpen || !collector || !incentive) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls (Not printed) */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold">Pratinjau Slip & Kartu Rapor Insentif Resmi</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 space-y-6">
          {/* Corporate Letterhead */}
          <div className="border-b-2 border-blue-900 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-400 font-black text-2xl flex items-center justify-center shadow-md">
                W
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-blue-950 uppercase">
                  PT WAHANA OTTOMITRA MULTIARTHA TBK
                </h1>
                <div className="text-xs font-bold text-amber-600 tracking-wider">
                  WOM FINANCE - A MEMBER OF MAYBANK GROUP
                </div>
                <div className="text-[11px] text-slate-600">
                  Cabang Palembang 2 • Sumbagsel Business Unit 8 • Sistem CORE 2026
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-800">
                FORM-INS/PLB2/2026-X
              </div>
              <div className="text-xs text-slate-500">
                Tanggal Evaluasi: <strong>{formatIndonesianFullDate(new Date())}</strong>
              </div>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  incentive.isEligiblePayout
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {incentive.isEligiblePayout ? 'Status: DIBAYARKAN (ELIGIBLE)' : 'Status: DI BAWAH RAPOR'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
              KARTU RAPOR PERFORMANCE & SLIP ESTIMASI INSENTIF COLLECTOR
            </h2>
            <p className="text-xs text-slate-500">
              Periode Penagihan Aktif: {formatIndonesianMonthYear(new Date())} (Front End & Mid Range)
            </p>
          </div>

          {/* Collector Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Nama Collector:</span>
              <strong className="text-slate-900 text-sm">{collector.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nomor Induk Karyawan:</span>
              <strong className="text-slate-800 font-mono">{collector.nik}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Penugasan / Segment:</span>
              <strong className="text-blue-900 font-bold">
                {collector.primaryRole === 'FE' ? 'Front End (01-30)' : collector.primaryRole === 'NOOD' ? 'No Overdue (CO NOOD)' : 'Mid Range (31-60)'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Realisasi Koleksi:</span>
              <strong className="text-emerald-700 font-bold text-sm">
                {formatRupiah(collector.aktualSoreAmt)}
              </strong>
            </div>
          </div>

          {/* Breakdown Section 1: Penyelesaian Mingguan */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
              <span>1. Insentif Pencapaian Penyelesaian Mingguan (W1 - W4)</span>
              <span className="text-blue-900 font-extrabold">
                Subtotal: {formatRupiah(incentive.penyelesaianAdjusted)}
              </span>
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Periode Milestone</th>
                  <th className="py-2 px-3 text-center">Cut-off Date</th>
                  <th className="py-2 px-3 text-center">Pencapaian (%)</th>
                  <th className="py-2 px-3 text-right">Nominal Reward Dasar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3 font-semibold">Milestone W1</td>
                  <td className="py-2 px-3 text-center text-slate-500">Tgl 07</td>
                  <td className="py-2 px-3 text-center font-bold text-blue-900">{collector.weeklyProgress.w1}%</td>
                  <td className="py-2 px-3 text-right font-semibold">{formatRupiah(incentive.w1Incentive)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Milestone W2</td>
                  <td className="py-2 px-3 text-center text-slate-500">Tgl 14</td>
                  <td className="py-2 px-3 text-center font-bold text-blue-900">{collector.weeklyProgress.w2}%</td>
                  <td className="py-2 px-3 text-right font-semibold">{formatRupiah(incentive.w2Incentive)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Milestone W3</td>
                  <td className="py-2 px-3 text-center text-slate-500">Tgl 21</td>
                  <td className="py-2 px-3 text-center font-bold text-blue-900">{collector.weeklyProgress.w3}%</td>
                  <td className="py-2 px-3 text-right font-semibold">{formatRupiah(incentive.w3Incentive)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Milestone W4 (Closing)</td>
                  <td className="py-2 px-3 text-center text-slate-500">Tgl 28</td>
                  <td className="py-2 px-3 text-center font-bold text-blue-900">{collector.weeklyProgress.w4}%</td>
                  <td className="py-2 px-3 text-right font-semibold">{formatRupiah(incentive.w4Incentive)}</td>
                </tr>
                <tr className="bg-blue-50/60 font-bold">
                  <td colSpan={3} className="py-2 px-3 text-blue-950">
                    Penyesuaian %DKH Dikerjakan: {collector.dkhPct}% ({incentive.dkhMultiplier * 100}% Multiplier)
                  </td>
                  <td className="py-2 px-3 text-right text-blue-950">
                    {formatRupiah(incentive.penyelesaianAdjusted)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Breakdown Section 2: Tarikan Barang & BTC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarik Barang */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                2. Insentif Tarik Barang (WO) & BASTK
              </h3>
              <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-2 bg-slate-50/50">
                <div className="flex justify-between">
                  <span className="text-slate-600">Unit Motor ({collector.unitTarikan.motor} unit @Rp 200k):</span>
                  <span className="font-semibold">{formatRupiah(incentive.motorIncentive)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unit Mobil ({collector.unitTarikan.mobil} unit @Rp 500k):</span>
                  <span className="font-semibold">{formatRupiah(incentive.mobilIncentive)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-700 font-medium">
                  <span>Kelengkapan BASTK ({collector.bastkStatus}):</span>
                  <span>{incentive.bastkMultiplier * 100}% Multiplier</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-indigo-900 bg-indigo-50/50 p-1.5 rounded">
                  <span>Subtotal Tarik Barang:</span>
                  <span>{formatRupiah(incentive.tarikBarangAdjusted)}</span>
                </div>
              </div>
            </div>

            {/* BTC / Success Rate */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {collector.primaryRole === 'MR' ? '3. Insentif Success Rate MR (31-60)' : '3. Insentif Back To Current (BTC 1-30)'}
              </h3>
              <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-2 bg-slate-50/50">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {collector.primaryRole === 'MR'
                      ? 'Success Rate (Rollback+BTC+Pelunasan):'
                      : 'Pencapaian BTC 1-30:'}
                  </span>
                  <span className="font-bold text-blue-900">
                    {formatPercent(
                      collector.primaryRole === 'MR'
                        ? (collector.successRateMRPct ?? ((collector.rollbackPct ?? 0) + collector.btcPct + (collector.pelunasanPct ?? 0)))
                        : collector.btcPct
                    )}
                  </span>
                </div>
                {collector.primaryRole === 'MR' && (
                  <div className="text-[10px] text-purple-700 bg-purple-50 p-1.5 rounded flex justify-between">
                    <span>Rollback: {formatPercent(collector.rollbackPct ?? 18)}</span>
                    <span>BTC: {formatPercent(collector.btcPct)}</span>
                    <span>Pelunasan: {formatPercent(collector.pelunasanPct ?? 8)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Ketentuan Kualifikasi:</span>
                  <span>Harus &gt; 30%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600">Status Pencapaian:</span>
                  <span className={`font-bold ${incentive.btcQualified ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {incentive.btcQualified ? 'MEMENUHI SYARAT (>30%)' : 'BELUM MEMENUHI'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-900 bg-emerald-50/50 p-1.5 rounded">
                  <span>{collector.primaryRole === 'MR' ? 'Subtotal Success Rate MR:' : 'Subtotal Insentif BTC:'}</span>
                  <span>{formatRupiah(incentive.btcOrSuccessRateIncentive)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Section 3: Evaluasi Rapor Remedial 2026 (Syarat Mutlak Pencairan) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
              <span>4. Evaluasi Rapor Collection Remedial 2026 (Syarat Pencairan)</span>
              <span className="text-purple-900 font-extrabold">
                Skor Akhir: {incentive.raporTotalScore} / 5.0 ({incentive.raporPredicate})
              </span>
            </h3>
            <div className="border border-slate-200 rounded-lg p-3 bg-purple-50/30 text-xs space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center border-b border-purple-200 pb-2">
                {(collector.primaryRole === 'FE' || collector.primaryRole === 'NOOD') && collector.raporFE ? (
                  <>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Flow Ever 1-30 (30%)</div>
                      <div className="font-bold text-slate-800">{formatPercent(collector.raporFE.flowEver)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Balance 1-30 (30%)</div>
                      <div className="font-bold text-slate-800">{formatPercent(collector.raporFE.balance)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Flow No OD (40%)</div>
                      <div className="font-bold text-slate-800">{formatPercent(collector.raporFE.flowNoOd)}</div>
                    </div>
                  </>
                ) : collector.primaryRole === 'MR' && collector.raporMR ? (
                  <>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Flow Ever 31-60 (30%)</div>
                      <div className="font-bold text-slate-800">{formatPercent(collector.raporMR.flowEver)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Balance 31-60 (30%)</div>
                      <div className="font-bold text-slate-800">{formatPercent(collector.raporMR.balance)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Flow Forward 1-30 (40%)</div>
                      <div className="font-bold text-slate-800">{formatPercent(collector.raporMR.flowForward)}</div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-3 text-slate-500">Data evaluasi rapor telah memenuhi benchmark standar.</div>
                )}
              </div>

              {/* Rapor Payout Requirement Highlight */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-purple-200">
                <div>
                  <div className="font-bold text-purple-950 text-xs">
                    Syarat Pencairan: Minimal Rapor ON TARGET (Skor &ge; 3.00)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Regulasi: Tidak ada penambahan nominal tiering dari rapor. Insentif dibayarkan jika rapor minimal On Target.
                  </div>
                </div>
                <div className={`font-black text-xs px-2.5 py-1 rounded-md border ${
                  incentive.isEligiblePayout
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {incentive.isEligiblePayout ? 'STATUS: DIBAYARKAN (ELIGIBLE)' : 'STATUS: DI BAWAH TARGET (HOLD)'}
                </div>
              </div>
            </div>
          </div>

          {/* Grand Total Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shadow-lg">
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Total Estimasi Insentif yang Dibayarkan
              </div>
              <div className="text-2xl font-black tracking-tight">
                {formatRupiah(incentive.grandTotal)}
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">
                Akumulasi: {formatRupiah(incentive.accruedTotal)} • Status Pencairan: {incentive.isEligiblePayout ? '100% Cair' : 'Rp 0 (Hold karena Rapor < On Target)'}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow ${
                incentive.isEligiblePayout ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white'
              }`}>
                <Award className="w-4 h-4 mr-1" />
                {incentive.raporPredicate}
              </span>
            </div>
          </div>

          {/* Signature Box */}
          <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="text-slate-500 mb-14">Dibuat Oleh (Collector):</div>
              <div className="font-bold text-slate-900 underline">{collector.name}</div>
              <div className="text-[10px] text-slate-500">NIK: {collector.nik}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14">Diperiksa Oleh:</div>
              <div className="font-bold text-slate-900 underline">( Collection Head )</div>
              <div className="text-[10px] text-slate-500">Cabang Palembang 2</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14">Disetujui Oleh:</div>
              <div className="font-bold text-slate-900 underline">( Branch Remedial Head )</div>
              <div className="text-[10px] text-slate-500">Sumbagsel Business Unit 8</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
