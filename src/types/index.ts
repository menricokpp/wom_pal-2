export type CollectorRole = 'FE' | 'MR' | 'NOOD';

export type SegmentType = 'FE' | 'MR' | 'NOOD';

export type RaporPredicateType = 
  | 'Exceptional' 
  | 'Exceed Target' 
  | 'On Target' 
  | 'Need Improvement' 
  | 'Unacceptable'
  | '< On Target';

export type CalculationMode = 'current_date' | 'full_month';

export interface WeeklyProgress {
  w1: number; // percentage (e.g. 42 for 42%)
  w2: number;
  w3: number;
  w4: number;
}

export interface UnitTarikan {
  motor: number; // unit count
  mobil: number; // unit count
}

export type BASTKStatus = 'lengkap' | 'tidak_lengkap';

export interface RaporMetricsFE {
  flowEver: number; // percentage (e.g. 52%)
  balance: number;  // percentage (e.g. 8.8%)
  flowNoOd: number; // percentage (e.g. 2.9%)
}

export interface RaporMetricsMR {
  flowEver: number;    // percentage (e.g. 58%)
  balance: number;     // percentage (e.g. 1.9%)
  flowForward: number; // percentage (e.g. 7.2%)
}

export interface CollectorRecord {
  id: string;
  nik: string;
  name: string;
  primaryRole: CollectorRole;
  isActive: boolean;
  isBranchHead?: boolean; // For Branch Collection Head / Branch Remedial Head
  
  // Bahan Awal
  bahanAwalAct: number;
  bahanAwalAmt: number;

  // Real-time Actuals
  aktualSoreAct: number;
  aktualSoreAmt: number;
  realisasiAmt: number; // typically matches or closes aktual
  
  // Specific Segment Metric
  ballNoOdPct?: number; // for NOOD
  flowNoOdPct?: number; // Flow No OD % (Aktual Sore % pada tabel NOOD)
  noodBahanAct?: number; // Beban Awal Akun Khusus Portofolio NOOD
  noodBahanAmt?: number; // Beban Awal Nominal Khusus Portofolio NOOD
  noodAktualSoreAct?: number; // Sisa OS Akun Sore NOOD
  noodAktualSoreAmt?: number; // Sisa OS Nominal Sore NOOD
  noodRealisasiAmt?: number;  // Realisasi Nominal Khusus NOOD
  noodKurangClosing?: number; // Kurang Closing Portofolio NOOD
  noodTargetHarian?: number; // Target Harian Portofolio NOOD
  noodKurangTargetHarian?: number; // Kurang Target Harian NOOD
  noodRealAmt?: number;  // Alias Realisasi Nominal Khusus NOOD
  noodRealAct?: number;  // Alias Realisasi Akun Khusus NOOD
  btcPct: number; // Back to Current %
  stayPct?: number; // Stay 01-30 %
  ball0130Pct?: number; // Ball 01-30 %
  delq30Pct?: number; // Delinquency 30+ % for MR
  ball3160Pct?: number; // Ball 31-60 % for MR
  
  // Targets & Deficit
  kurangClosing: number;
  targetHarian: number;
  kurangTargetHarian: number;

  // Angsuran Ke buckets (for NOOD)
  angsuran1_3?: number;
  angsuran1_6?: number;
  angsuran1_9?: number;

  // Incentive Parameters
  weeklyProgress: WeeklyProgress;
  dkhPct: number; // Daftar Kerja Harian balance worked %
  unitTarikan: UnitTarikan;
  bastkStatus: BASTKStatus;
  
  // MR Success Rate Components: Rollback + BTC + Pelunasan
  rollbackPct?: number; // Rollback % untuk MR
  pelunasanPct?: number; // Pelunasan % untuk MR
  successRateMRPct?: number; // Total Success Rate MR = Rollback + BTC + Pelunasan

  // Rapor Parameters
  raporFE?: RaporMetricsFE;
  raporMR?: RaporMetricsMR;

  // Last update timestamp
  updatedAt?: string;
  notes?: string;
}

export interface IncentiveCalculationResult {
  // Weekly Breakdown
  w1Incentive: number;
  w2Incentive: number;
  w3Incentive: number;
  w4Incentive: number;
  totalPenyelesaian: number;

  // DKH Adjustment
  dkhMultiplier: number; // 1.0, 0.75, 0.0
  dkhTierText: string;
  penyelesaianAdjusted: number;

  // Tarik Barang
  motorIncentive: number;
  mobilIncentive: number;
  totalTarikBarang: number;
  bastkMultiplier: number; // 1.0 or 0.75
  bastkTierText: string;
  tarikBarangAdjusted: number;

  // BTC (FE) / Success Rate (MR)
  btcOrSuccessRateIncentive: number;
  btcQualified: boolean;
  successRateVal?: number; // Nilai actual Success Rate (MR) atau BTC (FE)

  // Rapor Score & Predikat (Ketentuan Resmi: Min On Target untuk Cair)
  raporTotalScore: number; // 1.0 - 5.0
  raporPredicate: RaporPredicateType;
  isEligiblePayout: boolean; // Syarat cair: Minimal On Target (Skor >= 3.00)
  insentifRapor: number; // 0 (sesuai regulasi: tidak ada penambahan tiering uang, rapor adalah syarat pencairan)

  // Akumulasi Insentif Operasional
  accruedTotal: number;

  // Grand Total Incentive yang dibayarkan (Cair jika Rapor >= On Target, jika < On Target maka Rp 0)
  grandTotal: number;
}
