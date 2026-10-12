import React, { useState, useMemo } from 'react';
import { 
  CollectorRecord, 
  CollectorRole, 
  BASTKStatus, 
  RaporPredicateType 
} from '../types';
import { 
  X, 
  Save, 
  Edit2, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck 
} from 'lucide-react';
import { 
  formatRupiah, 
  formatPercent,
  calculateFERaporScore, 
  calculateMRRaporScore, 
  getRaporIncentiveNominal 
} from '../utils/calculations';

interface EditCollectorModalProps {
  isOpen: boolean;
  collector: CollectorRecord | null;
  onClose: () => void;
  onSave: (updated: CollectorRecord) => void;
}

export const EditCollectorModal: React.FC<EditCollectorModalProps> = ({
  isOpen,
  collector,
  onClose,
  onSave,
}) => {
  if (!isOpen || !collector) return null;

  // Identitas & Status
  const [name, setName] = useState(collector.name);
  const [nik, setNik] = useState(collector.nik);
  const [role, setRole] = useState<CollectorRole>(collector.primaryRole);
  const [isActive, setIsActive] = useState(collector.isActive);

  // Beban Awal (Portofolio)
  const [bahanAwalAct, setBahanAwalAct] = useState(collector.bahanAwalAct);
  const [bahanAwalAmt, setBahanAwalAmt] = useState(collector.bahanAwalAmt);

  // Realisasi Sore Hari Ini & Target
  const [aktualSoreAct, setAktualSoreAct] = useState(collector.aktualSoreAct);
  const [aktualSoreAmt, setAktualSoreAmt] = useState(collector.aktualSoreAmt);
  const [realisasiAmt, setRealisasiAmt] = useState(collector.realisasiAmt);
  const [kurangClosing, setKurangClosing] = useState(collector.kurangClosing);
  const [targetHarian, setTargetHarian] = useState(collector.targetHarian);
  const [btcPct, setBtcPct] = useState(collector.btcPct);

  // Milestone Mingguan
  const [w1, setW1] = useState(collector.weeklyProgress.w1);
  const [w2, setW2] = useState(collector.weeklyProgress.w2);
  const [w3, setW3] = useState(collector.weeklyProgress.w3);
  const [w4, setW4] = useState(collector.weeklyProgress.w4);

  // DKH & Tarik Unit
  const [dkhPct, setDkhPct] = useState(collector.dkhPct);
  const [motor, setMotor] = useState(collector.unitTarikan.motor);
  const [mobil, setMobil] = useState(collector.unitTarikan.mobil);
  const [bastkStatus, setBastkStatus] = useState<BASTKStatus>(collector.bastkStatus);

  // Performance KPI - Front End (FE 01-30)
  const [flowEverFE, setFlowEverFE] = useState(collector.raporFE?.flowEver ?? 44.0);
  const [balanceFE, setBalanceFE] = useState(collector.raporFE?.balance ?? 8.2);
  const [flowNoOdFE, setFlowNoOdFE] = useState(collector.raporFE?.flowNoOd ?? 2.5);
  const [stayPct, setStayPct] = useState(collector.stayPct ?? 18.0);
  const [ball0130Pct, setBall0130Pct] = useState(collector.ball0130Pct ?? 2.0);
  const [ballNoOdPct, setBallNoOdPct] = useState(collector.ballNoOdPct ?? 96.0);
  const [angsuran1_3, setAngsuran1_3] = useState(collector.angsuran1_3 ?? 0);
  const [angsuran1_6, setAngsuran1_6] = useState(collector.angsuran1_6 ?? 0);
  const [angsuran1_9, setAngsuran1_9] = useState(collector.angsuran1_9 ?? 0);

  // Performance KPI - Mid Range (MR 31-60)
  const [flowEverMR, setFlowEverMR] = useState(collector.raporMR?.flowEver ?? 52.0);
  const [balanceMR, setBalanceMR] = useState(collector.raporMR?.balance ?? 1.5);
  const [flowForwardMR, setFlowForwardMR] = useState(collector.raporMR?.flowForward ?? 6.2);
  const [delq30Pct, setDelq30Pct] = useState(collector.delq30Pct ?? 2.0);
  const [ball3160Pct, setBall3160Pct] = useState(collector.ball3160Pct ?? 0.8);
  const [rollbackPct, setRollbackPct] = useState(collector.rollbackPct ?? 18.0);
  const [btcMRPct, setBtcMRPct] = useState(collector.btcPct ?? 9.0);
  const [pelunasanPct, setPelunasanPct] = useState(collector.pelunasanPct ?? 8.0);
  const [successRateMRPct, setSuccessRateMRPct] = useState(
    collector.successRateMRPct ?? (collector.rollbackPct ?? 18.0) + (collector.btcPct ?? 9.0) + (collector.pelunasanPct ?? 8.0)
  );

  // Live KPI preview calculation
  const liveRaporPreview = useMemo(() => {
    if (role === 'FE' || role === 'NOOD') {
      const score = calculateFERaporScore({
        flowEver: Number(flowEverFE),
        balance: Number(balanceFE),
        flowNoOd: Number(flowNoOdFE),
      });
      return { score: score.totalScore, predicate: score.predicate, isEligible: score.isEligible };
    } else {
      const score = calculateMRRaporScore({
        flowEver: Number(flowEverMR),
        balance: Number(balanceMR),
        flowForward: Number(flowForwardMR),
      });
      return { score: score.totalScore, predicate: score.predicate, isEligible: score.isEligible };
    }
  }, [role, flowEverFE, balanceFE, flowNoOdFE, flowEverMR, balanceMR, flowForwardMR]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CollectorRecord = {
      ...collector,
      name,
      nik,
      primaryRole: role,
      isActive,
      // Beban Awal (Bahan Awal)
      bahanAwalAct: Number(bahanAwalAct),
      bahanAwalAmt: Number(bahanAwalAmt),
      // Realisasi & Closing
      aktualSoreAct: Number(aktualSoreAct),
      aktualSoreAmt: Number(aktualSoreAmt),
      realisasiAmt: Math.max(0, Number(bahanAwalAmt) - Number(aktualSoreAmt)),
      kurangClosing: Number(kurangClosing),
      targetHarian: Number(targetHarian),
      btcPct: role === 'MR' ? Number(btcMRPct) : Number(btcPct),
      // Milestones
      weeklyProgress: {
        w1: Number(w1),
        w2: Number(w2),
        w3: Number(w3),
        w4: Number(w4),
      },
      // DKH & Tarik Barang
      dkhPct: Number(dkhPct),
      unitTarikan: {
        motor: Number(motor),
        mobil: Number(mobil),
      },
      bastkStatus,
      // Performance KPI parameters
      stayPct: Number(stayPct),
      ball0130Pct: Number(ball0130Pct),
      ballNoOdPct: Number(ballNoOdPct),
      flowNoOdPct: Number(flowNoOdFE),
      angsuran1_3: Number(angsuran1_3),
      angsuran1_6: Number(angsuran1_6),
      angsuran1_9: Number(angsuran1_9),
      delq30Pct: Number(delq30Pct),
      ball3160Pct: Number(ball3160Pct),
      // MR Success Rate components
      rollbackPct: role === 'MR' ? Number(rollbackPct) : undefined,
      pelunasanPct: role === 'MR' ? Number(pelunasanPct) : undefined,
      successRateMRPct: role === 'MR' ? Number(rollbackPct) + Number(btcMRPct) + Number(pelunasanPct) : undefined,
      // Rapor KPI
      raporFE: (role === 'FE' || role === 'NOOD') 
        ? { flowEver: Number(flowEverFE), balance: Number(balanceFE), flowNoOd: Number(flowNoOdFE) } 
        : collector.raporFE,
      raporMR: role === 'MR' 
        ? { flowEver: Number(flowEverMR), balance: Number(balanceMR), flowForward: Number(flowForwardMR) } 
        : collector.raporMR,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold tracking-tight">Edit Beban Awal, Performance KPI &amp; Insentif CO</h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-extrabold bg-blue-800 text-blue-200 border border-blue-700">
                  {role === 'FE' ? 'Front End (FE 01-30)' : 'Mid Range (MR 31-60)'}
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {name} • NIK: {nik}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
          {/* Live KPI Performance Summary Pill */}
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-emerald-50 p-3.5 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-900 text-white rounded-lg shadow-xs">
                <Award className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                  Hasil Simulasi KPI &amp; Predikat Rapor 2026
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-sm font-black text-blue-950">
                    Skor: {liveRaporPreview.score.toFixed(2)} / 5.0
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      liveRaporPreview.predicate === 'Exceptional'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : liveRaporPreview.predicate === 'Exceed Target'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : liveRaporPreview.predicate === 'On Target'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : liveRaporPreview.predicate === 'Need Improvement'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {liveRaporPreview.predicate}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-500 block">Status Pencairan Insentif:</span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded ${
                  liveRaporPreview.isEligible
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {liveRaporPreview.isEligible ? 'DIBAYARKAN (ON TARGET+)' : 'DITAHAN / RP 0 (< ON TARGET)'}
              </span>
            </div>
          </div>

          {/* 1. Profil Collector */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-2.5 uppercase tracking-wide text-[11px] flex items-center justify-between">
              <span>1. Identitas &amp; Segmen CO</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nama Lengkap CO</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nomor Induk Karyawan (NIK)</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Role / Segmen Tugas</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as CollectorRole)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FE">Front End (FE 01-30)</option>
                  <option value="MR">Mid Range (MR 31-60)</option>
                  <option value="NOOD">No Overdue (CO NOOD)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Status Portofolio</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Aktif Mengelola Bahan</option>
                  <option value="false">Nonaktif (#N/A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Beban Awal Portofolio & Realisasi Sore */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-2.5 uppercase tracking-wide text-[11px] flex items-center justify-between">
              <span>2. Beban Awal (Portofolio) &amp; Realisasi Hari Ini</span>
              <span className="text-[10px] text-blue-700 font-semibold lowercase">
                *Beban Awal kini dapat diubah sesuai data harian
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Beban Awal Act */}
              <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
                <label className="block text-blue-950 font-bold mb-1">
                  Beban Awal (Jumlah Akun / Kontrak)
                </label>
                <input
                  type="number"
                  value={bahanAwalAct}
                  onChange={(e) => setBahanAwalAct(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-blue-950 font-black focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
                <span className="text-[10px] text-blue-700 block mt-0.5">Total kontrak beban yang ditugaskan</span>
              </div>

              {/* Beban Awal Amt */}
              <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
                <label className="block text-blue-950 font-bold mb-1">
                  Beban Awal (Nominal Rp OS Awal)
                </label>
                <input
                  type="number"
                  value={bahanAwalAmt}
                  onChange={(e) => setBahanAwalAmt(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-blue-950 font-black focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
                <span className="text-[10px] text-blue-700 block mt-0.5">{formatRupiah(bahanAwalAmt)}</span>
              </div>

              {/* Aktual Sore Nominal (Sisa OS) */}
              <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                <label className="block text-amber-950 font-bold mb-1">
                  Aktual Sore (Sisa OS Belum Selesai)
                </label>
                <input
                  type="number"
                  value={aktualSoreAmt}
                  onChange={(e) => setAktualSoreAmt(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-amber-900 font-black focus:ring-2 focus:ring-amber-500"
                  min="0"
                />
                <span className="text-[10px] text-amber-800 block mt-0.5">
                  Sisa OS: {formatRupiah(aktualSoreAmt)} • Tertagih: {formatRupiah(Math.max(0, bahanAwalAmt - aktualSoreAmt))}
                </span>
              </div>

              {/* Aktual Sore Kontrak (Sisa Akun) */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Aktual Sore (Sisa Akun Belum Selesai)</label>
                <input
                  type="number"
                  value={aktualSoreAct}
                  onChange={(e) => setAktualSoreAct(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Tertagih: {Math.max(0, bahanAwalAct - aktualSoreAct)} Akun
                </span>
              </div>

              {/* Kurang Closing */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Kurang Closing (Rp Gap Closing)</label>
                <input
                  type="number"
                  value={kurangClosing}
                  onChange={(e) => setKurangClosing(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {kurangClosing >= 0 ? `Surplus: +${formatRupiah(kurangClosing)}` : `Defisit: ${formatRupiah(kurangClosing)}`}
                </span>
              </div>

              {/* Target Harian */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Target Harian (Rp)</label>
                <input
                  type="number"
                  value={targetHarian}
                  onChange={(e) => setTargetHarian(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">{formatRupiah(targetHarian)}</span>
              </div>
            </div>
          </div>

          {/* 3. Parameter Performance & KPI Penentu Rapor CO */}
          <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200">
            <div className="font-bold text-amber-950 mb-2.5 uppercase tracking-wide text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                3. Parameter Performance &amp; KPI Penentu Rapor CO ({role})
              </span>
              <span className="text-[10px] text-amber-800 font-bold">
                Mempengaruhi Rapor &amp; Insentif Pilar 4
              </span>
            </div>

            {role === 'NOOD' && (
              <div className="mb-3 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  <strong>Portofolio Khusus CO NOOD (No Overdue):</strong> Penilaian utama berfokus pada <strong>BALL No_OD</strong>, <strong>Flow No OD (Bobot 40%)</strong>, serta pengelolaan akun bucket awal <strong>Angsuran 1-3, 1-6, dan 1-9</strong>.
                </span>
              </div>
            )}

            {role === 'FE' || role === 'NOOD' ? (
              /* FE & NOOD Specific KPI Parameters */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-800 font-bold text-[11px]">Flow Ever 01-30 (%)</label>
                    <span className="text-[10px] text-amber-700 font-bold">Bobot 30%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={flowEverFE}
                    onChange={(e) => setFlowEverFE(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-black focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Target: max 45.0% (Tier 5)</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-800 font-bold text-[11px]">Balance / Ball 01-30 (%)</label>
                    <span className="text-[10px] text-amber-700 font-bold">Bobot 30%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={balanceFE}
                    onChange={(e) => setBalanceFE(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-black focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Target: max 8.5% (Tier 5)</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-800 font-bold text-[11px]">Flow No OD (%)</label>
                    <span className="text-[10px] text-amber-700 font-bold">Bobot 40%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={flowNoOdFE}
                    onChange={(e) => setFlowNoOdFE(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-black focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Target: max 2.7% (Tier 5)</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Stay 01-30 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stayPct}
                    onChange={(e) => setStayPct(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Portofolio tetap di bucket 01-30</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Ball 01-30 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ball0130Pct}
                    onChange={(e) => setBall0130Pct(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Rasio Balance Portofolio FE</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">BTC 1-30 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={btcPct}
                    onChange={(e) => setBtcPct(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Target insentif: &gt;30% (+Rp 350k)</span>
                </div>

                {/* NOOD Specific Parameters */}
                <div className="sm:col-span-3 bg-blue-50/80 p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-950 text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      Parameter Portofolio NOOD (No Overdue / Early Accounts)
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-100/80 px-2 py-0.5 rounded">
                      Penentu Kualitas Aset &amp; Kinerja FE
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-2 rounded-lg border border-blue-200">
                      <label className="block text-slate-700 font-bold mb-1 text-[10px]">Ball NO OD (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ballNoOdPct}
                        onChange={(e) => setBallNoOdPct(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-black text-xs"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">Kualitas akun No OD</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-blue-200">
                      <label className="block text-slate-700 font-bold mb-1 text-[10px]">Angsuran Ke 1-3</label>
                      <input
                        type="number"
                        value={angsuran1_3}
                        onChange={(e) => setAngsuran1_3(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-bold text-xs"
                        min="0"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">Kontrak angsuran 1-3</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-blue-200">
                      <label className="block text-slate-700 font-bold mb-1 text-[10px]">Angsuran Ke 1-6</label>
                      <input
                        type="number"
                        value={angsuran1_6}
                        onChange={(e) => setAngsuran1_6(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-bold text-xs"
                        min="0"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">Kontrak angsuran 1-6</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-blue-200">
                      <label className="block text-slate-700 font-bold mb-1 text-[10px]">Angsuran Ke 1-9</label>
                      <input
                        type="number"
                        value={angsuran1_9}
                        onChange={(e) => setAngsuran1_9(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-bold text-xs"
                        min="0"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">Kontrak angsuran 1-9</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* MR Specific KPI Parameters */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-800 font-bold text-[11px]">Flow Ever 31-60 (%)</label>
                    <span className="text-[10px] text-purple-700 font-bold">Bobot 30%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={flowEverMR}
                    onChange={(e) => setFlowEverMR(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-black focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Target: max 55.0% (Tier 5)</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-800 font-bold text-[11px]">Balance MR 31-60 (%)</label>
                    <span className="text-[10px] text-purple-700 font-bold">Bobot 30%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={balanceMR}
                    onChange={(e) => setBalanceMR(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-black focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Target: max 1.8% (Tier 5)</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-800 font-bold text-[11px]">Flow Forward (%)</label>
                    <span className="text-[10px] text-purple-700 font-bold">Bobot 40%</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={flowForwardMR}
                    onChange={(e) => setFlowForwardMR(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-black focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Target: max 7.0% (Tier 5)</span>
                </div>

                <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-200 sm:col-span-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                        Komponen Penilaian Insentif Success Rate MR (Rollback + BTC + Pelunasan)
                      </span>
                      <span className="text-[10px] text-purple-700 block">
                        Ketentuan: Insentif Rp 350.000 diberikan jika total Success Rate &gt; 30%
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-purple-900 text-amber-300 font-black text-xs">
                      Total: {formatPercent(Number(rollbackPct) + Number(btcMRPct) + Number(pelunasanPct))}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white p-2 rounded-lg border border-purple-300">
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">1. Rollback (%)</label>
                      <input
                        type="number"
                        step="any"
                        value={rollbackPct}
                        onChange={(e) => setRollbackPct(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-purple-950 font-bold text-xs"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">Penurunan bucket keterlambatan</span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-purple-300">
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">2. BTC MR (%)</label>
                      <input
                        type="number"
                        step="any"
                        value={btcMRPct}
                        onChange={(e) => setBtcMRPct(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-purple-950 font-bold text-xs"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">Back To Current</span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-purple-300">
                      <label className="block text-slate-700 font-bold mb-1 text-[11px]">3. Pelunasan (%)</label>
                      <input
                        type="number"
                        step="any"
                        value={pelunasanPct}
                        onChange={(e) => setPelunasanPct(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-purple-950 font-bold text-xs"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">Pelunasan penuh kontrak</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Delq 30+ (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={delq30Pct}
                    onChange={(e) => setDelq30Pct(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Tingkat Delinquency portofolio MR</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Ball 31-60 (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={ball3160Pct}
                    onChange={(e) => setBall3160Pct(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Rasio Balance Portofolio MR</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Milestone Mingguan W1..W4 */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-2.5 uppercase tracking-wide text-[11px]">
              4. Pencapaian Penyelesaian Mingguan W1 - W4 (%)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">W1 (tgl 7)</label>
                <input
                  type="number"
                  step="0.1"
                  value={w1}
                  onChange={(e) => setW1(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">W2 (tgl 14)</label>
                <input
                  type="number"
                  step="0.1"
                  value={w2}
                  onChange={(e) => setW2(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">W3 (tgl 21)</label>
                <input
                  type="number"
                  step="0.1"
                  value={w3}
                  onChange={(e) => setW3(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">W4 (tgl 28)</label>
                <input
                  type="number"
                  step="0.1"
                  value={w4}
                  onChange={(e) => setW4(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-blue-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 5. DKH, Tarikan Barang, & BASTK */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-2.5 uppercase tracking-wide text-[11px]">
              5. DKH, Tarikan Unit &amp; BASTK
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">% DKH Dikerjakan</label>
                <input
                  type="number"
                  step="0.1"
                  value={dkhPct}
                  onChange={(e) => setDkhPct(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Target: ≥95% (Multiplier 100%)</span>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Unit Motor (x Rp 200k)</label>
                <input
                  type="number"
                  value={motor}
                  onChange={(e) => setMotor(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Unit Mobil (x Rp 500k)</label>
                <input
                  type="number"
                  value={mobil}
                  onChange={(e) => setMobil(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Kelengkapan BASTK</label>
                <select
                  value={bastkStatus}
                  onChange={(e) => setBastkStatus(e.target.value as BASTKStatus)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lengkap">Lengkap (100% Payout)</option>
                  <option value="tidak_lengkap">Tidak Lengkap (75% Payout)</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Perubahan Beban Awal &amp; Performance KPI langsung menyinkronkan tabel, skor rapor, dan insentif.
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-md shadow-blue-950/20 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Performance &amp; Insentif</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
