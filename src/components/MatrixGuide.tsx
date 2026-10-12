import React, { useState } from 'react';
import { BookOpen, Layers, CheckCircle2, AlertCircle, Award, Sparkles } from 'lucide-react';

export const MatrixGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FE' | 'MR' | 'RAPOR' | 'INSENTIF_RAPOR'>('INSENTIF_RAPOR');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-amber-400 text-slate-950">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Matriks Regulasi & Skema Insentif WOM Finance 2026</h2>
            <p className="text-xs text-slate-300">
              Panduan resmi parameter tiering W1-W4, DKH, Tarikan Barang, BTC, dan Insentif Rapor Baru
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('INSENTIF_RAPOR')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'INSENTIF_RAPOR'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            ★ Insentif Rapor (Ketentuan Baru)
          </button>
          <button
            onClick={() => setActiveTab('FE')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'FE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Skema Front End (FE)
          </button>
          <button
            onClick={() => setActiveTab('MR')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MR'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Skema Mid Range (MR)
          </button>
          <button
            onClick={() => setActiveTab('RAPOR')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RAPOR'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Matriks Rapor Remedial
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* TAB 0: KETENTUAN RAPOR & PENCAIRAN INSENTIF */}
        {activeTab === 'INSENTIF_RAPOR' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide">
                  Ketentuan Resmi Pembayaran Insentif Berdasarkan Rapor:
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Tidak ada penambahan uang insentif berdasarkan tiering rapor. Insentif operasional (Penyelesaian, Tarikan Unit, BTC/Success Rate) <strong>hanya akan dibayarkan ketika mendapat rapor minimal ON TARGET</strong>.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                Regulasi Resmi 2026
              </span>
            </div>

            {/* Official Table from User Image */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-900 text-white p-3 font-bold text-xs flex justify-between items-center">
                <span className="text-amber-300 uppercase tracking-wide font-extrabold">
                  Tabel Konversi Skor (Point) ke Predikat Raport &amp; Kelayakan Pencairan
                </span>
                <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded text-slate-300 border border-slate-700">
                  Syarat Minimal Cair: On Target (Skor &ge; 3.00)
                </span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-blue-900 text-white font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-center">Rentang Point</th>
                    <th className="py-3 px-4 text-center">Predikat Raport</th>
                    <th className="py-3 px-4 text-center">Status Pencairan Insentif</th>
                    <th className="py-3 px-4 text-right">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-purple-50/50">
                    <td className="py-3 px-4 text-center font-bold font-mono text-purple-900 text-sm">
                      4,5 – 5,00
                    </td>
                    <td className="py-3 px-4 text-center font-black text-purple-900 text-sm">
                      EXCEPTIONAL
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300">
                        DIBAYARKAN (100%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">
                      Kinerja luar biasa di atas seluruh target
                    </td>
                  </tr>

                  <tr className="bg-blue-50/40">
                    <td className="py-3 px-4 text-center font-bold font-mono text-blue-900 text-sm">
                      4 – 4,99
                    </td>
                    <td className="py-3 px-4 text-center font-black text-blue-900 text-sm">
                      EXCEED TARGET
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300">
                        DIBAYARKAN (100%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">
                      Melampaui target remedial yang ditetapkan
                    </td>
                  </tr>

                  <tr className="bg-emerald-50/40">
                    <td className="py-3 px-4 text-center font-bold font-mono text-emerald-900 text-sm">
                      3 – 3,99
                    </td>
                    <td className="py-3 px-4 text-center font-black text-emerald-900 text-sm">
                      ON TARGET
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300">
                        DIBAYARKAN (100%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-800 font-bold">
                      ★ Batas minimal untuk pencairan insentif
                    </td>
                  </tr>

                  <tr className="bg-amber-50/40">
                    <td className="py-3 px-4 text-center font-bold font-mono text-amber-900 text-sm">
                      1,5 – 2,99
                    </td>
                    <td className="py-3 px-4 text-center font-black text-amber-900 text-sm">
                      NEED IMPROVEMENT
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-extrabold text-xs border border-red-300">
                        TIDAK DIBAYARKAN (HOLD)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      Insentif Rp 0 karena di bawah On Target
                    </td>
                  </tr>

                  <tr className="bg-rose-50/40">
                    <td className="py-3 px-4 text-center font-bold font-mono text-rose-900 text-sm">
                      1 – 1,99
                    </td>
                    <td className="py-3 px-4 text-center font-black text-rose-900 text-sm">
                      UNACCEPTABLE
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-extrabold text-xs border border-red-300">
                        TIDAK DIBAYARKAN (HOLD)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      Insentif Rp 0 karena tidak memenuhi syarat
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ringkasan Regulasi Pembayaran Insentif WOM Finance 2026</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  <strong>Tidak ada penambahan nominal uang:</strong> Nominal insentif tidak ditambah berdasarkan predikat rapor (tidak ada +1 Juta, +800k, dsb).
                </li>
                <li>
                  <strong>Rapor sebagai syarat cair:</strong> Total insentif (Penyelesaian mingguan W1-W4 x DKH + Tarik unit motor/mobil x BASTK + BTC/Success Rate) akan dibayarkan 100% apabila rapor mencapai predikat <strong>On Target (Skor &ge; 3.00)</strong>, <strong>Exceed Target</strong>, atau <strong>Exceptional</strong>.
                </li>
                <li>
                  <strong>Di bawah On Target:</strong> Apabila skor rapor di bawah 3.00 (Need Improvement atau Unacceptable), insentif berstatus <em>Hold</em> dan total yang dicairkan adalah <strong>Rp 0</strong>.
                </li>
                <li>
                  <strong>Mid Range (MR):</strong> Penilaian insentif MR dievaluasi berdasarkan <strong>Success Rate</strong> (gabungan Rollback, BTC, dan Pelunasan) &gt; 30% untuk memperoleh Rp 350.000.
                </li>
              </ul>
            </div>

            {/* Official Disclaimer Note from WhatsApp Image */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-700 leading-relaxed flex items-start space-x-2">
              <span className="font-bold text-amber-600 text-sm">ℹ️ Catatan Regulasi:</span>
              <span>
                &quot;Ketentuan terkait penambahan uang insentif bertingkat dari tiering rapor dinyatakan <strong>TIDAK DIGUNAKAN</strong>. Insentif operasional (Penyelesaian, Tarikan Unit, BTC/Success Rate) akan dicairkan penuh saat rapor mencapai <strong>ON TARGET (Skor &ge; 3.00)</strong>.&quot;
              </span>
            </div>
          </div>
        )}
        {/* TAB 1: FRONT END SKEMA */}
        {activeTab === 'FE' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-blue-900">
                  Perhitungan Insentif Collection Officer (CO) Front End
                </h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  Formula: <strong>((Insentif Penyelesaian × Adjustment) + (Insentif Tarik Barang × Adjustment) + Insentif BTC)</strong>
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-200 text-blue-900">
                Min. Rapor On Target
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Insentif Penyelesaian 01-30 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
                  Insentif Penyelesaian 01-30
                </h4>
                <div className="space-y-3 text-xs">
                  {/* W1 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W1 (tgl 7)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 40%</span>
                      <span className="font-bold text-emerald-700">Rp 750.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 35% - 40%</span>
                      <span className="font-semibold text-blue-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 35%</span>
                      <span>-</span>
                    </div>
                  </div>

                  {/* W2 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W2 (tgl 14)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 60%</span>
                      <span className="font-bold text-emerald-700">Rp 750.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 55% - 60%</span>
                      <span className="font-semibold text-blue-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 55%</span>
                      <span>-</span>
                    </div>
                  </div>

                  {/* W3 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W3 (tgl 21)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 75%</span>
                      <span className="font-bold text-emerald-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 70% - 75%</span>
                      <span className="font-semibold text-blue-700">Rp 250.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 70%</span>
                      <span>-</span>
                    </div>
                  </div>

                  {/* W4 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W4 (tgl 28)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 95%</span>
                      <span className="font-bold text-emerald-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 90% - 95%</span>
                      <span className="font-semibold text-blue-700">Rp 250.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 90%</span>
                      <span>-</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjustment %DKH & BASTK */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
                    Adjustment %DKH Balance 1-30
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Tiering DKH Dikerjakan</span>
                      <span>Insentif</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>≥ 95% DKH dikerjakan</span>
                        <span className="font-bold text-emerald-600">100%</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>75% - &lt; 95% DKH dikerjakan</span>
                        <span className="font-bold text-yellow-600">75%</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>&lt; 75% DKH dikerjakan</span>
                        <span className="font-bold text-red-600">0%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-600 mr-2"></span>
                    Adjustment Pengisian BASTK
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Kelengkapan</span>
                      <span>Insentif</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>Lengkap</span>
                        <span className="font-bold text-emerald-600">100%</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>Tidak Lengkap</span>
                        <span className="font-bold text-yellow-600">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insentif Tarik Barang & BTC */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2"></span>
                    Insentif Tarik Barang (WO)
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Parameter Unit</span>
                      <span>Insentif / Unit</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span className="font-medium">Motor</span>
                        <span className="font-bold text-blue-900">Rp 200.000</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span className="font-medium">Mobil</span>
                        <span className="font-bold text-blue-900">Rp 500.000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-600 mr-2"></span>
                    Insentif Back To Current (BTC) 1-30
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Tiering BTC 1-30</span>
                      <span>Insentif</span>
                    </div>
                    <div className="px-3 py-2.5 flex justify-between text-slate-700">
                      <span className="font-bold text-emerald-700">&gt; 30%</span>
                      <span className="font-extrabold text-emerald-800">Rp 350.000,-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MID RANGE SKEMA */}
        {activeTab === 'MR' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-purple-900">
                  Perhitungan Insentif Collection Officer (CO) Mid Range (MR)
                </h3>
                <p className="text-xs text-purple-700 mt-0.5">
                  Formula: <strong>((Insentif Penyelesaian × Adjustment) + (Insentif Tarik Barang × Adjustment) + Insentif Success Rate 31-60)</strong>
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-200 text-purple-900">
                Min. Rapor On Target
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Insentif Penyelesaian 31-60 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-600 mr-2"></span>
                  Insentif Penyelesaian 31-60
                </h4>
                <div className="space-y-3 text-xs">
                  {/* W1 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W1 (tgl 7)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 30%</span>
                      <span className="font-bold text-emerald-700">Rp 750.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 25% - 30%</span>
                      <span className="font-semibold text-purple-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 25%</span>
                      <span>-</span>
                    </div>
                  </div>

                  {/* W2 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W2 (tgl 14)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 50%</span>
                      <span className="font-bold text-emerald-700">Rp 750.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 45% - 50%</span>
                      <span className="font-semibold text-purple-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 45%</span>
                      <span>-</span>
                    </div>
                  </div>

                  {/* W3 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W3 (tgl 21)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 65%</span>
                      <span className="font-bold text-emerald-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 60% - 65%</span>
                      <span className="font-semibold text-purple-700">Rp 250.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 60%</span>
                      <span>-</span>
                    </div>
                  </div>

                  {/* W4 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">W4 (tgl 28)</div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 75%</span>
                      <span className="font-bold text-emerald-700">Rp 500.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>&gt; 70% - 75%</span>
                      <span className="font-semibold text-purple-700">Rp 250.000</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-400">
                      <span>≤ 70%</span>
                      <span>-</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjustment %DKH & BASTK */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
                    Adjustment %DKH Balance 31-60
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Tiering DKH 31-60</span>
                      <span>Insentif</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>≥ 95% DKH dikerjakan</span>
                        <span className="font-bold text-emerald-600">100%</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>75% - &lt; 95% DKH dikerjakan</span>
                        <span className="font-bold text-yellow-600">75%</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>&lt; 75% DKH dikerjakan</span>
                        <span className="font-bold text-red-600">0%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-600 mr-2"></span>
                    Adjustment Pengisian BASTK
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Kelengkapan</span>
                      <span>Insentif</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>Lengkap</span>
                        <span className="font-bold text-emerald-600">100%</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span>Tidak Lengkap</span>
                        <span className="font-bold text-yellow-600">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insentif Tarik Barang & Success Rate */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2"></span>
                    Insentif Tarik Barang (Unit)
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Parameter Unit</span>
                      <span>Insentif / Unit</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span className="font-medium">Motor</span>
                        <span className="font-bold text-purple-900">Rp 200.000</span>
                      </div>
                      <div className="px-3 py-2 flex justify-between text-slate-700">
                        <span className="font-medium">Mobil</span>
                        <span className="font-bold text-purple-900">Rp 500.000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
                    Insentif Success Rate 31-60
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                      <span>Parameter</span>
                      <span>Insentif</span>
                    </div>
                    <div className="px-3 py-2.5 flex justify-between text-slate-700">
                      <span className="font-bold text-emerald-700">Success Rate &gt; 30%</span>
                      <span className="font-extrabold text-emerald-800">Rp 350.000,-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RAPOR REMEDIAL MATRIKS */}
        {activeTab === 'RAPOR' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-950">
                RAPOR COLLECTION REMEDIAL 2026 (PT WOM FINANCE TBK)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Standar penilaian KPI resmi untuk penentuan kualifikasi pembayaran insentif (Min Rapor: On Target / Nilai ≥ 3.0)
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rapor Front End */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-blue-900 text-white p-3 font-bold text-xs flex justify-between">
                  <span>Collection Officer (CO) Front End</span>
                  <span>Bobot Total 100%</span>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Parameter</th>
                      <th className="py-2.5 px-3">Tiering</th>
                      <th className="py-2.5 px-2 text-center">Index</th>
                      <th className="py-2.5 px-2 text-center">Bobot</th>
                      <th className="py-2.5 px-3 text-right">Nilai Rapor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Flow Ever 1-30 */}
                    <tr className="bg-blue-50/30">
                      <td rowSpan={5} className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                        FLOW EVER 1-30
                      </td>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 60%</td>
                      <td className="py-1.5 px-2 text-center font-bold">1</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.3</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 55% - 60%</td>
                      <td className="py-1.5 px-2 text-center font-bold">2</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.6</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 50% - 55%</td>
                      <td className="py-1.5 px-2 text-center font-bold">3</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.9</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 45% - 50%</td>
                      <td className="py-1.5 px-2 text-center font-bold">4</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.2</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-emerald-800 font-bold">≤ 45%</td>
                      <td className="py-1.5 px-2 text-center font-bold text-emerald-700">5</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">1.5</td>
                    </tr>

                    {/* Balance 1-30 */}
                    <tr>
                      <td rowSpan={5} className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                        BALANCE 1-30
                      </td>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 10%</td>
                      <td className="py-1.5 px-2 text-center font-bold">1</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.3</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 9.5% - 10%</td>
                      <td className="py-1.5 px-2 text-center font-bold">2</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.6</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 9% - 9.5%</td>
                      <td className="py-1.5 px-2 text-center font-bold">3</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.9</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 8.5% - 9%</td>
                      <td className="py-1.5 px-2 text-center font-bold">4</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.2</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-emerald-800 font-bold">≤ 8.5%</td>
                      <td className="py-1.5 px-2 text-center font-bold text-emerald-700">5</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">1.5</td>
                    </tr>

                    {/* Flow No OD */}
                    <tr className="bg-blue-50/30">
                      <td rowSpan={5} className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                        FLOW NO OD
                      </td>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 4.2%</td>
                      <td className="py-1.5 px-2 text-center font-bold">1</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.4</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 3.7% - 4.2%</td>
                      <td className="py-1.5 px-2 text-center font-bold">2</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.8</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 3.2% - 3.7%</td>
                      <td className="py-1.5 px-2 text-center font-bold">3</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.2</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 2.7% - 3.2%</td>
                      <td className="py-1.5 px-2 text-center font-bold">4</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.6</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-emerald-800 font-bold">≤ 2.7%</td>
                      <td className="py-1.5 px-2 text-center font-bold text-emerald-700">5</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">2.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rapor Mid Range */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-purple-900 text-white p-3 font-bold text-xs flex justify-between">
                  <span>Collection Officer (CO) Mid Range</span>
                  <span>Bobot Total 100%</span>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Parameter</th>
                      <th className="py-2.5 px-3">Tiering</th>
                      <th className="py-2.5 px-2 text-center">Index</th>
                      <th className="py-2.5 px-2 text-center">Bobot</th>
                      <th className="py-2.5 px-3 text-right">Nilai Rapor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Flow Ever 31-60 */}
                    <tr className="bg-purple-50/30">
                      <td rowSpan={5} className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                        FLOW EVER 31-60
                      </td>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 70%</td>
                      <td className="py-1.5 px-2 text-center font-bold">1</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.3</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 65% - 70%</td>
                      <td className="py-1.5 px-2 text-center font-bold">2</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.6</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 60% - 65%</td>
                      <td className="py-1.5 px-2 text-center font-bold">3</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.9</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 55% - 60%</td>
                      <td className="py-1.5 px-2 text-center font-bold">4</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.2</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-emerald-800 font-bold">≤ 55%</td>
                      <td className="py-1.5 px-2 text-center font-bold text-emerald-700">5</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">1.5</td>
                    </tr>

                    {/* Balance 31-60 */}
                    <tr>
                      <td rowSpan={5} className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                        BALANCE 31-60
                      </td>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 2.4%</td>
                      <td className="py-1.5 px-2 text-center font-bold">1</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.3</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 2.2% - 2.4%</td>
                      <td className="py-1.5 px-2 text-center font-bold">2</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.6</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 2% - 2.2%</td>
                      <td className="py-1.5 px-2 text-center font-bold">3</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.9</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 1.8% - 2%</td>
                      <td className="py-1.5 px-2 text-center font-bold">4</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.2</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-emerald-800 font-bold">≤ 1.8%</td>
                      <td className="py-1.5 px-2 text-center font-bold text-emerald-700">5</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">30%</td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">1.5</td>
                    </tr>

                    {/* Flow Forward 1-30 */}
                    <tr className="bg-purple-50/30">
                      <td rowSpan={5} className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                        FLOW FORWARD 1-30
                      </td>
                      <td className="py-1.5 px-3 text-slate-700">&gt; 9.6%</td>
                      <td className="py-1.5 px-2 text-center font-bold">1</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.4</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 8.6% - 9.6%</td>
                      <td className="py-1.5 px-2 text-center font-bold">2</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">0.8</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 7.6% - 8.6%</td>
                      <td className="py-1.5 px-2 text-center font-bold">3</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.2</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-slate-700">&gt; 6.6% - 7.6%</td>
                      <td className="py-1.5 px-2 text-center font-bold">4</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-slate-700">1.6</td>
                    </tr>
                    <tr className="bg-purple-50/30">
                      <td className="py-1.5 px-3 text-emerald-800 font-bold">≤ 6.6%</td>
                      <td className="py-1.5 px-2 text-center font-bold text-emerald-700">5</td>
                      <td className="py-1.5 px-2 text-center text-slate-500">40%</td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">2.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
