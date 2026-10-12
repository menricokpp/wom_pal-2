import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  DollarSign, 
  FileSpreadsheet, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  CollectorRecord, 
  CollectorRole, 
  BASTKStatus,
  RaporMetricsFE,
  RaporMetricsMR
} from '../types';
import { formatRupiah } from '../utils/calculations';

interface AddCollectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCollector: CollectorRecord) => void;
  existingCount: number;
}

export const AddCollectorModal: React.FC<AddCollectorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingCount,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [role, setRole] = useState<CollectorRole>('FE');
  
  // Beban Awal
  const [bahanAwalAct, setBahanAwalAct] = useState<number>(25);
  const [bahanAwalAmt, setBahanAwalAmt] = useState<number>(500000000);
  
  // Aktual Sore (Sisa yang belum selesai)
  const [aktualSoreAct, setAktualSoreAct] = useState<number>(15);
  const [aktualSoreAmt, setAktualSoreAmt] = useState<number>(300000000);
  
  // Targets & Realisasi
  const [targetHarian, setTargetHarian] = useState<number>(250000);
  const [kurangClosing, setKurangClosing] = useState<number>(0);
  
  // DKH & Unit Tarikan
  const [dkhPct, setDkhPct] = useState<number>(96.0);
  const [motor, setMotor] = useState<number>(0);
  const [mobil, setMobil] = useState<number>(0);
  const [bastkStatus, setBastkStatus] = useState<BASTKStatus>('lengkap');
  
  // BTC & KPI
  const [btcPct, setBtcPct] = useState<number>(75.0);
  const [successRateMRPct, setSuccessRateMRPct] = useState<number>(35.0);
  
  // FE KPI
  const [flowEverFE, setFlowEverFE] = useState<number>(45.0);
  const [balanceFE, setBalanceFE] = useState<number>(8.0);
  const [flowNoOdFE, setFlowNoOdFE] = useState<number>(2.5);
  const [ballNoOdPct, setBallNoOdPct] = useState<number>(96.5);
  const [stayPct, setStayPct] = useState<number>(18.0);
  const [ball0130Pct, setBall0130Pct] = useState<number>(2.0);
  
  // MR KPI
  const [flowEverMR, setFlowEverMR] = useState<number>(52.0);
  const [balanceMR, setBalanceMR] = useState<number>(1.5);
  const [flowForwardMR, setFlowForwardMR] = useState<number>(6.0);
  const [delq30Pct, setDelq30Pct] = useState<number>(2.0);
  const [ball3160Pct, setBall3160Pct] = useState<number>(1.0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-calculated realisasi
  const calculatedRealAmt = Math.max(0, bahanAwalAmt - aktualSoreAmt);
  const calculatedRealAct = Math.max(0, bahanAwalAct - aktualSoreAct);
  const calculatedW1 = bahanAwalAmt > 0 
    ? Math.round((((calculatedRealAmt / bahanAwalAmt) * 100) + Number.EPSILON) * 10000) / 10000 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama Collection Officer (CO) wajib diisi');
      return;
    }
    if (!nik.trim()) {
      setErrorMsg('NIK (Nomor Induk Karyawan) wajib diisi');
      return;
    }

    const cleanName = name.trim().toUpperCase();
    const cleanNik = nik.trim();

    const raporFE: RaporMetricsFE | undefined = role === 'FE'
      ? {
          flowEver: Number(flowEverFE),
          balance: Number(balanceFE),
          flowNoOd: Number(flowNoOdFE),
        }
      : undefined;

    const raporMR: RaporMetricsMR | undefined = role === 'MR'
      ? {
          flowEver: Number(flowEverMR),
          balance: Number(balanceMR),
          flowForward: Number(flowForwardMR),
        }
      : undefined;

    const newRecord: CollectorRecord = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nik: cleanNik,
      name: cleanName,
      primaryRole: role,
      isActive: true,
      bahanAwalAct: Number(bahanAwalAct) || 0,
      bahanAwalAmt: Number(bahanAwalAmt) || 0,
      aktualSoreAct: Number(aktualSoreAct) || 0,
      aktualSoreAmt: Number(aktualSoreAmt) || 0,
      realisasiAmt: calculatedRealAmt,
      kurangClosing: Number(kurangClosing) || 0,
      targetHarian: Number(targetHarian) || 0,
      kurangTargetHarian: Number(targetHarian) || 0,
      btcPct: Number(btcPct) || 0,
      stayPct: role === 'FE' ? Number(stayPct) : undefined,
      ball0130Pct: role === 'FE' ? Number(ball0130Pct) : undefined,
      ballNoOdPct: role === 'FE' ? Number(ballNoOdPct) : undefined,
      delq30Pct: role === 'MR' ? Number(delq30Pct) : undefined,
      ball3160Pct: role === 'MR' ? Number(ball3160Pct) : undefined,
      successRateMRPct: role === 'MR' ? Number(successRateMRPct) : undefined,
      weeklyProgress: {
        w1: calculatedW1,
        w2: 0,
        w3: 0,
        w4: 0,
      },
      dkhPct: Number(dkhPct) || 96.0,
      unitTarikan: {
        motor: Number(motor) || 0,
        mobil: Number(mobil) || 0,
      },
      bastkStatus,
      raporFE,
      raporMR,
      updatedAt: new Date().toISOString(),
      notes: `Petugas CO ${role} baru ditambahkan (Total ke-${existingCount + 1})`,
    };

    onAdd(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Tambah Collection Officer (CO) Baru
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Tambahkan petugas CO baru ke dalam sistem monitoring cabang Palembang 2
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Profil CO */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              1. Identitas & Segmen Penugasan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Lengkap Petugas CO <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BUDI SANTOSO"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  NIK Karyawan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 4402619001"
                  value={nik}
                  onChange={(e) => {
                    setNik(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">
                  Segmen Penugasan (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      role === 'FE'
                        ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="FE"
                      checked={role === 'FE'}
                      onChange={() => setRole('FE')}
                      className="text-blue-600"
                    />
                    <div className="ml-2.5">
                      <div className="font-extrabold text-blue-950 text-xs">Front End (FE)</div>
                      <div className="text-[10px] text-slate-500">Overdue 01 - 30 hari</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      role === 'MR'
                        ? 'bg-purple-50/80 border-purple-500 ring-1 ring-purple-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="MR"
                      checked={role === 'MR'}
                      onChange={() => setRole('MR')}
                      className="text-purple-600"
                    />
                    <div className="ml-2.5">
                      <div className="font-extrabold text-purple-950 text-xs">Mid Range (MR)</div>
                      <div className="text-[10px] text-slate-500">Overdue 31 - 60 hari</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Portofolio Beban Awal & Aktual Sore */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-extrabold text-slate-900 flex items-center justify-between uppercase text-[11px] tracking-wide">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                2. Beban Awal & Sisa OS Aktual Sore
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                Realisasi = Beban Awal - Aktual Sore
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Beban Awal: Jumlah Akun (Kontrak)
                </label>
                <input
                  type="number"
                  min="1"
                  value={bahanAwalAct}
                  onChange={(e) => setBahanAwalAct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Beban Awal: Nominal OS (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={bahanAwalAmt}
                  onChange={(e) => setBahanAwalAmt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {formatRupiah(bahanAwalAmt)}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Aktual Sore: Sisa Akun Belum Selesai
                </label>
                <input
                  type="number"
                  min="0"
                  value={aktualSoreAct}
                  onChange={(e) => setAktualSoreAct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Aktual Sore: Sisa Nominal OS Belum Selesai (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={aktualSoreAmt}
                  onChange={(e) => setAktualSoreAmt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {formatRupiah(aktualSoreAmt)}
                </span>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-800 font-semibold">HASIL REALISASI TERHITUNG:</div>
                <div className="text-sm font-extrabold text-emerald-950">
                  {formatRupiah(calculatedRealAmt)} ({calculatedRealAct} Akun)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-800 font-semibold">W1 PENYELESAIAN:</div>
                <div className="text-base font-black text-emerald-700">
                  {calculatedW1}%
                </div>
              </div>
            </div>
          </div>

          {/* Target & KPI Parameters */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              3. Target Harian & Parameter Rapor 2026
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Harian (Rp)</label>
                <input
                  type="number"
                  value={targetHarian}
                  onChange={(e) => setTargetHarian(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">DKH Dikerjakan (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dkhPct}
                  onChange={(e) => setDkhPct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
                <span className="text-[10px] text-slate-500">Tier ≥95%: 100% Insentif</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {role === 'FE' ? 'BTC 1-30 (%)' : 'Success Rate 31-60 (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={role === 'FE' ? btcPct : successRateMRPct}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (role === 'FE') setBtcPct(val);
                    else setSuccessRateMRPct(val);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
                <span className="text-[10px] text-slate-500">&gt;30%: +Rp 350.000</span>
              </div>

              {/* Rapor metrics based on role */}
              {role === 'FE' ? (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Flow Ever 1-30 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={flowEverFE}
                      onChange={(e) => setFlowEverFE(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[10px] text-slate-500">Target ≤45% (Bobot 30%)</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Balance 1-30 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={balanceFE}
                      onChange={(e) => setBalanceFE(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[10px] text-slate-500">Target ≤8.5% (Bobot 30%)</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Flow No OD (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={flowNoOdFE}
                      onChange={(e) => setFlowNoOdFE(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[10px] text-slate-500">Target ≤2.7% (Bobot 40%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Flow Ever 31-60 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={flowEverMR}
                      onChange={(e) => setFlowEverMR(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[10px] text-slate-500">Target ≤55% (Bobot 30%)</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Balance 31-60 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={balanceMR}
                      onChange={(e) => setBalanceMR(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[10px] text-slate-500">Target ≤1.8% (Bobot 30%)</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Flow Forward 1-30 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={flowForwardMR}
                      onChange={(e) => setFlowForwardMR(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[10px] text-slate-500">Target ≤6.6% (Bobot 40%)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tarik Kendaraan */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wide">
              4. Tarikan Kendaraan (Opsional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tarik Motor (@Rp 200k)</label>
                <input
                  type="number"
                  min="0"
                  value={motor}
                  onChange={(e) => setMotor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tarik Mobil (@Rp 500k)</label>
                <input
                  type="number"
                  min="0"
                  value={mobil}
                  onChange={(e) => setMobil(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status BASTK</label>
                <select
                  value={bastkStatus}
                  onChange={(e) => setBastkStatus(e.target.value as BASTKStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  <option value="lengkap">Lengkap (100% Payout)</option>
                  <option value="tidak_lengkap">Tidak Lengkap (75% Payout)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/20 cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Simpan &amp; Tambahkan CO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
