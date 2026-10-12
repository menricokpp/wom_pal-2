import React, { useState, useEffect } from 'react';
import { 
  CollectorRecord, 
  CollectorRole, 
  WeeklyProgress, 
  BASTKStatus, 
  UnitTarikan 
} from '../types';
import { 
  calculateIncentive, 
  formatRupiah, 
  formatPercent 
} from '../utils/calculations';
import { 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Check, 
  Save, 
  ArrowRight,
  ShieldCheck,
  Bike,
  Car
} from 'lucide-react';

interface IncentiveCalculatorProps {
  collectors: CollectorRecord[];
  onApplyToCollector: (updatedCollector: CollectorRecord) => void;
}

export const IncentiveCalculator: React.FC<IncentiveCalculatorProps> = ({
  collectors,
  onApplyToCollector,
}) => {
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('custom');
  const [role, setRole] = useState<CollectorRole>('FE');
  const [isHead, setIsHead] = useState<boolean>(false);
  const [calcMode, setCalcMode] = useState<'current_date' | 'full_month'>('current_date');
  const [weekly, setWeekly] = useState<WeeklyProgress>({ w1: 42, w2: 0, w3: 0, w4: 0 });
  const [dkhPct, setDkhPct] = useState<number>(96);
  const [unitTarikan, setUnitTarikan] = useState<UnitTarikan>({ motor: 1, mobil: 0 });
  const [bastkStatus, setBastkStatus] = useState<BASTKStatus>('lengkap');
  const [btcPct, setBtcPct] = useState<number>(65);

  // Rapor FE inputs
  const [flowEverFE, setFlowEverFE] = useState<number>(44);
  const [balanceFE, setBalanceFE] = useState<number>(8.2);
  const [flowNoOdFE, setFlowNoOdFE] = useState<number>(2.5);

  // Rapor MR inputs
  const [flowEverMR, setFlowEverMR] = useState<number>(53);
  const [balanceMR, setBalanceMR] = useState<number>(1.6);
  const [flowForwardMR, setFlowForwardMR] = useState<number>(6.4);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // When collector selection changes
  const handleSelectCollector = (id: string) => {
    setSelectedCollectorId(id);
    if (id === 'custom') return;

    const col = collectors.find((c) => c.id === id);
    if (!col) return;

    setRole(col.primaryRole);
    setIsHead(!!col.isBranchHead);
    setWeekly({ ...col.weeklyProgress });
    setDkhPct(col.dkhPct);
    setUnitTarikan({ ...col.unitTarikan });
    setBastkStatus(col.bastkStatus);
    setBtcPct(col.btcPct);

    if (col.raporFE) {
      setFlowEverFE(col.raporFE.flowEver);
      setBalanceFE(col.raporFE.balance);
      setFlowNoOdFE(col.raporFE.flowNoOd);
    }
    if (col.raporMR) {
      setFlowEverMR(col.raporMR.flowEver);
      setBalanceMR(col.raporMR.balance);
      setFlowForwardMR(col.raporMR.flowForward);
    }
  };

  // Build dummy collector object for live computation
  const simulationCollector: CollectorRecord = {
    id: selectedCollectorId === 'custom' ? 'sim-temp' : selectedCollectorId,
    nik: '99999999',
    name: selectedCollectorId === 'custom' ? 'Simulasi Bebas' : collectors.find(c => c.id === selectedCollectorId)?.name || 'Collector',
    primaryRole: role,
    isActive: true,
    isBranchHead: isHead,
    bahanAwalAct: 30,
    bahanAwalAmt: 500000000,
    aktualSoreAct: 3,
    aktualSoreAmt: 25000000,
    realisasiAmt: 25000000,
    btcPct: btcPct,
    kurangClosing: 0,
    targetHarian: 1000000,
    kurangTargetHarian: 0,
    weeklyProgress: weekly,
    dkhPct: dkhPct,
    unitTarikan: unitTarikan,
    bastkStatus: bastkStatus,
    raporFE: role === 'FE' ? { flowEver: flowEverFE, balance: balanceFE, flowNoOd: flowNoOdFE } : undefined,
    raporMR: role === 'MR' ? { flowEver: flowEverMR, balance: balanceMR, flowForward: flowForwardMR } : undefined,
  };

  const calcResult = calculateIncentive(simulationCollector, calcMode);

  const handleApply = () => {
    if (selectedCollectorId === 'custom') {
      alert('Pilih collector terlebih dahulu pada menu dropdown untuk menerapkan hasil simulasi ke database.');
      return;
    }
    const original = collectors.find((c) => c.id === selectedCollectorId);
    if (!original) return;

    const updated: CollectorRecord = {
      ...original,
      primaryRole: role,
      weeklyProgress: weekly,
      dkhPct: dkhPct,
      unitTarikan: unitTarikan,
      bastkStatus: bastkStatus,
      btcPct: btcPct,
      raporFE: role === 'FE' ? { flowEver: flowEverFE, balance: balanceFE, flowNoOd: flowNoOdFE } : original.raporFE,
      raporMR: role === 'MR' ? { flowEver: flowEverMR, balance: balanceMR, flowForward: flowForwardMR } : original.raporMR,
      updatedAt: new Date().toISOString(),
    };

    onApplyToCollector(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-amber-400 text-blue-950">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              Simulator & Kalkulator Insentif Cepat
              <span className="text-[10px] bg-blue-800 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-blue-700">
                Formula WOM 2026
              </span>
            </h2>
            <p className="text-xs text-blue-200">
              Uji skenario target, pergerakan mingguan (W1-W4), DKH, dan unit tarikan secara instan
            </p>
          </div>
        </div>

        {/* Mode Switch & Collector Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-blue-950/80 p-0.5 rounded-lg border border-blue-700 flex text-[11px]">
            <button
              onClick={() => setCalcMode('current_date')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                calcMode === 'current_date'
                  ? 'bg-amber-400 text-blue-950 font-extrabold'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Realistis Hari Ini (W1)
            </button>
            <button
              onClick={() => setCalcMode('full_month')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                calcMode === 'full_month'
                  ? 'bg-amber-400 text-blue-950 font-extrabold'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Proyeksi Full Bulan (W1-W4)
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-blue-200 font-medium">Muat Data:</span>
            <select
              value={selectedCollectorId}
              onChange={(e) => handleSelectCollector(e.target.value)}
              className="bg-blue-950/80 text-white text-xs rounded-lg px-2.5 py-1.5 border border-blue-600 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            >
              <option value="custom">-- Simulasi Bebas / Baru --</option>
              {collectors
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.primaryRole})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Role & Position Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Kategori Jabatan & Segment:</span>
              <span className="text-[10px] text-slate-500">
                Syarat Pencairan: Rapor Minimal ON TARGET (Skor &ge; 3.00)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setRole('FE'); setIsHead(false); }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  role === 'FE' && !isHead
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Front End (CO)
              </button>
              <button
                type="button"
                onClick={() => { setRole('MR'); setIsHead(false); }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  role === 'MR' && !isHead
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Mid Range (CO)
              </button>
              <button
                type="button"
                onClick={() => setIsHead(true)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  isHead
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Branch Head (BCH/BRH)
              </button>
            </div>
          </div>

          {/* 1. Weekly Sliders (W1 - W4) */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                1. Pencapaian Penyelesaian Mingguan (% Target)
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Total Reward: {formatRupiah(calcResult.totalPenyelesaian)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* W1 */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">W1 (tgl 7)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w1: Math.max(0, Number((weekly.w1 - 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Kurang 0.1%"
                    >
                      -
                    </button>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={weekly.w1}
                        onChange={(e) => setWeekly({ ...weekly, w1: Math.max(0, Math.min(100, Number(Number(e.target.value).toFixed(1)))) })}
                        className="w-14 text-center font-bold text-blue-900 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[11px] text-slate-600 font-bold">%</span>
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w1: Math.min(100, Number((weekly.w1 + 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Tambah 0.1%"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={weekly.w1}
                  onChange={(e) => setWeekly({ ...weekly, w1: Number(Number(e.target.value).toFixed(1)) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Tier FE: &gt;35%: 500k | &gt;40%: 750k</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(calcResult.w1Incentive)}</span>
                </div>
              </div>

              {/* W2 */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">W2 (tgl 14)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w2: Math.max(0, Number((weekly.w2 - 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Kurang 0.1%"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={weekly.w2}
                      onChange={(e) => setWeekly({ ...weekly, w2: Math.max(0, Math.min(100, Number(Number(e.target.value).toFixed(1)))) })}
                      className="w-14 text-center font-bold text-blue-900 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 font-bold">%</span>
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w2: Math.min(100, Number((weekly.w2 + 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Tambah 0.1%"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={weekly.w2}
                  onChange={(e) => setWeekly({ ...weekly, w2: Number(Number(e.target.value).toFixed(1)) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Tier FE: &gt;55%: 500k | &gt;60%: 750k</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(calcResult.w2Incentive)}</span>
                </div>
              </div>

              {/* W3 */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">W3 (tgl 21)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w3: Math.max(0, Number((weekly.w3 - 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Kurang 0.1%"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={weekly.w3}
                      onChange={(e) => setWeekly({ ...weekly, w3: Math.max(0, Math.min(100, Number(Number(e.target.value).toFixed(1)))) })}
                      className="w-14 text-center font-bold text-blue-900 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 font-bold">%</span>
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w3: Math.min(100, Number((weekly.w3 + 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Tambah 0.1%"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={weekly.w3}
                  onChange={(e) => setWeekly({ ...weekly, w3: Number(Number(e.target.value).toFixed(1)) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Tier FE: &gt;70%: 250k | &gt;75%: 500k</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(calcResult.w3Incentive)}</span>
                </div>
              </div>

              {/* W4 */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">W4 (tgl 28)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w4: Math.max(0, Number((weekly.w4 - 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Kurang 0.1%"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={weekly.w4}
                      onChange={(e) => setWeekly({ ...weekly, w4: Math.max(0, Math.min(100, Number(Number(e.target.value).toFixed(1)))) })}
                      className="w-14 text-center font-bold text-blue-900 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 font-bold">%</span>
                    <button
                      type="button"
                      onClick={() => setWeekly({ ...weekly, w4: Math.min(100, Number((weekly.w4 + 0.1).toFixed(1))) })}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                      title="Tambah 0.1%"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={weekly.w4}
                  onChange={(e) => setWeekly({ ...weekly, w4: Number(Number(e.target.value).toFixed(1)) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Tier FE: &gt;90%: 250k | &gt;95%: 500k</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(calcResult.w4Incentive)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DKH Adjustment Slider */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                2. % DKH Balance Dikerjakan (Adjustment)
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  calcResult.dkhMultiplier === 1.0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : calcResult.dkhMultiplier === 0.75
                    ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                Multiplier: {calcResult.dkhMultiplier * 100}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDkhPct(Math.max(50, Number((dkhPct - 0.1).toFixed(1))))}
                className="w-6 h-6 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-xs cursor-pointer"
                title="Kurang 0.1%"
              >
                -
              </button>
              <input
                type="range"
                min="50"
                max="100"
                step="0.1"
                value={dkhPct}
                onChange={(e) => setDkhPct(Number(Number(e.target.value).toFixed(1)))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setDkhPct(Math.min(100, Number((dkhPct + 0.1).toFixed(1))))}
                className="w-6 h-6 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-xs cursor-pointer"
                title="Tambah 0.1%"
              >
                +
              </button>
              <div className="flex items-center space-x-0.5">
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="100"
                  value={dkhPct}
                  onChange={(e) => setDkhPct(Math.max(0, Math.min(100, Number(Number(e.target.value).toFixed(1)))))}
                  className="w-16 text-center font-extrabold text-blue-950 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-600">%</span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>&lt; 75%: 0%</span>
              <span>75% - &lt; 95%: 75%</span>
              <span className="font-bold text-emerald-700">≥ 95%: 100%</span>
            </div>
          </div>

          {/* 3. Tarikan Unit & BASTK */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                3. Insentif Tarik Barang & Kelengkapan BASTK
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Reward Tarik: {formatRupiah(calcResult.tarikBarangAdjusted)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Unit Motor */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold mb-1">
                  <Bike className="w-3.5 h-3.5 text-blue-600" />
                  <span>Motor (@Rp 200k)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUnitTarikan({ ...unitTarikan, motor: Math.max(0, unitTarikan.motor - 1) })}
                    className="w-7 h-7 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-slate-900">
                    {unitTarikan.motor} Unit
                  </span>
                  <button
                    type="button"
                    onClick={() => setUnitTarikan({ ...unitTarikan, motor: unitTarikan.motor + 1 })}
                    className="w-7 h-7 bg-blue-900 border border-blue-900 rounded text-white font-bold hover:bg-blue-800 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Unit Mobil */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold mb-1">
                  <Car className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mobil (@Rp 500k)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUnitTarikan({ ...unitTarikan, mobil: Math.max(0, unitTarikan.mobil - 1) })}
                    className="w-7 h-7 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-slate-900">
                    {unitTarikan.mobil} Unit
                  </span>
                  <button
                    type="button"
                    onClick={() => setUnitTarikan({ ...unitTarikan, mobil: unitTarikan.mobil + 1 })}
                    className="w-7 h-7 bg-blue-900 border border-blue-900 rounded text-white font-bold hover:bg-blue-800 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* BASTK Toggle */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-700 font-semibold mb-1">BASTK Lengkap?</div>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setBastkStatus('lengkap')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded cursor-pointer transition-all ${
                      bastkStatus === 'lengkap'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Lengkap (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBastkStatus('tidak_lengkap')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded cursor-pointer transition-all ${
                      bastkStatus === 'tidak_lengkap'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Kurang (75%)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. BTC / Success Rate Slider */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                4. {role === 'FE' ? 'Insentif BTC 1-30 (> 30%)' : 'Insentif Success Rate 31-60 (> 30%)'}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  calcResult.btcQualified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {calcResult.btcQualified ? '+ Rp 350.000' : 'Rp 0 (Target > 30%)'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setBtcPct(Math.max(0, Number((btcPct - 0.1).toFixed(1))))}
                className="w-6 h-6 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-xs cursor-pointer"
                title="Kurang 0.1%"
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={btcPct}
                onChange={(e) => setBtcPct(Number(Number(e.target.value).toFixed(1)))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setBtcPct(Math.min(100, Number((btcPct + 0.1).toFixed(1))))}
                className="w-6 h-6 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-xs cursor-pointer"
                title="Tambah 0.1%"
              >
                +
              </button>
              <div className="flex items-center space-x-0.5">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={btcPct}
                  onChange={(e) => setBtcPct(Math.max(0, Math.min(100, Number(Number(e.target.value).toFixed(1)))))}
                  className="w-16 text-center font-extrabold text-blue-950 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-600">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Calculation Card */}
          <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xl border border-blue-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center justify-between mb-1">
              <span>Hasil Estimasi Insentif</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>

            <div className="text-3xl font-black tracking-tight text-white mb-1">
              {formatRupiah(calcResult.grandTotal)}
            </div>

            <div className="flex items-center space-x-2 text-xs mb-4">
              <span
                className={`px-2 py-0.5 rounded-full font-bold flex items-center ${
                  calcResult.isEligiblePayout
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {calcResult.isEligiblePayout ? '✓ Rapor On Target' : '! Rapor Di Bawah Target'}
              </span>
              <span className="text-blue-300">
                Predikat: <strong className="text-white">{calcResult.raporPredicate}</strong> ({calcResult.raporTotalScore}/5.0)
              </span>
            </div>

            {/* Formula Step-by-Step Breakdown */}
            <div className="bg-blue-900/50 rounded-xl p-3.5 border border-blue-800/80 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wide border-b border-blue-800 pb-1">
                Rincian Kalkulasi:
              </div>

              {/* 1. Penyelesaian x DKH */}
              <div className="flex justify-between items-center text-blue-100">
                <span>Insentif Penyelesaian:</span>
                <span className="font-semibold">{formatRupiah(calcResult.totalPenyelesaian)}</span>
              </div>
              <div className="flex justify-between items-center text-blue-300 text-[11px] pl-2 border-l-2 border-blue-600">
                <span>× Adjustment DKH ({calcResult.dkhMultiplier * 100}%):</span>
                <span className="font-bold text-amber-300">{formatRupiah(calcResult.penyelesaianAdjusted)}</span>
              </div>

              {/* 2. Tarik Barang x BASTK */}
              <div className="flex justify-between items-center text-blue-100 pt-1">
                <span>Insentif Tarik Barang:</span>
                <span className="font-semibold">{formatRupiah(calcResult.totalTarikBarang)}</span>
              </div>
              <div className="flex justify-between items-center text-blue-300 text-[11px] pl-2 border-l-2 border-blue-600">
                <span>× Adjustment BASTK ({calcResult.bastkMultiplier * 100}%):</span>
                <span className="font-bold text-amber-300">{formatRupiah(calcResult.tarikBarangAdjusted)}</span>
              </div>

              {/* 3. BTC */}
              <div className="flex justify-between items-center text-blue-100 pt-1">
                <span>Insentif BTC / Success Rate:</span>
                <span className="font-bold text-amber-300">{formatRupiah(calcResult.btcOrSuccessRateIncentive)}</span>
              </div>

              {/* 4. Evaluasi Syarat Kelayakan Pencairan Rapor */}
              <div className="flex justify-between items-center text-blue-100 pt-1">
                <span>Syarat Rapor ({calcResult.raporPredicate}):</span>
                <span className={`font-bold ${calcResult.isEligiblePayout ? 'text-emerald-300' : 'text-red-400'}`}>
                  {calcResult.isEligiblePayout ? '✓ On Target (Dibayarkan)' : '✕ Di Bawah Target (Hold)'}
                </span>
              </div>

              {/* Grand Total Row */}
              <div className="pt-2 border-t border-blue-700/80 flex justify-between items-center font-bold text-sm text-white">
                <span>Total Insentif Dibayarkan:</span>
                <span className="text-amber-400 font-extrabold text-base">{formatRupiah(calcResult.grandTotal)}</span>
              </div>
            </div>

            {/* Apply button to push changes */}
            {selectedCollectorId !== 'custom' && (
              <button
                type="button"
                onClick={handleApply}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" />
                    <span>Berhasil Disimpan ke Collector!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Terapkan Hasil Simulasi ke {collectors.find(c => c.id === selectedCollectorId)?.name}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Rapor Parameters Adjustment */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
              Komponen Rapor Remedial {role} (Bobot 30% / 30% / 40%)
            </div>
            {role === 'FE' ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 text-[11px] mb-1">
                    <span>Flow Ever 1-30 (30%):</span>
                    <span className="font-bold text-slate-800">{flowEverFE}% (Target ≤45%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setFlowEverFE(Math.max(30, Number((flowEverFE - 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="30"
                      max="75"
                      step="0.1"
                      value={flowEverFE}
                      onChange={(e) => setFlowEverFE(Number(Number(e.target.value).toFixed(1)))}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setFlowEverFE(Math.min(75, Number((flowEverFE + 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 text-[11px] mb-1">
                    <span>Balance 1-30 (30%):</span>
                    <span className="font-bold text-slate-800">{balanceFE}% (Target ≤8.5%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setBalanceFE(Math.max(5, Number((balanceFE - 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="0.1"
                      value={balanceFE}
                      onChange={(e) => setBalanceFE(Number(Number(e.target.value).toFixed(1)))}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setBalanceFE(Math.min(15, Number((balanceFE + 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 text-[11px] mb-1">
                    <span>Flow No OD (40%):</span>
                    <span className="font-bold text-slate-800">{flowNoOdFE}% (Target ≤2.7%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setFlowNoOdFE(Math.max(1.5, Number((flowNoOdFE - 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="1.5"
                      max="6.0"
                      step="0.1"
                      value={flowNoOdFE}
                      onChange={(e) => setFlowNoOdFE(Number(Number(e.target.value).toFixed(1)))}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setFlowNoOdFE(Math.min(6.0, Number((flowNoOdFE + 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 text-[11px] mb-1">
                    <span>Flow Ever 31-60 (30%):</span>
                    <span className="font-bold text-slate-800">{flowEverMR}% (Target ≤55%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setFlowEverMR(Math.max(40, Number((flowEverMR - 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="40"
                      max="80"
                      step="0.1"
                      value={flowEverMR}
                      onChange={(e) => setFlowEverMR(Number(Number(e.target.value).toFixed(1)))}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setFlowEverMR(Math.min(80, Number((flowEverMR + 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 text-[11px] mb-1">
                    <span>Balance 31-60 (30%):</span>
                    <span className="font-bold text-slate-800">{balanceMR}% (Target ≤1.8%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setBalanceMR(Math.max(1.0, Number((balanceMR - 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="1.0"
                      max="4.0"
                      step="0.1"
                      value={balanceMR}
                      onChange={(e) => setBalanceMR(Number(Number(e.target.value).toFixed(1)))}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setBalanceMR(Math.min(4.0, Number((balanceMR + 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 text-[11px] mb-1">
                    <span>Flow Forward 1-30 (40%):</span>
                    <span className="font-bold text-slate-800">{flowForwardMR}% (Target ≤6.6%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setFlowForwardMR(Math.max(3.0, Number((flowForwardMR - 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="3.0"
                      max="12.0"
                      step="0.1"
                      value={flowForwardMR}
                      onChange={(e) => setFlowForwardMR(Number(Number(e.target.value).toFixed(1)))}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setFlowForwardMR(Math.min(12.0, Number((flowForwardMR + 0.1).toFixed(1))))}
                      className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
