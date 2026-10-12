import {
  CollectorRecord,
  IncentiveCalculationResult,
  WeeklyProgress,
  BASTKStatus,
  RaporMetricsFE,
  RaporMetricsMR,
  RaporPredicateType,
  CalculationMode,
} from '../types';

export function getFEWeeklyIncentive(w: WeeklyProgress, mode: CalculationMode = 'full_month') {
  let w1 = 0;
  if (w.w1 > 40) w1 = 750000;
  else if (w.w1 > 35) w1 = 500000;

  // In current_date mode (October 3rd, 2026), only W1 (cut-off tgl 7) is currently active.
  // W2, W3, W4 have not occurred yet.
  if (mode === 'current_date') {
    return { w1, w2: 0, w3: 0, w4: 0, total: w1 };
  }

  let w2 = 0;
  if (w.w2 > 60) w2 = 750000;
  else if (w.w2 > 55) w2 = 500000;

  let w3 = 0;
  if (w.w3 > 75) w3 = 500000;
  else if (w.w3 > 70) w3 = 250000;

  let w4 = 0;
  if (w.w4 > 95) w4 = 500000;
  else if (w.w4 > 90) w4 = 250000;

  return { w1, w2, w3, w4, total: w1 + w2 + w3 + w4 };
}

export function getMRWeeklyIncentive(w: WeeklyProgress, mode: CalculationMode = 'full_month') {
  let w1 = 0;
  if (w.w1 > 30) w1 = 750000;
  else if (w.w1 > 25) w1 = 500000;

  // In current_date mode (October 3rd, 2026), only W1 is active.
  if (mode === 'current_date') {
    return { w1, w2: 0, w3: 0, w4: 0, total: w1 };
  }

  let w2 = 0;
  if (w.w2 > 50) w2 = 750000;
  else if (w.w2 > 45) w2 = 500000;

  let w3 = 0;
  if (w.w3 > 65) w3 = 500000;
  else if (w.w3 > 60) w3 = 250000;

  let w4 = 0;
  if (w.w4 > 75) w4 = 500000;
  else if (w.w4 > 70) w4 = 250000;

  return { w1, w2, w3, w4, total: w1 + w2 + w3 + w4 };
}

export function getDKHAdjustment(dkhPct: number) {
  if (dkhPct >= 95) {
    return { multiplier: 1.0, tier: '≥ 95% DKH (100%)' };
  } else if (dkhPct >= 75) {
    return { multiplier: 0.75, tier: '75% - < 95% DKH (75%)' };
  } else {
    return { multiplier: 0.0, tier: '< 75% DKH (0%)' };
  }
}

export function getBASTKAdjustment(status: BASTKStatus) {
  if (status === 'lengkap') {
    return { multiplier: 1.0, tier: 'Lengkap (100%)' };
  }
  return { multiplier: 0.75, tier: 'Tidak Lengkap (75%)' };
}

// Official WOM Finance 2026 Point to Rapor Predicate Conversion Table:
// Point 4.50 - 5.00: EXCEPTIONAL
// Point 4.00 - 4.49 (4 - 4,99): EXCEED TARGET
// Point 3.00 - 3.99: ON TARGET (Syarat Minimal Pencairan Insentif)
// Point 2.00 - 2.99 (1,5 - 2,99): NEED IMPROVEMENT (Insentif Ditahan/Tidak Dibayarkan)
// Point 1.00 - 1.99: UNACCEPTABLE (Insentif Ditahan/Tidak Dibayarkan)
export function getPredicateFromPoint(point: number): RaporPredicateType {
  const p = Math.round(point * 100) / 100;
  if (p >= 4.5) {
    return 'Exceptional';
  } else if (p >= 4.0) {
    return 'Exceed Target';
  } else if (p >= 3.0) {
    return 'On Target';
  } else if (p >= 2.0 || p >= 1.5) {
    return 'Need Improvement';
  } else {
    return 'Unacceptable';
  }
}

// Sesuai regulasi terbaru: Tidak ada penambahan uang insentif berdasarkan tiering dari rapor.
// Rapor berfungsi sebagai syarat mutlak pencairan (hanya dibayarkan jika On Target ke atas).
export function getInsentifRapor(_predicate: RaporPredicateType, _isHead = false): number {
  return 0;
}

export const getRaporIncentiveNominal = getInsentifRapor;

export function calculateFERaporScore(metrics?: RaporMetricsFE) {
  if (!metrics) {
    return {
      flowEverScore: 1.2,
      flowEverIndex: 4,
      balanceScore: 1.2,
      balanceIndex: 4,
      flowNoOdScore: 1.6,
      flowNoOdIndex: 4,
      totalScore: 4.0,
      predicate: 'Exceed Target' as RaporPredicateType,
      isEligible: true,
    };
  }

  // 1. Flow Ever 1-30 (Weight 30%)
  let feIndex = 1;
  let feScore = 0.3;
  if (metrics.flowEver <= 45) {
    feIndex = 5;
    feScore = 1.5;
  } else if (metrics.flowEver <= 50) {
    feIndex = 4;
    feScore = 1.2;
  } else if (metrics.flowEver <= 55) {
    feIndex = 3;
    feScore = 0.9;
  } else if (metrics.flowEver <= 60) {
    feIndex = 2;
    feScore = 0.6;
  } else {
    feIndex = 1;
    feScore = 0.3;
  }

  // 2. Balance 1-30 (Weight 30%)
  let balIndex = 1;
  let balScore = 0.3;
  if (metrics.balance <= 8.5) {
    balIndex = 5;
    balScore = 1.5;
  } else if (metrics.balance <= 9.0) {
    balIndex = 4;
    balScore = 1.2;
  } else if (metrics.balance <= 9.5) {
    balIndex = 3;
    balScore = 0.9;
  } else if (metrics.balance <= 10.0) {
    balIndex = 2;
    balScore = 0.6;
  } else {
    balIndex = 1;
    balScore = 0.3;
  }

  // 3. Flow No OD (Weight 40%)
  let nodIndex = 1;
  let nodScore = 0.4;
  if (metrics.flowNoOd <= 2.7) {
    nodIndex = 5;
    nodScore = 2.0;
  } else if (metrics.flowNoOd <= 3.2) {
    nodIndex = 4;
    nodScore = 1.6;
  } else if (metrics.flowNoOd <= 3.7) {
    nodIndex = 3;
    nodScore = 1.2;
  } else if (metrics.flowNoOd <= 4.2) {
    nodIndex = 2;
    nodScore = 0.8;
  } else {
    nodIndex = 1;
    nodScore = 0.4;
  }

  const totalScore = Number((feScore + balScore + nodScore).toFixed(2));
  const predicate = getPredicateFromPoint(totalScore);

  return {
    flowEverScore: feScore,
    flowEverIndex: feIndex,
    balanceScore: balScore,
    balanceIndex: balIndex,
    flowNoOdScore: nodScore,
    flowNoOdIndex: nodIndex,
    totalScore,
    predicate,
    isEligible: totalScore >= 3.0,
  };
}

export function calculateMRRaporScore(metrics?: RaporMetricsMR) {
  if (!metrics) {
    return {
      flowEverScore: 1.2,
      flowEverIndex: 4,
      balanceScore: 1.2,
      balanceIndex: 4,
      flowForwardScore: 1.6,
      flowForwardIndex: 4,
      totalScore: 4.0,
      predicate: 'Exceed Target' as RaporPredicateType,
      isEligible: true,
    };
  }

  // 1. Flow Ever 31-60 (Weight 30%)
  let feIndex = 1;
  let feScore = 0.3;
  if (metrics.flowEver <= 55) {
    feIndex = 5;
    feScore = 1.5;
  } else if (metrics.flowEver <= 60) {
    feIndex = 4;
    feScore = 1.2;
  } else if (metrics.flowEver <= 65) {
    feIndex = 3;
    feScore = 0.9;
  } else if (metrics.flowEver <= 70) {
    feIndex = 2;
    feScore = 0.6;
  } else {
    feIndex = 1;
    feScore = 0.3;
  }

  // 2. Balance 31-60 (Weight 30%)
  let balIndex = 1;
  let balScore = 0.3;
  if (metrics.balance <= 1.8) {
    balIndex = 5;
    balScore = 1.5;
  } else if (metrics.balance <= 2.0) {
    balIndex = 4;
    balScore = 1.2;
  } else if (metrics.balance <= 2.2) {
    balIndex = 3;
    balScore = 0.9;
  } else if (metrics.balance <= 2.4) {
    balIndex = 2;
    balScore = 0.6;
  } else {
    balIndex = 1;
    balScore = 0.3;
  }

  // 3. Flow Forward 1-30 (Weight 40%)
  let ffIndex = 1;
  let ffScore = 0.4;
  if (metrics.flowForward <= 6.6) {
    ffIndex = 5;
    ffScore = 2.0;
  } else if (metrics.flowForward <= 7.6) {
    ffIndex = 4;
    ffScore = 1.6;
  } else if (metrics.flowForward <= 8.6) {
    ffIndex = 3;
    ffScore = 1.2;
  } else if (metrics.flowForward <= 9.6) {
    ffIndex = 2;
    ffScore = 0.8;
  } else {
    ffIndex = 1;
    ffScore = 0.4;
  }

  const totalScore = Number((feScore + balScore + ffScore).toFixed(2));
  const predicate = getPredicateFromPoint(totalScore);

  return {
    flowEverScore: feScore,
    flowEverIndex: feIndex,
    balanceScore: balScore,
    balanceIndex: balIndex,
    flowForwardScore: ffScore,
    flowForwardIndex: ffIndex,
    totalScore,
    predicate,
    isEligible: totalScore >= 3.0,
  };
}

export function calculateIncentive(
  collector: CollectorRecord,
  mode: CalculationMode = 'current_date'
): IncentiveCalculationResult {
  const isMR = collector.primaryRole === 'MR';

  // 1. Weekly Penyelesaian
  const weekly = isMR
    ? getMRWeeklyIncentive(collector.weeklyProgress, mode)
    : getFEWeeklyIncentive(collector.weeklyProgress, mode);

  // 2. DKH Adjustment
  const dkh = getDKHAdjustment(collector.dkhPct);
  const penyelesaianAdjusted = Math.round(weekly.total * dkh.multiplier);

  // 3. Tarik Barang
  const motorIncentive = collector.unitTarikan.motor * 200000;
  const mobilIncentive = collector.unitTarikan.mobil * 500000;
  const totalTarikBarang = motorIncentive + mobilIncentive;
  const bastk = getBASTKAdjustment(collector.bastkStatus);
  const tarikBarangAdjusted = Math.round(totalTarikBarang * bastk.multiplier);

  // 4. Penilaian Insentif:
  // - FE: Berdasarkan BTC 1-30 > 30% -> Rp 350.000
  // - MR: Berdasarkan SUCCESS RATE 31-60 > 30% -> Rp 350.000
  //   Success rate dalam MR adalah gabungan Rollback, BTC, dan Pelunasan
  const calculatedMRSuccessRate = collector.successRateMRPct !== undefined
    ? collector.successRateMRPct
    : ((collector.rollbackPct ?? 0) + (collector.btcPct ?? 0) + (collector.pelunasanPct ?? 0));

  const rateToCheck = isMR ? calculatedMRSuccessRate : collector.btcPct;
  const btcQualified = rateToCheck > 30;
  const btcOrSuccessRateIncentive = btcQualified ? 350000 : 0;

  // 5. Rapor Score & Predikat (Ketentuan Resmi WOM 2026)
  const raporResult = isMR
    ? calculateMRRaporScore(collector.raporMR)
    : calculateFERaporScore(collector.raporFE);

  // Syarat Pencairan Insentif: Minimal Rapor ON TARGET (Total Point >= 3.00)
  // Tidak ada penambahan nominal uang tiering dari rapor.
  const isEligiblePayout = raporResult.totalScore >= 3.0;

  // Subtotal Akumulasi Insentif Operasional
  const accruedTotal = penyelesaianAdjusted + tarikBarangAdjusted + btcOrSuccessRateIncentive;

  // Grand Total yang dibayarkan:
  // Jika rapor On Target ke atas (>= 3.00), insentif dibayarkan penuh.
  // Jika di bawah On Target (< 3.00), insentif TIDAK DIBAYARKAN (Rp 0).
  const grandTotal = isEligiblePayout ? accruedTotal : 0;

  return {
    w1Incentive: weekly.w1,
    w2Incentive: weekly.w2,
    w3Incentive: weekly.w3,
    w4Incentive: weekly.w4,
    totalPenyelesaian: weekly.total,

    dkhMultiplier: dkh.multiplier,
    dkhTierText: dkh.tier,
    penyelesaianAdjusted,

    motorIncentive,
    mobilIncentive,
    totalTarikBarang,
    bastkMultiplier: bastk.multiplier,
    bastkTierText: bastk.tier,
    tarikBarangAdjusted,

    btcOrSuccessRateIncentive,
    btcQualified,
    successRateVal: rateToCheck,

    raporTotalScore: raporResult.totalScore,
    raporPredicate: raporResult.predicate,
    isEligiblePayout,
    insentifRapor: 0,

    accruedTotal,
    grandTotal,
  };
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absVal);
  return isNegative ? `(Rp ${formatted})` : `Rp ${formatted}`;
}

// Format angka persis tanpa pembulatan tidak sengaja (misal: 51.25 tetap 51,25 bukan 51,30)
export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  const clean = Number(val);
  const parts = clean.toString().split('.');
  const integerPart = new Intl.NumberFormat('id-ID').format(Number(parts[0]));
  return parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart;
}

// Format persentase persis tanpa pembulatan (misal: 51.25 tetap ditulis 51,25% bukan 51,30%)
export function formatPercent(val: number | undefined): string {
  if (val === undefined || isNaN(val)) return '0%';
  const cleanNum = Number(val);
  // Bersihkan glitch floating-point biner tanpa memotong desimal asli
  const roundedFloat = Math.round(cleanNum * 10000) / 10000;
  return `${roundedFloat.toString().replace('.', ',')}%`;
}
