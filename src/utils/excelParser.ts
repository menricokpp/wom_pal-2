import * as XLSX from 'xlsx';
import { 
  CollectorRecord, 
  CollectorRole, 
  WeeklyProgress, 
  UnitTarikan, 
  BASTKStatus,
  RaporMetricsFE,
  RaporMetricsMR
} from '../types';

export interface ParsedRowResult {
  matchedCollectorId: string | null;
  nik: string;
  name: string;
  role: CollectorRole;
  // Beban Awal
  bahanAwalAct: number;
  bahanAwalAmt: number;
  // Realisasi
  aktualSoreAct: number;
  aktualSoreAmt: number;
  realisasiAmt: number;
  kurangClosing: number;
  targetHarian: number;
  kurangTargetHarian: number;
  btcPct: number;
  // KPI Metrics
  stayPct?: number;
  ball0130Pct?: number;
  ballNoOdPct?: number;
  flowNoOdPct?: number;
  noodBahanAct?: number;
  noodBahanAmt?: number;
  noodAktualSoreAct?: number;
  noodAktualSoreAmt?: number;
  noodRealisasiAmt?: number;
  noodKurangClosing?: number;
  noodTargetHarian?: number;
  noodKurangTargetHarian?: number;
  angsuran1_3?: number;
  angsuran1_6?: number;
  angsuran1_9?: number;
  delq30Pct?: number;
  ball3160Pct?: number;
  successRateMRPct?: number;
  weeklyProgress: WeeklyProgress;
  dkhPct: number;
  unitTarikan: UnitTarikan;
  bastkStatus: BASTKStatus;
  // Performance Rapor
  raporFE?: RaporMetricsFE;
  raporMR?: RaporMetricsMR;
  changesSummary: string[];
}

export interface ExcelParseReport {
  success: boolean;
  sheetName: string;
  allSheetNames: string[];
  totalRows: number;
  matchedCount: number;
  newCount: number;
  feCount: number;
  mrCount: number;
  noodCount: number;
  rows: ParsedRowResult[];
  rawHeaders: string[];
  detectedFormat: 'wom_multi_section' | 'standard_flat' | 'by_collector_matching';
  columnMappingSummary: { label: string; colName: string }[];
  errorMessage?: string;
  diagnosticInfo?: string;
}

// Clean and parse Indonesian number strings or Excel raw values
export function parseExcelNumber(val: any, fallback = 0): number {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') {
    if (isNaN(val)) return fallback;
    return val;
  }
  const str = String(val).trim();
  if (
    str === '-' ||
    str === '#N/A' ||
    str === 'N/A' ||
    str === '#VALUE!' ||
    str === '#REF!' ||
    str === '#DIV/0!' ||
    str === '000' ||
    str === 'Rp -' ||
    str === 'Rp 0'
  ) {
    return fallback;
  }

  // Check for negative in accounting format: (17.555.104) or -17.555.104
  const isAccountingNegative = (str.startsWith('(') && str.endsWith(')')) || str.startsWith('-');
  let clean = str.replace(/[^0-9,.-]/g, '');

  // Handle Indonesian thousand dots (1.000.000) vs comma decimal (12,5)
  if (clean.includes('.') && clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes('.') && !clean.includes(',')) {
    // If multiple dots like 1.041.906.800
    const parts = clean.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      clean = clean.replace(/\./g, '');
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }

  let num = parseFloat(clean);
  if (isNaN(num)) return fallback;
  if (isAccountingNegative && num > 0) num = -num;
  return num;
}

// Parse percentage values persis tanpa pembulatan (misal 51.25 tetap 51.25 bukan 51.3)
export function parseExcelPercent(val: any, fallback = 0): number {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') {
    if (isNaN(val)) return fallback;
    let num = val;
    // Jika format desimal seperti 0.5125, ubah ke 51.25
    if (val > 0 && val <= 1.0) {
      num = val * 100;
    }
    // Bersihkan glitch presisi floating point biner JS tanpa memotong desimal asli
    return Math.round(num * 10000) / 10000;
  }
  const str = String(val).trim();
  if (
    str === '-' ||
    str === '#N/A' ||
    str === 'N/A' ||
    str === '#VALUE!' ||
    str === '#REF!' ||
    str === '#DIV/0!'
  ) {
    return fallback;
  }

  let clean = str.replace('%', '').trim();
  clean = clean.replace(',', '.');
  let num = parseFloat(clean);
  if (isNaN(num)) return fallback;
  if (num > 0 && num <= 1.0 && !str.includes('%')) {
    num = num * 100;
  }
  return Math.round(num * 10000) / 10000;
}

// Normalize name for string comparison
export function normalizeName(name: string): string {
  return String(name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Comprehensive known collector matchers with dynamic and token matching
export function findMatchingCollector(
  rowText: string,
  existingCollectors: CollectorRecord[]
): CollectorRecord | undefined {
  const norm = normalizeName(rowText);

  // Pure summary / title row check (only if there are no collectors or NIKs in it)
  const isPureSummary = (
    norm === 'CABANG' ||
    norm === 'TOTAL' ||
    norm === 'SUBTOTAL' ||
    norm === 'REKAP' ||
    norm === 'SUMMARY' ||
    norm === 'BRANCH' ||
    norm === 'COLLECTION CABANG PALEMBANG 2' ||
    norm === 'RAISING NEW HORIZON' ||
    norm === 'ACTUAL FLOW DAN REALISASI' ||
    (norm.startsWith('TOTAL ') && !norm.includes('ARJUNA') && !norm.includes('ZHUIDY') && !norm.includes('YUDI')) ||
    (norm.startsWith('CABANG ') && !norm.includes('ARJUNA') && !norm.includes('ZHUIDY') && !norm.includes('YUDI'))
  );
  if (isPureSummary) {
    return undefined;
  }

  // 1. Direct match by NIK
  for (const c of existingCollectors) {
    if (c.nik && c.nik.length >= 6) {
      const cleanNik = c.nik.replace(/\D/g, '');
      const trimmedNik = cleanNik.replace(/^0+/, '');
      if (cleanNik && (norm.includes(cleanNik) || (trimmedNik.length >= 6 && norm.includes(trimmedNik)))) {
        return c;
      }
    }
  }

  // 2. Exact match of normalized name
  for (const c of existingCollectors) {
    const colNorm = normalizeName(c.name);
    if (colNorm && (norm === colNorm || norm.includes(colNorm) || colNorm.includes(norm))) {
      return c;
    }
  }

  // 3. Specific matching by prominent tokens (handles abbreviations and variations)
  if (
    norm.includes('ARJUNA') ||
    norm.includes('ARJUN') ||
    norm.includes('RIZAL') ||
    (norm.includes('AHMAD') && !norm.includes('FARHAN') && !norm.includes('ANIP'))
  ) {
    return existingCollectors.find(c => c.name.includes('ARJUNA') || c.name.includes('RIZAL') || (c.name.includes('AHMAD') && !c.name.includes('FARHAN')));
  }
  if (norm.includes('GILANG')) {
    return existingCollectors.find(c => c.name.includes('GILANG'));
  }
  if (norm.includes('OKTAVIANUS') || (norm.includes('RAKA') && (norm.includes('PRATAMA') || norm.includes('OKTA')))) {
    return existingCollectors.find(c => c.name.includes('OKTAVIANUS') || c.name.includes('PRATAMA'));
  }
  if (norm.includes('APRIYADI') || norm.includes('YUDI')) {
    return existingCollectors.find(c => c.name.includes('APRIYADI') || c.name.includes('YUDI'));
  }
  if (norm.includes('ANIP') || norm.includes('FARHAN')) {
    return existingCollectors.find(c => c.name.includes('ANIP') || c.name.includes('FARHAN'));
  }
  if (norm.includes('TEXSAS') || norm.includes('TEXAS') || norm.includes('ABDUL')) {
    return existingCollectors.find(c => c.name.includes('TEXSAS') || c.name.includes('TEXAS') || c.name.includes('ABDUL'));
  }
  if (norm.includes('FADLI')) {
    return existingCollectors.find(c => c.name.includes('FADLI'));
  }
  if (norm.includes('SYABAN') || norm.includes('SYA BAN') || (norm.includes('RAHMAT') && !norm.includes('GILANG'))) {
    return existingCollectors.find(c => c.name.includes('SYA') || c.name.includes('RAHMAT'));
  }
  if (
    norm.includes('ZHUIDY') ||
    norm.includes('ZUIDY') ||
    norm.includes('ZHUDY') ||
    norm.includes('ZHUIDI') ||
    norm.includes('ZUIDI') ||
    norm.includes('JUIDY') ||
    norm.includes('MAULANA') ||
    norm.includes('SYAHRIZA')
  ) {
    return existingCollectors.find(c => c.name.includes('ZHUIDY') || c.name.includes('MAULANA') || c.name.includes('SYAHRIZA'));
  }
  if (norm.includes('EMIR') || norm.includes('AFIKI')) {
    return existingCollectors.find(c => c.name.includes('EMIR') || c.name.includes('AFIKI'));
  }
  if (norm.includes('TORNANDO') || norm.includes('RIKO')) {
    return existingCollectors.find(c => c.name.includes('TORNANDO') || c.name.includes('RIKO'));
  }

  // 4. Fallback multi-word token overlap
  const rowWords = norm.split(' ').filter(w => w.length >= 3);
  for (const c of existingCollectors) {
    const colNorm = normalizeName(c.name);
    const colWords = colNorm.split(' ').filter(w => w.length >= 3);
    let matchedWords = 0;
    for (const w of colWords) {
      if (rowWords.includes(w) || norm.includes(w)) matchedWords++;
    }
    if (matchedWords >= 2 || (colWords.length === 1 && matchedWords === 1)) {
      return c;
    }
  }

  return undefined;
}

export function getWorkbookSheetNames(fileBuffer: ArrayBuffer): string[] {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    return workbook.SheetNames || [];
  } catch {
    return [];
  }
}

interface ColumnMap {
  colName: number;
  colNik: number;
  colRole: number;
  // Beban Awal (Bahan Awal)
  colBahanAct: number;
  colBahanAmt: number;
  // Realisasi
  colBtc: number;
  colPagiAct: number;
  colPagiAmt: number;
  colPagiPct: number;
  colSoreAct: number;
  colSoreAmt: number;
  colSorePct: number;
  colRealAmt: number;
  colRealPct: number;
  colKurangClosing: number;
  colTargetHarian: number;
  colKurangTargetHarian: number;
  // KPI Parameters
  colDkh: number;
  colFlowEver: number;
  colBalance: number;
  colFlowNoOd: number;
  colFlowForward: number;
  colBallNoOd: number;
  colAngsuran13: number;
  colAngsuran16: number;
  colAngsuran19: number;
  colStay: number;
  colDelq: number;
  colSuccessRate: number;
  colExtra1: number;
  colExtra2: number;
  colExtra3: number;
}

// Convert 0-indexed column number to Excel column letters (A, B, C, ... Z, AA, etc.)
function colLetter(index: number): string {
  if (index < 0) return '-';
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

// Build composite headers by looking across multiple header rows
function buildCompositeHeaders(data: any[][], maxHeaderRow: number): { composite: string[]; headerRowIdx: number } {
  let headerRowIdx = -1;
  for (let r = 0; r < Math.min(maxHeaderRow, data.length); r++) {
    const row = data[r];
    if (!row) continue;
    const rowStr = row.map(c => String(c).toUpperCase()).join(' ');
    if (
      rowStr.includes('NAMA') ||
      rowStr.includes('COLLECTOR') ||
      rowStr.includes('PETUGAS') ||
      rowStr.includes('KOLEKTOR') ||
      rowStr.includes('BAHAN AWAL') ||
      rowStr.includes('BEBAN AWAL')
    ) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) headerRowIdx = 0;

  // Find max columns
  let maxCols = 0;
  for (let r = 0; r < Math.min(headerRowIdx + 4, data.length); r++) {
    if (data[r] && data[r].length > maxCols) maxCols = data[r].length;
  }

  // Pre-process rows to forward-fill merged parent headers (e.g. AKTUAL SORE spanning across ACT, AMT, %)
  const filledHeaderMatrix: string[][] = [];
  for (let r = Math.max(0, headerRowIdx - 1); r <= Math.min(headerRowIdx + 2, data.length - 1); r++) {
    const row = data[r] || [];
    const filledRow: string[] = [];
    let currentSpanHeader = '';
    for (let c = 0; c < maxCols; c++) {
      let val = row[c] !== undefined && row[c] !== null ? String(row[c]).trim() : '';
      const upper = val.toUpperCase();
      if (
        upper.includes('AKTUAL SORE') ||
        upper.includes('ACTUAL PAGI') ||
        upper.includes('BAHAN AWAL') ||
        upper.includes('BEBAN AWAL') ||
        upper.includes('REALISASI') ||
        upper.includes('ANGSURAN') ||
        upper.includes('BALL NO') ||
        upper.includes('BALL No_OD')
      ) {
        currentSpanHeader = val;
      } else if (val) {
        currentSpanHeader = '';
      } else if (!val && currentSpanHeader) {
        val = currentSpanHeader;
      }
      filledRow.push(val);
    }
    filledHeaderMatrix.push(filledRow);
  }

  const composite: string[] = [];
  for (let c = 0; c < maxCols; c++) {
    const parts: string[] = [];
    for (let r = 0; r < filledHeaderMatrix.length; r++) {
      const val = filledHeaderMatrix[r][c];
      if (val && !parts.includes(val)) parts.push(val);
    }
    composite.push(parts.join(' ').toUpperCase());
  }

  return { composite, headerRowIdx };
}

// Build composite headers for a specific slice of rows (for multi-section tables)
function buildSectionCompositeHeaders(
  data: any[][],
  startRow: number,
  endRow: number,
  existingCollectors?: CollectorRecord[]
): { composite: string[]; headerRowIdx: number; firstDataRow: number } {
  let headerRowIdx = -1;
  const searchLimit = Math.min(startRow + 6, endRow, data.length);
  for (let r = startRow; r < searchLimit; r++) {
    const row = data[r];
    if (!row) continue;
    const rowStr = row.map(c => String(c).toUpperCase()).join(' ');
    if (
      rowStr.includes('NAMA') ||
      rowStr.includes('COLLECTOR') ||
      rowStr.includes('BAHAN AWAL') ||
      rowStr.includes('BEBAN AWAL') ||
      rowStr.includes('BALL')
    ) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) headerRowIdx = startRow;

  let maxCols = 0;
  for (let r = headerRowIdx; r < Math.min(headerRowIdx + 4, endRow, data.length); r++) {
    if (data[r] && data[r].length > maxCols) maxCols = data[r].length;
  }

  // Pre-process rows to forward-fill merged parent headers (e.g. AKTUAL SORE spanning across ACT, AMT, %)
  const filledHeaderMatrix: string[][] = [];
  for (let r = headerRowIdx; r <= Math.min(headerRowIdx + 2, endRow - 1, data.length - 1); r++) {
    const row = data[r] || [];

    // Stop adding headers if this row is already an actual collector data row
    if (r > headerRowIdx) {
      const rowText = row.map(c => String(c)).join(' ').toUpperCase();
      const col0Val = typeof row[0] === 'number' ? row[0] : parseInt(String(row[0] || '').trim(), 10);
      const isCol0Rank = !isNaN(col0Val) && col0Val >= 1 && col0Val <= 100;

      const col1Str = String(row[1] || '').trim().toUpperCase();
      const isHeaderWord = !col1Str ||
        col1Str === 'NAMA' ||
        col1Str === 'COLLECTOR' ||
        col1Str === 'ACT' ||
        col1Str === 'AMT' ||
        col1Str === '%' ||
        col1Str.includes('FRONT END') ||
        col1Str.includes('NO OVERDUE') ||
        col1Str.includes('MID RANGE');

      const isKnownCollector = existingCollectors ? !!findMatchingCollector(rowText, existingCollectors) : false;

      const hasNumericMetrics = row.some((cell, cIdx) => {
        if (cIdx >= 2) {
          const num = typeof cell === 'number' ? cell : parseExcelNumber(cell, -1);
          return num > 0;
        }
        return false;
      });

      const isDataRow = isKnownCollector || (isCol0Rank && !isHeaderWord) || (!isHeaderWord && col1Str.length >= 3 && hasNumericMetrics);
      if (isDataRow) break;
    }

    const filledRow: string[] = [];
    let currentSpanHeader = '';
    for (let c = 0; c < maxCols; c++) {
      let val = row[c] !== undefined && row[c] !== null ? String(row[c]).trim() : '';
      const upper = val.toUpperCase();
      if (
        upper.includes('AKTUAL SORE') ||
        upper.includes('ACTUAL PAGI') ||
        upper.includes('BAHAN AWAL') ||
        upper.includes('BEBAN AWAL') ||
        upper.includes('REALISASI') ||
        upper.includes('ANGSURAN') ||
        upper.includes('BALL NO') ||
        upper.includes('BALL No_OD')
      ) {
        currentSpanHeader = val;
      } else if (val) {
        currentSpanHeader = '';
      } else if (!val && currentSpanHeader) {
        val = currentSpanHeader;
      }
      filledRow.push(val);
    }
    filledHeaderMatrix.push(filledRow);
  }

  const composite: string[] = [];
  for (let c = 0; c < maxCols; c++) {
    const parts: string[] = [];
    for (let r = 0; r < filledHeaderMatrix.length; r++) {
      const val = filledHeaderMatrix[r][c];
      if (val && !parts.includes(val)) parts.push(val);
    }
    composite.push(parts.join(' ').toUpperCase());
  }

  return { composite, headerRowIdx: headerRowIdx - startRow, firstDataRow: headerRowIdx + filledHeaderMatrix.length };
}

// Analyze composite headers to detect column mapping
function mapColumnsFromComposite(headers: string[]): ColumnMap {
  const map: ColumnMap = {
    colName: -1,
    colNik: -1,
    colRole: -1,
    colBahanAct: -1,
    colBahanAmt: -1,
    colBtc: -1,
    colPagiAct: -1,
    colPagiAmt: -1,
    colPagiPct: -1,
    colSoreAct: -1,
    colSoreAmt: -1,
    colSorePct: -1,
    colRealAmt: -1,
    colRealPct: -1,
    colKurangClosing: -1,
    colTargetHarian: -1,
    colKurangTargetHarian: -1,
    colDkh: -1,
    colFlowEver: -1,
    colBalance: -1,
    colFlowNoOd: -1,
    colFlowForward: -1,
    colBallNoOd: -1,
    colAngsuran13: -1,
    colAngsuran16: -1,
    colAngsuran19: -1,
    colStay: -1,
    colDelq: -1,
    colSuccessRate: -1,
    colExtra1: -1,
    colExtra2: -1,
    colExtra3: -1,
  };

  for (let c = 0; c < headers.length; c++) {
    const h = headers[c] || '';

    // NIK
    if (h.includes('NIK') || h.includes('NO KARYAWAN') || h.includes('ID CO') || h.includes('NO PEGAWAI')) {
      if (map.colNik === -1) map.colNik = c;
    }

    // NAMA
    if (
      h.includes('NAMA') ||
      h.includes('COLLECTOR') ||
      h.includes('PETUGAS') ||
      h.includes('KOLEKTOR') ||
      h.includes('OFFICER')
    ) {
      if (map.colName === -1) map.colName = c;
    }

    // ROLE / SEGMEN
    if (h.includes('SEGMEN') || h.includes('SEGMENT') || h.includes('ROLE') || h.includes('BUCKET')) {
      if (map.colRole === -1) map.colRole = c;
    }

    // BEBAN AWAL / BAHAN AWAL
    if (h.includes('BAHAN') || h.includes('BEBAN') || h.includes('PORTOFOLIO') || h.includes('OS AWAL')) {
      if (h.includes('ACT') || h.includes('KONTRAK') || h.includes('AKUN')) {
        map.colBahanAct = c;
      } else if (h.includes('AMT') || h.includes('AMM') || h.includes('NOMINAL') || h.includes('RP') || h.includes('OS')) {
        map.colBahanAmt = c;
      } else if (map.colBahanAct === -1) {
        map.colBahanAct = c;
      } else if (map.colBahanAmt === -1) {
        map.colBahanAmt = c;
      }
    }

    // BTC
    if (h.includes('BTC') || h.includes('BEST TO COLLECT')) {
      map.colBtc = c;
    }

    // ACTUAL PAGI
    if (h.includes('PAGI')) {
      if (h.includes('ACT') || h.includes('KONTRAK')) map.colPagiAct = c;
      else if (h.includes('AMT') || h.includes('AMM') || h.includes('RP')) map.colPagiAmt = c;
      else if (h.includes('%')) map.colPagiPct = c;
    }

    // AKTUAL SORE
    if (h.includes('SORE')) {
      if (h.includes('ACT') || h.includes('KONTRAK')) map.colSoreAct = c;
      else if (h.includes('AMT') || h.includes('AMM') || h.includes('RP') || h.includes('NOMINAL')) map.colSoreAmt = c;
      else if (h.includes('%') || h.includes('PENCAPAIAN')) map.colSorePct = c;
    }

    // REALISASI
    if (h.includes('REALISASI')) {
      if (h.includes('%')) map.colRealPct = c;
      else if (map.colRealAmt === -1) map.colRealAmt = c;
    }

    // KURANG CLOSING
    if (h.includes('KURANG CLOSING') || h.includes('GAP CLOSING') || (h.includes('CLOSING') && !h.includes('TARGET'))) {
      map.colKurangClosing = c;
    }

    // TARGET HARIAN
    if (h.includes('TARGET HARIAN') || (h.includes('TARGET') && !h.includes('KURANG'))) {
      map.colTargetHarian = c;
    }

    // KURANG TARGET HARIAN
    if (h.includes('KURANG TARGET') || h.includes('GAP TARGET')) {
      map.colKurangTargetHarian = c;
    }

    // W1
    if ((h.includes('W1') || h.includes('WEEK 1') || h.includes('W 1')) && map.colSorePct === -1) {
      map.colSorePct = c;
    }

    // DKH
    if (h.includes('DKH')) {
      map.colDkh = c;
    }

    // FLOW EVER / FLOW RATE
    if (h.includes('FLOW EVER') || h.includes('FLOW-EVER') || (h.includes('EVER') && !h.includes('FLOW NO')) || h.includes('FLOW RATE') || h.includes('FLOW IN')) {
      map.colFlowEver = c;
    }

    // FLOW NO OD (Aktual Sore % pada tabel NOOD atau kolom bertuliskan Flow No OD)
    if (
      h.includes('FLOW NO') ||
      h.includes('FLOW NOOD') ||
      h.includes('FLOW NO-OD') ||
      h.includes('FLOW NO_OD') ||
      h.includes('FLOW NOD') ||
      h.includes('FLW NO')
    ) {
      map.colFlowNoOd = c;
    }

    // BALL NO OD (khusus untuk tabel NO OD)
    if (
      h.includes('BALL NO_OD') ||
      h.includes('BALL NO OD') ||
      h.includes('BALL NOOD') ||
      h.includes('BALL NO-OD') ||
      (h.includes('NO_OD') && !h.includes('FLOW') && !h.includes('SORE')) ||
      (h.includes('NO OD') && !h.includes('FLOW') && !h.includes('SORE') && map.colBallNoOd === -1)
    ) {
      map.colBallNoOd = c;
    }

    // ANGSURAN NOOD BUCKETS (handles "ANGSURAN KE- 1 - 3", "1 - 3", "1-3")
    if (
      !h.includes('1-30') &&
      !h.includes('1 - 30') &&
      !h.includes('BALL') &&
      !h.includes('BAL') &&
      (h.includes('1 - 3') || (h.includes('1-3') && !h.includes('1-30')) || h.includes('ANGSURAN 1-3') || h.includes('A 1-3'))
    ) {
      map.colAngsuran13 = c;
    }
    if (h.includes('1 - 6') || h.includes('1-6') || h.includes('ANGSURAN 1-6') || h.includes('A 1-6')) {
      map.colAngsuran16 = c;
    }
    if (h.includes('1 - 9') || h.includes('1-9') || h.includes('ANGSURAN 1-9') || h.includes('A 1-9')) {
      map.colAngsuran19 = c;
    }

    // FLOW FORWARD
    if (h.includes('FLOW FORWARD') || h.includes('FORWARD') || h.includes('FWD')) {
      map.colFlowForward = c;
    }

    // STAY (handles "STAY 01-30")
    if (h.includes('STAY')) {
      map.colStay = c;
    }

    // DELQ (handles "Delq (30+)" and "DELQ")
    if (h.includes('DELQ') || (h.includes('30+') && !h.includes('BALL') && !h.includes('STAY'))) {
      map.colDelq = c;
    }

    // BALL 01_30 / BALANCE 1-30 / BALLANCE 1-30 (khusus FE 01-30, BUKAN NO OD ataupun MR 31-60)
    const isNoOdHeader = h.includes('NO_OD') || h.includes('NO OD') || h.includes('NOOD') || h.includes('NO-OD');
    const isMrHeader = h.includes('31-60') || h.includes('31_60') || h.includes('BALL 31') || h.includes('DELQ');
    const isStayHeader = h.includes('STAY');
    const isEverHeader = h.includes('EVER');

    if (!isNoOdHeader && !isMrHeader && !isStayHeader && !isEverHeader) {
      if (
        h.includes('01_30') ||
        h.includes('01-30') ||
        h.includes('1-30') ||
        h.includes('1_30') ||
        h.includes('1 - 30') ||
        h.includes('01 - 30') ||
        h.includes('BALL 01') ||
        h.includes('BALL 1') ||
        h.includes('BALANCE 1') ||
        h.includes('BALLANCE 1') ||
        h.includes('BALANCE 01') ||
        h.includes('BALLANCE 01') ||
        h.includes('BALLANCE') ||
        h.includes('BALANCE') ||
        (h.includes('BALL') && !h.includes('NO'))
      ) {
        map.colBalance = c;
      }
    } else if (isMrHeader && (h.includes('31-60') || h.includes('31_60') || h.includes('BALL 31'))) {
      map.colExtra2 = c; // MR Ball 31-60
    }

    // SUCCESS RATE
    if (h.includes('SUCCESS RATE') || h.includes('SR MR') || (h.includes('SR') && !h.includes('SORE'))) {
      map.colSuccessRate = c;
    }

    // Extra fallback headers (EVER 1-30, Estimasi Raport)
    if (h.includes('EVER')) {
      map.colFlowEver = c;
    }
    if (h.includes('RAPORT') || h.includes('RAPOR')) {
      map.colExtra3 = c;
    }
  }

  // Fallbacks
  if (map.colName === -1) map.colName = 1; // Col B
  if (map.colBahanAct === -1) map.colBahanAct = 2; // Col C
  if (map.colBahanAmt === -1) map.colBahanAmt = 3; // Col D
  if (map.colBtc === -1) map.colBtc = 4; // Col E
  if (map.colPagiAct === -1) map.colPagiAct = 5; // Col F
  if (map.colPagiAmt === -1) map.colPagiAmt = 6; // Col G
  if (map.colPagiPct === -1) map.colPagiPct = 7; // Col H
  if (map.colSoreAct === -1) map.colSoreAct = 8; // Col I
  if (map.colSoreAmt === -1) map.colSoreAmt = 9; // Col J
  if (map.colSorePct === -1) map.colSorePct = 10; // Col K
  if (map.colRealAmt === -1) map.colRealAmt = 11; // Col L
  if (map.colRealPct === -1) map.colRealPct = 12; // Col M
  if (map.colKurangClosing === -1) map.colKurangClosing = 13; // Col N
  if (map.colTargetHarian === -1) map.colTargetHarian = 14; // Col O
  if (map.colKurangTargetHarian === -1) map.colKurangTargetHarian = 15; // Col P

  return map;
}

export interface NoodExtractedMetrics {
  noodBahanAct: number;
  noodBahanAmt: number;
  noodAktualSoreAct: number;
  noodAktualSoreAmt: number;
  noodRealisasiAmt: number;
  noodKurangClosing: number;
  noodTargetHarian: number;
  noodKurangTargetHarian: number;
  ballNoOdPct: number;
  flowNoOdPct: number;
  angsuran1_3: number;
  angsuran1_6: number;
  angsuran1_9: number;
}

// Helper to extract a single collector's row data using a section-specific column map
function extractCollectorRowData(
  row: any[],
  matched: CollectorRecord,
  role: CollectorRole,
  colMap: ColumnMap,
  noodOverride?: NoodExtractedMetrics
): ParsedRowResult {
  // Extract Beban Awal
  const rawBahanAct = parseExcelNumber(row[colMap.colBahanAct], matched.bahanAwalAct);
  const rawBahanAmt = parseExcelNumber(row[colMap.colBahanAmt], matched.bahanAwalAmt);
  const bahanAwalAct = (role === 'NOOD' && noodOverride) ? noodOverride.noodBahanAct : rawBahanAct;
  const bahanAwalAmt = (role === 'NOOD' && noodOverride) ? noodOverride.noodBahanAmt : rawBahanAmt;
  const btcPct = parseExcelPercent(row[colMap.colBtc], matched.btcPct);

  const rawSoreAct = row[colMap.colSoreAct];
  const rawSoreAmt = row[colMap.colSoreAmt];

  const soreActIsNA = String(rawSoreAct).toUpperCase().includes('#N/A');
  const soreAmtIsNA = String(rawSoreAmt).toUpperCase().includes('#N/A');

  // Angka di Aktual Sore adalah SISA ammount ataupun account yang belum terselesaikan
  const parsedSoreAct = soreActIsNA
    ? (colMap.colPagiAct !== -1 ? parseExcelNumber(row[colMap.colPagiAct], matched.aktualSoreAct) : matched.aktualSoreAct)
    : parseExcelNumber(rawSoreAct, matched.aktualSoreAct);

  const parsedSoreAmt = soreAmtIsNA
    ? (colMap.colPagiAmt !== -1 ? parseExcelNumber(row[colMap.colPagiAmt], matched.aktualSoreAmt) : matched.aktualSoreAmt)
    : parseExcelNumber(rawSoreAmt, matched.aktualSoreAmt);

  const aktualSoreAct = (role === 'NOOD' && noodOverride) ? noodOverride.noodAktualSoreAct : parsedSoreAct;
  const aktualSoreAmt = (role === 'NOOD' && noodOverride) ? noodOverride.noodAktualSoreAmt : parsedSoreAmt;

  // Realisasi / Penyelesaian:
  // Bahan Awal dikurangi Sisa OS Aktual Sore menghasilkan nominal penyelesaian di hari itu
  const rawRealAmt = colMap.colRealAmt !== -1 ? parseExcelNumber(row[colMap.colRealAmt], 0) : 0;
  const calculatedRealAmt = Math.max(0, bahanAwalAmt - aktualSoreAmt);
  const realisasiAmt = (role === 'NOOD' && noodOverride)
    ? noodOverride.noodRealisasiAmt
    : (rawRealAmt > 0 ? rawRealAmt : (calculatedRealAmt > 0 ? calculatedRealAmt : matched.realisasiAmt));

  const kurangClosing = (role === 'NOOD' && noodOverride)
    ? noodOverride.noodKurangClosing
    : parseExcelNumber(row[colMap.colKurangClosing], matched.kurangClosing);
  const targetHarian = (role === 'NOOD' && noodOverride)
    ? noodOverride.noodTargetHarian
    : parseExcelNumber(row[colMap.colTargetHarian], matched.targetHarian);
  const kurangTargetHarian = (role === 'NOOD' && noodOverride)
    ? noodOverride.noodKurangTargetHarian
    : parseExcelNumber(row[colMap.colKurangTargetHarian], matched.kurangTargetHarian);

  // W1 progress (% Penyelesaian):
  // Dihitung dari rasio penyelesaian terhadap Bahan Awal, atau dari STAY/Realisasi % jika tercantum
  let w1 = bahanAwalAmt > 0 ? Math.round(((realisasiAmt / bahanAwalAmt) * 100) * 10000) / 10000 : 0;
  if (w1 === 0 && colMap.colStay !== -1) {
    w1 = parseExcelPercent(row[colMap.colStay], 0);
  }
  if (w1 === 0 && colMap.colRealPct !== -1) {
    w1 = parseExcelPercent(row[colMap.colRealPct], 0);
  }
  if (w1 === 0) {
    w1 = matched.weeklyProgress.w1;
  }

  // DKH %: dipertahankan otomatis di background
  const dkhPct = colMap.colDkh !== -1
    ? parseExcelPercent(row[colMap.colDkh], matched.dkhPct)
    : matched.dkhPct;

  // KPI Metrics
  const isMR = role === 'MR' || matched.primaryRole === 'MR' || matched.name.toUpperCase().includes('EMIR') || matched.name.toUpperCase().includes('GILANG');

  const flowEverVal = colMap.colFlowEver !== -1
    ? parseExcelPercent(row[colMap.colFlowEver], (role === 'FE' ? matched.raporFE?.flowEver : matched.raporMR?.flowEver) ?? 45.0)
    : ((role === 'FE' ? matched.raporFE?.flowEver : matched.raporMR?.flowEver) ?? 45.0);

  // Flow No OD: untuk FE/NOOD, dibaca dari NOOD kolom Aktual Sore % (atau override)
  let flowNoOdVal: number | undefined = undefined;
  if (!isMR) {
    if (noodOverride && noodOverride.flowNoOdPct !== undefined) {
      flowNoOdVal = noodOverride.flowNoOdPct;
    } else if (colMap.colFlowNoOd !== -1) {
      flowNoOdVal = parseExcelPercent(row[colMap.colFlowNoOd], matched.flowNoOdPct ?? matched.raporFE?.flowNoOd ?? 2.5);
    } else {
      flowNoOdVal = matched.flowNoOdPct ?? matched.raporFE?.flowNoOd ?? 2.5;
    }
  }

  const flowForwardVal = colMap.colFlowForward !== -1
    ? parseExcelPercent(row[colMap.colFlowForward], matched.raporMR?.flowForward ?? 6.0)
    : (matched.raporMR?.flowForward ?? 6.0);

  const stayPctVal = colMap.colStay !== -1
    ? parseExcelPercent(row[colMap.colStay], matched.stayPct ?? 18.0)
    : (matched.stayPct ?? 18.0);

  const delq30PctVal = colMap.colDelq !== -1
    ? parseExcelPercent(row[colMap.colDelq], matched.delq30Pct ?? 2.0)
    : (matched.delq30Pct ?? 2.0);

  // Ball 01-30 %: untuk FE (kisaran 40% - 75%)
  let ball0130PctVal: number | undefined = undefined;
  if (!isMR) {
    let parsedBal = colMap.colBalance !== -1 ? parseExcelPercent(row[colMap.colBalance], -1) : -1;
    if (parsedBal < 0) {
      // Scan kolom persentase di range Ball 01-30 (40% - 75%)
      for (let c = 10; c < row.length; c++) {
        const cand = parseExcelPercent(row[c], -1);
        if (cand >= 40 && cand <= 75) {
          parsedBal = cand;
          break;
        }
      }
    }
    ball0130PctVal = parsedBal >= 0 ? parsedBal : (matched.ball0130Pct ?? 50.0);
  }

  // Balance untuk Rapor FE: nilai KPI (7% - 11%)
  let balanceVal = (role === 'FE' ? matched.raporFE?.balance : matched.raporMR?.balance) ?? 8.0;
  if (colMap.colBalance !== -1) {
    const rawVal = parseExcelPercent(row[colMap.colBalance], -1);
    if (rawVal >= 4.0 && rawVal <= 15.0) {
      balanceVal = rawVal;
    }
  }

  const ball3160PctVal = isMR
    ? (colMap.colExtra2 !== -1
        ? parseExcelPercent(row[colMap.colExtra2], matched.ball3160Pct ?? 0.8)
        : (colMap.colBalance !== -1 ? parseExcelPercent(row[colMap.colBalance], matched.ball3160Pct ?? 0.8) : (matched.ball3160Pct ?? 0.8)))
    : undefined;

  const successRateVal = colMap.colSuccessRate !== -1
    ? parseExcelPercent(row[colMap.colSuccessRate], matched.successRateMRPct ?? 35.0)
    : (matched.successRateMRPct ?? 35.0);

  // NOOD metrics: hanya untuk FE / NOOD, BUKAN untuk CO MR
  const ballNoOdVal = isMR
    ? undefined
    : (noodOverride
      ? noodOverride.ballNoOdPct
      : (colMap.colBallNoOd !== -1 ? parseExcelPercent(row[colMap.colBallNoOd], matched.ballNoOdPct ?? 30.0) : (matched.ballNoOdPct ?? 30.0)));

  const angsuran13Val = isMR ? undefined : (noodOverride ? noodOverride.angsuran1_3 : (colMap.colAngsuran13 !== -1 ? parseExcelNumber(row[colMap.colAngsuran13], matched.angsuran1_3 ?? 0) : (matched.angsuran1_3 ?? 0)));
  const angsuran16Val = isMR ? undefined : (noodOverride ? noodOverride.angsuran1_6 : (colMap.colAngsuran16 !== -1 ? parseExcelNumber(row[colMap.colAngsuran16], matched.angsuran1_6 ?? 0) : (matched.angsuran1_6 ?? 0)));
  const angsuran19Val = isMR ? undefined : (noodOverride ? noodOverride.angsuran1_9 : (colMap.colAngsuran19 !== -1 ? parseExcelNumber(row[colMap.colAngsuran19], matched.angsuran1_9 ?? 0) : (matched.angsuran1_9 ?? 0)));

  // Build Rapor objects
  const raporFE: RaporMetricsFE | undefined = role === 'FE'
    ? {
        flowEver: flowEverVal,
        balance: balanceVal,
        flowNoOd: flowNoOdVal ?? 2.5,
      }
    : undefined;

  const raporMR: RaporMetricsMR | undefined = role === 'MR'
    ? {
        flowEver: flowEverVal,
        balance: balanceVal,
        flowForward: flowForwardVal,
      }
    : undefined;

  const changesSummary: string[] = [];
  if (bahanAwalAmt !== matched.bahanAwalAmt) {
    changesSummary.push(`Beban Awal: Rp ${bahanAwalAmt.toLocaleString('id-ID')}`);
  }
  if (bahanAwalAct !== matched.bahanAwalAct) {
    changesSummary.push(`Akun: ${matched.bahanAwalAct} ➔ ${bahanAwalAct}`);
  }
  if (aktualSoreAmt !== matched.aktualSoreAmt) {
    changesSummary.push(`Sore: Rp ${matched.aktualSoreAmt.toLocaleString('id-ID')} ➔ Rp ${aktualSoreAmt.toLocaleString('id-ID')}`);
  }
  if (w1 !== matched.weeklyProgress.w1) {
    changesSummary.push(`W1: ${matched.weeklyProgress.w1}% ➔ ${w1}%`);
  }

  return {
    matchedCollectorId: matched.id,
    nik: matched.nik,
    name: matched.name,
    role,
    bahanAwalAct,
    bahanAwalAmt,
    aktualSoreAct,
    aktualSoreAmt,
    realisasiAmt,
    kurangClosing,
    targetHarian,
    kurangTargetHarian,
    btcPct,
    stayPct: stayPctVal,
    ball0130Pct: ball0130PctVal,
    ballNoOdPct: isMR ? undefined : ballNoOdVal,
    flowNoOdPct: isMR ? undefined : flowNoOdVal,
    noodBahanAct: isMR ? undefined : (noodOverride ? noodOverride.noodBahanAct : (matched.noodBahanAct ?? (role === 'NOOD' ? bahanAwalAct : undefined))),
    noodBahanAmt: isMR ? undefined : (noodOverride ? noodOverride.noodBahanAmt : (matched.noodBahanAmt ?? (role === 'NOOD' ? bahanAwalAmt : undefined))),
    noodAktualSoreAct: isMR ? undefined : (noodOverride ? noodOverride.noodAktualSoreAct : (matched.noodAktualSoreAct ?? (role === 'NOOD' ? aktualSoreAct : undefined))),
    noodAktualSoreAmt: isMR ? undefined : (noodOverride ? noodOverride.noodAktualSoreAmt : (matched.noodAktualSoreAmt ?? (role === 'NOOD' ? aktualSoreAmt : undefined))),
    noodRealisasiAmt: isMR ? undefined : (noodOverride ? noodOverride.noodRealisasiAmt : (matched.noodRealisasiAmt ?? (role === 'NOOD' ? realisasiAmt : undefined))),
    noodKurangClosing: isMR ? undefined : (noodOverride ? noodOverride.noodKurangClosing : (matched.noodKurangClosing ?? (role === 'NOOD' ? kurangClosing : undefined))),
    noodTargetHarian: isMR ? undefined : (noodOverride ? noodOverride.noodTargetHarian : (matched.noodTargetHarian ?? (role === 'NOOD' ? targetHarian : undefined))),
    noodKurangTargetHarian: isMR ? undefined : (noodOverride ? noodOverride.noodKurangTargetHarian : (matched.noodKurangTargetHarian ?? (role === 'NOOD' ? kurangTargetHarian : undefined))),
    angsuran1_3: isMR ? undefined : angsuran13Val,
    angsuran1_6: isMR ? undefined : angsuran16Val,
    angsuran1_9: isMR ? undefined : angsuran19Val,
    delq30Pct: delq30PctVal,
    ball3160Pct: ball3160PctVal,
    successRateMRPct: successRateVal,
    weeklyProgress: {
      w1,
      w2: matched.weeklyProgress.w2,
      w3: matched.weeklyProgress.w3,
      w4: matched.weeklyProgress.w4,
    },
    dkhPct,
    unitTarikan: matched.unitTarikan,
    bastkStatus: matched.bastkStatus,
    raporFE,
    raporMR,
    changesSummary,
  };
}

// Parse a single sheet data matrix
function parseSheetMatrix(
  data: any[][],
  existingCollectors: CollectorRecord[],
  sheetName: string
): { rows: ParsedRowResult[]; colMap: ColumnMap; detectedFormat: 'wom_multi_section' | 'standard_flat' | 'by_collector_matching' } {
  if (!data || data.length === 0) {
    return { rows: [], colMap: mapColumnsFromComposite([]), detectedFormat: 'standard_flat' };
  }

  // 1. Detect section banners (WOM Multi-Section layout: NOOD, FE, MR)
  let noodBannerIdx = -1;
  let feBannerIdx = -1;
  let mrBannerIdx = -1;

  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;
    const rowText = row.map(cell => String(cell).toUpperCase()).join(' ');

    // NO OVERDUE banner (NOOD table)
    if (
      (rowText.includes('NO OVERDUE') || (rowText.includes('NOOD') && !rowText.includes('BALL') && !rowText.includes('FLOW'))) &&
      !rowText.includes('TOTAL') && !rowText.includes('CABANG')
    ) {
      if (noodBannerIdx === -1) noodBannerIdx = r;
    }

    // FRONT END banner
    if (
      (rowText.includes('FRONT END') || rowText.includes('FRONT-END') || rowText.includes('FE (01') || rowText.includes('FE (1') || (rowText.includes('FE') && (rowText.includes('01-30') || rowText.includes('1-30')))) &&
      !rowText.includes('TOTAL') && !rowText.includes('CABANG')
    ) {
      if (feBannerIdx === -1) feBannerIdx = r;
    }

    // MID RANGE banner
    if (
      (rowText.includes('MID RANGE') || rowText.includes('MID-RANGE') || rowText.includes('MR (31') || (rowText.includes('MR') && (rowText.includes('31-60') || rowText.includes('31')))) &&
      !rowText.includes('TOTAL') && !rowText.includes('CABANG')
    ) {
      if (mrBannerIdx === -1) mrBannerIdx = r;
    }
  }

  const { composite: globalComposite, headerRowIdx } = buildCompositeHeaders(data, 15);
  const globalColMap = mapColumnsFromComposite(globalComposite);

  const parsedRows: ParsedRowResult[] = [];
  const processedCollectorIds = new Set<string>();

  // MULTI-SECTION STRATEGY: Process 3 sections (NOOD, FE, MR)
  if (feBannerIdx !== -1 || mrBannerIdx !== -1 || noodBannerIdx !== -1) {
    // 1A. Step 1: Pre-extract complete NOOD metrics from NO OVERDUE (NOOD) table
    // (Beban Awal, BALL No_OD %, Aktual Sore Sisa OS, Flow No OD %, Realisasi, Kurang Closing, Angsuran 1-3/1-6/1-9)
    const noodDataMap = new Map<string, NoodExtractedMetrics>();

    if (noodBannerIdx !== -1) {
      const noodEnd = feBannerIdx !== -1 ? feBannerIdx : (mrBannerIdx !== -1 ? mrBannerIdx : data.length);
      const { composite: noodComposite, firstDataRow: noodFirstDataRow } = buildSectionCompositeHeaders(data, noodBannerIdx, noodEnd, existingCollectors);
      const noodColMap = mapColumnsFromComposite(noodComposite);

      // Detect Flow No OD column in NOOD table (kolom Aktual Sore %):
      let noodFlowCol = noodColMap.colFlowNoOd;
      if (noodFlowCol === -1) {
        noodFlowCol = noodColMap.colSorePct;
      }
      if (noodFlowCol === -1) {
        const sorePctIdx = noodComposite.findIndex(h => h.includes('SORE') && h.includes('%'));
        noodFlowCol = sorePctIdx !== -1 ? sorePctIdx : 10;
      }

      for (let r = noodFirstDataRow; r < noodEnd; r++) {
        const row = data[r];
        if (!row || row.length === 0) continue;
        const rowText = row.map(c => String(c)).join(' ');
        const upperRow = rowText.toUpperCase();
        if (upperRow.includes('CABANG') || upperRow.includes('TOTAL') || upperRow.includes('NO OVERDUE')) continue;

        const nameInCol1 = String(row[noodColMap.colName !== -1 ? noodColMap.colName : 1] || '').trim();
        let matched = findMatchingCollector(rowText, existingCollectors);
        if (!matched && nameInCol1) {
          matched = findMatchingCollector(nameInCol1, existingCollectors);
        }

        // CO MR (Emir Afiki dan Raka Gilang) tidak diikutkan di tabel NO OD
        if (
          (matched && (matched.primaryRole === 'MR' || matched.name.toUpperCase().includes('EMIR') || matched.name.toUpperCase().includes('GILANG'))) ||
          upperRow.includes('EMIR') ||
          upperRow.includes('AFIKI') ||
          upperRow.includes('RAKA GILANG')
        ) {
          continue;
        }

        const colActIdx = noodColMap.colBahanAct !== -1 ? noodColMap.colBahanAct : 2;
        const colAmtIdx = noodColMap.colBahanAmt !== -1 ? noodColMap.colBahanAmt : 3;
        const noodBahanAct = parseExcelNumber(row[colActIdx], matched?.noodBahanAct ?? 0);
        const noodBahanAmt = parseExcelNumber(row[colAmtIdx], matched?.noodBahanAmt ?? 0);

        const colBallIdx = noodColMap.colBallNoOd !== -1 ? noodColMap.colBallNoOd : 4;
        const ballNoOdPct = parseExcelPercent(row[colBallIdx], matched?.ballNoOdPct ?? 30.0);

        const colSoreActIdx = noodColMap.colSoreAct !== -1 ? noodColMap.colSoreAct : 8;
        const colSoreAmtIdx = noodColMap.colSoreAmt !== -1 ? noodColMap.colSoreAmt : 9;
        const noodAktualSoreAct = parseExcelNumber(row[colSoreActIdx], matched?.noodAktualSoreAct ?? 0);
        const noodAktualSoreAmt = parseExcelNumber(row[colSoreAmtIdx], matched?.noodAktualSoreAmt ?? 0);
        
        // Ekstrak Flow No OD persis dari kolom Aktual Sore % di tabel NOOD
        let rawFlowVal = noodFlowCol !== -1 ? parseExcelPercent(row[noodFlowCol], -1) : -1;
        if (rawFlowVal < 0 || rawFlowVal > 25) {
          // Cari kolom persentase kandidat (10, 9, 11, 8, 7, 12)
          for (const candCol of [10, 9, 11, 8, 7, 12]) {
            if (candCol < row.length) {
              const cand = parseExcelPercent(row[candCol], -1);
              if (cand > 0 && cand <= 15) {
                rawFlowVal = cand;
                break;
              }
            }
          }
        }
        // Fallback scan across columns from col 4 to end
        if (rawFlowVal < 0 || rawFlowVal > 25) {
          for (let c = 4; c < row.length; c++) {
            const cand = parseExcelPercent(row[c], -1);
            if (cand >= 0.5 && cand <= 8.0 && Math.abs(cand - ballNoOdPct) > 0.01) {
              rawFlowVal = cand;
              break;
            }
          }
        }
        const flowNoOdPct = rawFlowVal >= 0 ? rawFlowVal : (matched?.flowNoOdPct ?? matched?.raporFE?.flowNoOd ?? 2.5);

        // Realisasi di tabel NOOD
        const colRealIdx = noodColMap.colRealAmt !== -1 ? noodColMap.colRealAmt : 11;
        let noodRealisasiAmt = parseExcelNumber(row[colRealIdx], 0);
        if (noodRealisasiAmt === 0 && noodBahanAmt > 0 && noodAktualSoreAmt > 0) {
          noodRealisasiAmt = Math.max(0, noodBahanAmt - noodAktualSoreAmt);
        }

        const colClosingIdx = noodColMap.colKurangClosing !== -1 ? noodColMap.colKurangClosing : 13;
        const colTargetIdx = noodColMap.colTargetHarian !== -1 ? noodColMap.colTargetHarian : 14;
        const colGapTargetIdx = noodColMap.colKurangTargetHarian !== -1 ? noodColMap.colKurangTargetHarian : 15;
        const noodKurangClosing = parseExcelNumber(row[colClosingIdx], 0);
        const noodTargetHarian = parseExcelNumber(row[colTargetIdx], 0);
        const noodKurangTargetHarian = parseExcelNumber(row[colGapTargetIdx !== -1 ? colGapTargetIdx : 15], 0);

        const colA13 = noodColMap.colAngsuran13 !== -1 ? noodColMap.colAngsuran13 : 16;
        const colA16 = noodColMap.colAngsuran16 !== -1 ? noodColMap.colAngsuran16 : 17;
        const colA19 = noodColMap.colAngsuran19 !== -1 ? noodColMap.colAngsuran19 : 18;
        const angsuran1_3 = parseExcelNumber(row[colA13], matched?.angsuran1_3 ?? 0);
        const angsuran1_6 = parseExcelNumber(row[colA16], matched?.angsuran1_6 ?? 0);
        const angsuran1_9 = parseExcelNumber(row[colA19], matched?.angsuran1_9 ?? 0);

        const metricsObj: NoodExtractedMetrics = {
          noodBahanAct,
          noodBahanAmt,
          noodAktualSoreAct,
          noodAktualSoreAmt,
          noodRealisasiAmt,
          noodKurangClosing,
          noodTargetHarian,
          noodKurangTargetHarian,
          ballNoOdPct,
          flowNoOdPct,
          angsuran1_3,
          angsuran1_6,
          angsuran1_9
        };

        if (matched) {
          noodDataMap.set(matched.id, metricsObj);
          noodDataMap.set(normalizeName(matched.name), metricsObj);
          if (matched.nik) noodDataMap.set(matched.nik.replace(/\D/g, ''), metricsObj);
        }
        if (nameInCol1) {
          const normName = normalizeName(nameInCol1);
          noodDataMap.set(normName, metricsObj);
        }

        // Aliases khusus Ahmad Rizal Arjuna
        const isArjunaRow = (matched && (matched.id === 'col-1' || matched.name.includes('ARJUNA') || matched.name.includes('RIZAL'))) ||
          upperRow.includes('ARJUNA') || upperRow.includes('RIZAL') || (upperRow.includes('AHMAD') && !upperRow.includes('FARHAN') && !upperRow.includes('ANIP'));

        if (isArjunaRow) {
          noodDataMap.set('col-1', metricsObj);
          noodDataMap.set('ARJUNA', metricsObj);
          noodDataMap.set('AHMAD RIZAL', metricsObj);
          noodDataMap.set('AHMAD RIZAL ARJUNA', metricsObj);
          noodDataMap.set('A RIZAL ARJUNA', metricsObj);
          noodDataMap.set('A RIZAL', metricsObj);
          noodDataMap.set('RIZAL ARJUNA', metricsObj);
          noodDataMap.set('076212013', metricsObj);
        }

        // Aliases khusus R. Maulana Zhuidy Syahriza (R. Zhuidy)
        const isZhuidyRow = (matched && (matched.id === 'col-9' || matched.name.includes('ZHUIDY') || matched.name.includes('MAULANA'))) ||
          upperRow.includes('ZHUIDY') || upperRow.includes('ZUIDY') || upperRow.includes('ZHUDY') || upperRow.includes('MAULANA') || upperRow.includes('SYAHRIZA');

        if (isZhuidyRow) {
          noodDataMap.set('col-9', metricsObj);
          noodDataMap.set('ZHUIDY', metricsObj);
          noodDataMap.set('ZUIDY', metricsObj);
          noodDataMap.set('R ZHUIDY', metricsObj);
          noodDataMap.set('R ZUIDY', metricsObj);
          noodDataMap.set('R MAULANA ZHUIDY', metricsObj);
          noodDataMap.set('MAULANA ZHUIDY', metricsObj);
          noodDataMap.set('R MAULANA ZHUIDY SYAHRIZA', metricsObj);
          noodDataMap.set('ZHUIDY SYAHRIZA', metricsObj);
          noodDataMap.set('4402510014', metricsObj);
        }
      }
    }

    // 1B. Step 2: Extract FRONT END (FE) section rows and merge NOOD metrics
    let chosenColMap = globalColMap;
    if (feBannerIdx !== -1) {
      const feEnd = mrBannerIdx !== -1 ? mrBannerIdx : data.length;
      const { composite: feComposite, firstDataRow: feFirstDataRow } = buildSectionCompositeHeaders(data, feBannerIdx, feEnd, existingCollectors);
      const feColMap = mapColumnsFromComposite(feComposite);
      chosenColMap = feColMap;

      for (let r = feFirstDataRow; r < feEnd; r++) {
        const row = data[r];
        if (!row || row.length === 0) continue;
        const rowText = row.map(c => String(c)).join(' ');
        const upperRow = rowText.toUpperCase();
        if (upperRow.includes('CABANG') || upperRow.includes('TOTAL') || upperRow.includes('FRONT END')) continue;

        const nameInFe = String(row[feColMap.colName !== -1 ? feColMap.colName : 1] || '').trim();
        let matched = findMatchingCollector(rowText, existingCollectors);
        if (!matched && nameInFe) {
          matched = findMatchingCollector(nameInFe, existingCollectors);
        }

        if (matched && !processedCollectorIds.has(matched.id)) {
          processedCollectorIds.add(matched.id);

          const isZhuidy = matched.id === 'col-9' || matched.name.includes('ZHUIDY') || matched.name.includes('MAULANA') ||
            (nameInFe && (nameInFe.toUpperCase().includes('ZHUIDY') || nameInFe.toUpperCase().includes('ZUIDY') || nameInFe.toUpperCase().includes('MAULANA')));

          const isArjuna = matched.id === 'col-1' || matched.name.includes('ARJUNA') || matched.name.includes('RIZAL') ||
            (nameInFe && (nameInFe.toUpperCase().includes('ARJUNA') || nameInFe.toUpperCase().includes('RIZAL') || (nameInFe.toUpperCase().includes('AHMAD') && !nameInFe.toUpperCase().includes('FARHAN'))));

          let noodMetrics = noodDataMap.get(matched.id) ||
                              noodDataMap.get(normalizeName(matched.name)) ||
                              (nameInFe ? noodDataMap.get(normalizeName(nameInFe)) : undefined) ||
                              (matched.nik ? noodDataMap.get(matched.nik.replace(/\D/g, '')) : undefined);

          if (!noodMetrics && isZhuidy) {
            noodMetrics = noodDataMap.get('col-9') || noodDataMap.get('ZHUIDY') || noodDataMap.get('ZUIDY') || noodDataMap.get('R ZHUIDY') || noodDataMap.get('R ZUIDY') || noodDataMap.get('MAULANA ZHUIDY') || noodDataMap.get('R MAULANA ZHUIDY SYAHRIZA');
          }
          if (!noodMetrics && isArjuna) {
            noodMetrics = noodDataMap.get('col-1') || noodDataMap.get('ARJUNA') || noodDataMap.get('AHMAD RIZAL') || noodDataMap.get('AHMAD RIZAL ARJUNA') || noodDataMap.get('RIZAL ARJUNA');
          }

          const roleToUse: CollectorRole = matched.primaryRole === 'NOOD' ? 'NOOD' : 'FE';
          const parsed = extractCollectorRowData(row, matched, roleToUse, feColMap, noodMetrics);
          parsedRows.push(parsed);
        }
      }
    } else if (noodBannerIdx !== -1) {
      // Jika file hanya memuat tabel NOOD tanpa tabel FE terpisah, ekstrak langsung dari NOOD
      const noodEnd = mrBannerIdx !== -1 ? mrBannerIdx : data.length;
      const { composite: noodComposite, firstDataRow: noodFirstDataRow } = buildSectionCompositeHeaders(data, noodBannerIdx, noodEnd, existingCollectors);
      const noodColMap = mapColumnsFromComposite(noodComposite);
      chosenColMap = noodColMap;

      for (let r = noodFirstDataRow; r < noodEnd; r++) {
        const row = data[r];
        if (!row || row.length === 0) continue;
        const rowText = row.map(c => String(c)).join(' ');
        const upperRow = rowText.toUpperCase();
        if (upperRow.includes('CABANG') || upperRow.includes('TOTAL') || upperRow.includes('NO OVERDUE')) continue;

        const nameInCol = String(row[noodColMap.colName !== -1 ? noodColMap.colName : 1] || '').trim();
        let matched = findMatchingCollector(rowText, existingCollectors);
        if (!matched && nameInCol) {
          matched = findMatchingCollector(nameInCol, existingCollectors);
        }

        if (matched && !processedCollectorIds.has(matched.id)) {
          processedCollectorIds.add(matched.id);
          const noodMetrics = noodDataMap.get(matched.id) || noodDataMap.get(normalizeName(matched.name));
          const roleToUse: CollectorRole = matched.primaryRole === 'NOOD' ? 'NOOD' : 'FE';
          const parsed = extractCollectorRowData(row, matched, roleToUse, noodColMap, noodMetrics);
          parsedRows.push(parsed);
        }
      }
    }

    // 1C. Step 3: Extract MID RANGE (MR) section rows
    if (mrBannerIdx !== -1) {
      const { composite: mrComposite, firstDataRow: mrFirstDataRow } = buildSectionCompositeHeaders(data, mrBannerIdx, data.length, existingCollectors);
      const mrColMap = mapColumnsFromComposite(mrComposite);
      if (feBannerIdx === -1) chosenColMap = mrColMap;

      for (let r = mrFirstDataRow; r < data.length; r++) {
        const row = data[r];
        if (!row || row.length === 0) continue;
        const rowText = row.map(c => String(c)).join(' ');
        const upperRow = rowText.toUpperCase();
        if (upperRow.includes('CABANG') || upperRow.includes('TOTAL') || upperRow.includes('MID RANGE')) continue;

        const matched = findMatchingCollector(rowText, existingCollectors);
        if (matched && !processedCollectorIds.has(matched.id)) {
          processedCollectorIds.add(matched.id);
          const parsed = extractCollectorRowData(row, matched, 'MR', mrColMap);
          parsedRows.push(parsed);
        }
      }
    }

    // 1D. Step 4: Include any collector from NOOD section not processed in FE/MR (e.g. Arjuna or dedicated NOOD)
    for (const c of existingCollectors) {
      if (c.primaryRole === 'MR' || c.name.toUpperCase().includes('EMIR') || c.name.toUpperCase().includes('GILANG')) {
        continue;
      }

      if (!processedCollectorIds.has(c.id)) {
        const isZhuidy = c.id === 'col-9' || c.name.includes('ZHUIDY') || c.name.includes('MAULANA');
        const isArjuna = c.id === 'col-1' || c.name.includes('ARJUNA') || c.name.includes('RIZAL');

        let noodMetrics = noodDataMap.get(c.id) ||
                            noodDataMap.get(normalizeName(c.name)) ||
                            (c.nik ? noodDataMap.get(c.nik.replace(/\D/g, '')) : undefined);

        if (!noodMetrics && isZhuidy) {
          noodMetrics = noodDataMap.get('col-9') || noodDataMap.get('ZHUIDY') || noodDataMap.get('ZUIDY') || noodDataMap.get('R ZHUIDY') || noodDataMap.get('R ZUIDY') || noodDataMap.get('MAULANA ZHUIDY') || noodDataMap.get('R MAULANA ZHUIDY SYAHRIZA');
        }
        if (!noodMetrics && isArjuna) {
          noodMetrics = noodDataMap.get('col-1') || noodDataMap.get('ARJUNA') || noodDataMap.get('AHMAD RIZAL') || noodDataMap.get('AHMAD RIZAL ARJUNA') || noodDataMap.get('RIZAL ARJUNA');
        }

        if (noodMetrics) {
          processedCollectorIds.add(c.id);
          const roleToUse: CollectorRole = c.primaryRole === 'NOOD' ? 'NOOD' : 'FE';
          parsedRows.push({
            matchedCollectorId: c.id,
            nik: c.nik,
            name: c.name,
            role: roleToUse,
            bahanAwalAct: c.primaryRole === 'NOOD' ? (noodMetrics.noodBahanAct || c.bahanAwalAct) : c.bahanAwalAct,
            bahanAwalAmt: c.primaryRole === 'NOOD' ? (noodMetrics.noodBahanAmt || c.bahanAwalAmt) : c.bahanAwalAmt,
            aktualSoreAct: c.primaryRole === 'NOOD' ? (noodMetrics.noodAktualSoreAct || c.aktualSoreAct) : c.aktualSoreAct,
            aktualSoreAmt: c.primaryRole === 'NOOD' ? (noodMetrics.noodAktualSoreAmt || c.aktualSoreAmt) : c.aktualSoreAmt,
            realisasiAmt: c.primaryRole === 'NOOD' ? (noodMetrics.noodRealisasiAmt || c.realisasiAmt) : c.realisasiAmt,
            kurangClosing: c.primaryRole === 'NOOD' ? (noodMetrics.noodKurangClosing || c.kurangClosing) : c.kurangClosing,
            targetHarian: c.primaryRole === 'NOOD' ? (noodMetrics.noodTargetHarian || c.targetHarian) : c.targetHarian,
            kurangTargetHarian: c.primaryRole === 'NOOD' ? (noodMetrics.noodKurangTargetHarian || c.kurangTargetHarian) : c.kurangTargetHarian,
            btcPct: c.btcPct,
            stayPct: c.stayPct ?? 18.0,
            ball0130Pct: c.ball0130Pct ?? 50.0,
            noodBahanAct: noodMetrics.noodBahanAct,
            noodBahanAmt: noodMetrics.noodBahanAmt,
            noodAktualSoreAct: noodMetrics.noodAktualSoreAct,
            noodAktualSoreAmt: noodMetrics.noodAktualSoreAmt,
            noodRealisasiAmt: noodMetrics.noodRealisasiAmt,
            noodKurangClosing: noodMetrics.noodKurangClosing,
            noodTargetHarian: noodMetrics.noodTargetHarian,
            noodKurangTargetHarian: noodMetrics.noodKurangTargetHarian,
            ballNoOdPct: noodMetrics.ballNoOdPct,
            flowNoOdPct: noodMetrics.flowNoOdPct,
            angsuran1_3: noodMetrics.angsuran1_3,
            angsuran1_6: noodMetrics.angsuran1_6,
            angsuran1_9: noodMetrics.angsuran1_9,
            weeklyProgress: c.weeklyProgress,
            dkhPct: c.dkhPct,
            unitTarikan: c.unitTarikan,
            bastkStatus: c.bastkStatus,
            raporFE: {
              flowEver: c.raporFE?.flowEver ?? 45,
              balance: c.raporFE?.balance ?? 8,
              flowNoOd: noodMetrics.flowNoOdPct,
            },
            changesSummary: [
              `NOOD Beban Awal: Rp ${(noodMetrics.noodBahanAmt || 0).toLocaleString('id-ID')}`,
              `NOOD Sore: Rp ${(noodMetrics.noodAktualSoreAmt || 0).toLocaleString('id-ID')}`,
            ],
          });
        }
      }
    }

    if (parsedRows.length > 0) {
      return { rows: parsedRows, colMap: chosenColMap, detectedFormat: 'wom_multi_section' };
    }
  }

  // STRATEGY A (Flat scan fallback): Process each row by scanning all cells for known collectors
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (!row || row.length === 0) continue;

    const rowFullText = row.map(c => String(c)).join(' ');
    const upperRow = rowFullText.toUpperCase();

    // Skip section banners, overall totals, branch lines, or headers
    if (
      upperRow.includes('CABANG') ||
      upperRow.includes('TOTAL') ||
      upperRow.includes('PALEMBANG 2') ||
      upperRow.includes('PALEMBANG') ||
      upperRow.includes('BRANCH') ||
      upperRow.includes('REKAP') ||
      upperRow.includes('SUBTOTAL') ||
      upperRow.includes('SUMMARY') ||
      upperRow.includes('MONITORING HARIAN')
    ) {
      continue;
    }

    const matched = findMatchingCollector(rowFullText, existingCollectors);
    if (matched) {
      if (processedCollectorIds.has(matched.id)) continue;
      processedCollectorIds.add(matched.id);

      let role: CollectorRole = matched.primaryRole;
      if (mrBannerIdx !== -1 && r > mrBannerIdx) {
        role = 'MR';
      } else if (feBannerIdx !== -1 && r > feBannerIdx && (mrBannerIdx === -1 || r < mrBannerIdx)) {
        role = 'FE';
      }

      const parsed = extractCollectorRowData(row, matched, role, globalColMap);
      parsedRows.push(parsed);
    }
  }

  // STRATEGY B: Fallback for generic rows
  if (parsedRows.length === 0) {
    const startRow = headerRowIdx + 1;
    for (let r = startRow; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;

      const rawName = String(row[globalColMap.colName] || '').trim();
      const upperName = rawName.toUpperCase();

      if (
        !rawName ||
        rawName.length < 3 ||
        upperName.includes('TOTAL') ||
        upperName.includes('CABANG') ||
        upperName.includes('PALEMBANG') ||
        upperName.includes('BRANCH') ||
        upperName.includes('REKAP') ||
        upperName.includes('SUMMARY') ||
        upperName.includes('NAMA') ||
        upperName.includes('KETERANGAN') ||
        upperName.includes('HALAMAN')
      ) {
        continue;
      }

      const matched = existingCollectors.find(c => {
        const n1 = normalizeName(c.name);
        const n2 = normalizeName(rawName);
        return n1.includes(n2) || n2.includes(n1);
      });

      let role: CollectorRole = matched ? matched.primaryRole : 'FE';
      if (upperName.includes('RAKA GILANG') || upperName.includes('EMIR') || (mrBannerIdx !== -1 && r > mrBannerIdx)) {
        role = 'MR';
      }

      const bahanAwalAct = parseExcelNumber(row[globalColMap.colBahanAct], matched?.bahanAwalAct ?? 30);
      const bahanAwalAmt = parseExcelNumber(row[globalColMap.colBahanAmt], matched?.bahanAwalAmt ?? 500000000);
      const btcPct = parseExcelPercent(row[globalColMap.colBtc], matched?.btcPct ?? 75.0);
      const aktualSoreAct = parseExcelNumber(row[globalColMap.colSoreAct], matched?.aktualSoreAct ?? 2);
      const aktualSoreAmt = parseExcelNumber(row[globalColMap.colSoreAmt], matched?.aktualSoreAmt ?? 15000000);
      const realisasiAmt = parseExcelNumber(row[globalColMap.colRealAmt], aktualSoreAmt);
      const kurangClosing = parseExcelNumber(row[globalColMap.colKurangClosing], matched?.kurangClosing ?? 0);
      const targetHarian = parseExcelNumber(row[globalColMap.colTargetHarian], matched?.targetHarian ?? 500000);
      const kurangTargetHarian = parseExcelNumber(row[globalColMap.colKurangTargetHarian], matched?.kurangTargetHarian ?? 0);
      const w1 = parseExcelPercent(row[globalColMap.colSorePct], matched?.weeklyProgress.w1 ?? 40.0);
      const dkhPct = parseExcelPercent(row[globalColMap.colDkh], matched?.dkhPct ?? 96.0);

      const flowEverVal = parseExcelPercent(row[globalColMap.colFlowEver], 44.0);
      const balanceVal = parseExcelPercent(row[globalColMap.colBalance], 8.0);
      const flowNoOdVal = parseExcelPercent(row[globalColMap.colFlowNoOd], 2.5);
      const flowForwardVal = parseExcelPercent(row[globalColMap.colFlowForward], 6.0);

      parsedRows.push({
        matchedCollectorId: matched?.id || null,
        nik: matched?.nik || `NIK-${Date.now().toString().slice(-6)}`,
        name: matched?.name || rawName,
        role,
        bahanAwalAct,
        bahanAwalAmt,
        aktualSoreAct,
        aktualSoreAmt,
        realisasiAmt,
        kurangClosing,
        targetHarian,
        kurangTargetHarian,
        btcPct,
        stayPct: 18.0,
        ball0130Pct: 2.0,
        ballNoOdPct: matched?.ballNoOdPct ?? 96.0,
        angsuran1_3: matched?.angsuran1_3 ?? 0,
        angsuran1_6: matched?.angsuran1_6 ?? 0,
        angsuran1_9: matched?.angsuran1_9 ?? 0,
        delq30Pct: 2.0,
        ball3160Pct: 0.8,
        successRateMRPct: 35.0,
        weeklyProgress: {
          w1,
          w2: matched?.weeklyProgress.w2 ?? 0,
          w3: matched?.weeklyProgress.w3 ?? 0,
          w4: matched?.weeklyProgress.w4 ?? 0,
        },
        dkhPct,
        unitTarikan: matched?.unitTarikan ?? { motor: 1, mobil: 0 },
        bastkStatus: matched?.bastkStatus ?? 'lengkap',
        raporFE: role === 'FE' ? { flowEver: flowEverVal, balance: balanceVal, flowNoOd: flowNoOdVal } : undefined,
        raporMR: role === 'MR' ? { flowEver: flowEverVal, balance: balanceVal, flowForward: flowForwardVal } : undefined,
        changesSummary: [],
      });
    }
  }

  const detectedFormat =
    feBannerIdx !== -1 || mrBannerIdx !== -1
      ? 'wom_multi_section'
      : parsedRows.length > 0
      ? 'by_collector_matching'
      : 'standard_flat';

  return { rows: parsedRows, colMap: globalColMap, detectedFormat };
}

// Main parser function that checks ALL sheets in the workbook
export function parseExcelFile(
  fileBuffer: ArrayBuffer,
  existingCollectors: CollectorRecord[],
  targetSheetName?: string
): ExcelParseReport {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const allSheetNames = workbook.SheetNames || [];

    if (allSheetNames.length === 0) {
      return {
        success: false,
        sheetName: '',
        allSheetNames: [],
        totalRows: 0,
        matchedCount: 0,
        newCount: 0,
        feCount: 0,
        mrCount: 0,
        noodCount: 0,
        rows: [],
        rawHeaders: [],
        detectedFormat: 'standard_flat',
        columnMappingSummary: [],
        errorMessage: 'File Excel tidak memiliki sheet yang dapat dibaca.',
      };
    }

    let selectedSheet = targetSheetName && allSheetNames.includes(targetSheetName)
      ? targetSheetName
      : '';

    let bestReportRows: ParsedRowResult[] = [];
    let bestColMap: ColumnMap = mapColumnsFromComposite([]);
    let bestFormat: 'wom_multi_section' | 'standard_flat' | 'by_collector_matching' = 'standard_flat';
    let chosenSheetName = selectedSheet || allSheetNames[0];

    if (selectedSheet) {
      const sheet = workbook.Sheets[selectedSheet];
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const res = parseSheetMatrix(data, existingCollectors, selectedSheet);
      bestReportRows = res.rows;
      bestColMap = res.colMap;
      bestFormat = res.detectedFormat;
      chosenSheetName = selectedSheet;
    } else {
      const sheetResults: { sheetName: string; rows: ParsedRowResult[]; colMap: ColumnMap; format: any }[] = [];

      for (const name of allSheetNames) {
        const sheet = workbook.Sheets[name];
        if (!sheet) continue;
        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (!data || data.length === 0) continue;

        const res = parseSheetMatrix(data, existingCollectors, name);
        sheetResults.push({
          sheetName: name,
          rows: res.rows,
          colMap: res.colMap,
          format: res.detectedFormat,
        });
      }

      const feSheet = sheetResults.find(s => s.sheetName.toUpperCase().includes('FE') && s.rows.length > 0);
      const mrSheet = sheetResults.find(s => s.sheetName.toUpperCase().includes('MR') && s.rows.length > 0);

      if (feSheet && mrSheet && feSheet.sheetName !== mrSheet.sheetName) {
        bestReportRows = [...feSheet.rows, ...mrSheet.rows];
        bestColMap = feSheet.colMap;
        bestFormat = 'wom_multi_section';
        chosenSheetName = `${feSheet.sheetName} + ${mrSheet.sheetName}`;
      } else {
        sheetResults.sort((a, b) => b.rows.length - a.rows.length);
        if (sheetResults.length > 0 && sheetResults[0].rows.length > 0) {
          bestReportRows = sheetResults[0].rows;
          bestColMap = sheetResults[0].colMap;
          bestFormat = sheetResults[0].format;
          chosenSheetName = sheetResults[0].sheetName;
        } else if (sheetResults.length > 0) {
          chosenSheetName = sheetResults[0].sheetName;
          bestColMap = sheetResults[0].colMap;
        }
      }
    }

    const matchedCount = bestReportRows.filter(r => r.matchedCollectorId !== null).length;
    const newCount = bestReportRows.filter(r => r.matchedCollectorId === null).length;
    const feCount = bestReportRows.filter(r => r.role === 'FE').length;
    const mrCount = bestReportRows.filter(r => r.role === 'MR').length;
    const noodCount = bestReportRows.filter(r => r.role === 'NOOD' || r.noodBahanAmt !== undefined || r.ballNoOdPct !== undefined).length;

    const columnMappingSummary = [
      { label: 'Nama Kolektor', colName: `Kolom ${colLetter(bestColMap.colName)}` },
      { label: 'Beban Awal (Akun)', colName: `Kolom ${colLetter(bestColMap.colBahanAct)}` },
      { label: 'Beban Awal (Rp)', colName: `Kolom ${colLetter(bestColMap.colBahanAmt)}` },
      { label: 'Aktual Sore (Amt)', colName: `Kolom ${colLetter(bestColMap.colSoreAmt)}` },
      { label: 'Capaian W1 (%)', colName: `Kolom ${colLetter(bestColMap.colSorePct)}` },
      { label: 'Flow Ever (%)', colName: bestColMap.colFlowEver !== -1 ? `Kolom ${colLetter(bestColMap.colFlowEver)}` : 'Auto' },
      { label: 'Balance (%)', colName: bestColMap.colBalance !== -1 ? `Kolom ${colLetter(bestColMap.colBalance)}` : 'Auto' },
      { label: 'Perhitungan DKH', colName: 'Dihitung di background (≥95% / Auto)' },
    ];

    const isSuccess = bestReportRows.length > 0;

    let errorMessage: string | undefined = undefined;
    let diagnosticInfo: string | undefined = undefined;

    if (!isSuccess) {
      errorMessage = `Tidak menemukan data kolektor pada sheet "${chosenSheetName}". Pastikan baris data memuat nama kolektor (misal: AHMAD RIZAL, RAKA GILANG, EMIR AFIKI, dll).`;
      diagnosticInfo = `Sheet terdeteksi: [${allSheetNames.join(', ')}]. Jika file Anda memiliki beberapa tab sheet, coba pilih tab yang memuat tabel kolektor.`;
    }

    return {
      success: isSuccess,
      sheetName: chosenSheetName,
      allSheetNames,
      totalRows: bestReportRows.length,
      matchedCount,
      newCount,
      feCount,
      mrCount,
      noodCount,
      rows: bestReportRows,
      rawHeaders: [],
      detectedFormat: bestFormat,
      columnMappingSummary,
      errorMessage,
      diagnosticInfo,
    };
  } catch (err: any) {
    console.error('Error parsing Excel file:', err);
    return {
      success: false,
      sheetName: '',
      allSheetNames: [],
      totalRows: 0,
      matchedCount: 0,
      newCount: 0,
      feCount: 0,
      mrCount: 0,
      noodCount: 0,
      rows: [],
      rawHeaders: [],
      detectedFormat: 'standard_flat',
      columnMappingSummary: [],
      errorMessage: err.message || 'Gagal membaca format file. Harap pastikan file tidak rusak dan berformat .xlsx, .xls, atau .csv.',
      diagnosticInfo: 'File Excel mungkin memiliki password atau format enkripsi biner yang tidak didukung.',
    };
  }
}

// Generate an authentic sample WOM Palembang 2 Excel workbook (.xlsx) matching the official 3-section layout
export function generateSampleExcelWorkbook(): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Create sample data matching the exact 3-section layout (NO OVERDUE, FRONT END, MID RANGE)
  const wsData = [
    ['COLLECTION CABANG PALEMBANG 2'],
    ['RAISING NEW HORIZON'],
    ['ACTUAL FLOW DAN REALISASI'],
    ['Tuesday,October 06,2026'],
    [],
    ['', 'NO OVERDUE (NOOD)'],
    [
      'RANK',
      'NAMA',
      'BAHAN AWAL',
      '',
      'BALL No_OD',
      'ACTUAL PAGI',
      '',
      '',
      'AKTUAL SORE',
      '',
      '',
      'REALISASI',
      '',
      'KURANG CLOSING',
      'TARGET HARIAN',
      'KURANG TARGET HARIAN',
      'ANGSURAN KE-',
      '',
      ''
    ],
    [
      '',
      '',
      'ACT',
      'AMT',
      '%',
      'ACT',
      'AMT',
      '%',
      'ACT',
      'AMT',
      '%',
      'AMT',
      '%',
      '',
      '',
      '',
      '1 - 3',
      '1 - 6',
      '1 - 9'
    ],
    [1, 'AHMAD RIZAL ARJUNA', 223, 5289604645, '33,18%', 124, 3049378999, '57,65%', 124, 3049378999, '2,80%', 0, '0,00%', 2943586906, 117743476, 117743476, 26, 48, 65],
    [2, 'YUDI APRIYADI', 228, 5409623577, '37,79%', 141, 3131852508, '57,89%', 141, 3131852508, '2,60%', 0, '0,00%', 3023660037, 120946401, 120946401, 26, 40, 57],
    [3, 'MGS M FADLI', 240, 5725946837, '36,66%', 141, 3401952767, '59,41%', 141, 3401952767, '2,10%', 0, '0,00%', 3287433830, 131497353, 131497353, 30, 54, 81],
    [4, 'ABDUL TEXAS', 251, 5740171786, '32,58%', 155, 3589232152, '62,53%', 155, 3589232152, '2,30%', 0, '0,00%', 3474428717, 138977149, 138977149, 34, 60, 81],
    [5, "RAHMAT SYA'BAN", 245, 7307311559, '30,63%', 156, 4749861988, '65,00%', 156, 4749861988, '2,80%', 0, '0,00%', 4603715757, 184148630, 184148630, 22, 47, 69],
    [6, 'R. MAULANA ZHUIDY SYAHRIZA', 257, 6692529260, '30,31%', 161, 4413004518, '65,94%', 161, 4413004518, '2,10%', 0, '0,00%', 4279153933, 171166157, 171166157, 44, 76, 102],
    [7, 'RIKO TORNANDO', 226, 6669132576, '25,80%', 138, 4602151314, '69,01%', 138, 4602151314, '2,40%', 0, '0,00%', 4468768662, 178750746, 178750746, 24, 54, 79],
    [8, 'MUHAMMAD ANIP FARHAN', 196, 6431220459, '25,86%', 127, 4508146366, '70,10%', 127, 4508146366, '3,10%', 0, '0,00%', 4379521957, 175180878, 175180878, 21, 38, 59],
    [9, 'RAKA PRATAMA OKTAVIANUS', 319, 9359147026, '24,96%', 198, 6687163169, '71,45%', 198, 6687163169, '2,40%', 0, '0,00%', 6499980229, 259999209, 259999209, 39, 87, 115],
    ['CABANG', '', 2197, 62677753066, '29,90%', 1353, 42185809122, '67,31%', 1353, 42185809122, '2,55%', 0, '0,00%', 40932254061, 1637290162, 1637290162, 266, 504, 708],
    [],
    ['', 'FRONT END (FE)'],
    [
      'RANK',
      'NAMA',
      'BAHAN AWAL',
      '',
      'BTC',
      'ACTUAL PAGI',
      '',
      '',
      'AKTUAL SORE',
      '',
      '',
      'REALISASI',
      '',
      'KURANG CLOSING',
      'TARGET HARIAN',
      'KURANG TARGET HARIAN',
      'BALL 01_30',
      'STAY 01-30',
      'Estimasi Raport',
      'EVER 1-30',
      'ACT'
    ],
    [
      '',
      '',
      'ACT',
      'AMT',
      '%',
      'ACT',
      'AMT',
      '%',
      'ACT',
      'AMT',
      '%',
      'AMT',
      '%',
      '',
      '',
      '',
      '%',
      '%',
      '',
      '%',
      ''
    ],
    [1, 'YUDI APRIYADI', 22, 363358984, '0,00%', 12, 116529993, '32,07%', 12, 116529993, '32,07%', 0, '0,00%', 105629223, 4225169, 4225169, '57,70%', '67,93%', 'UNACCEPTABLE', '48,00%', ''],
    [2, 'ABDUL TEXAS', 24, 410048416, '0,00%', 15, 162564146, '39,65%', 15, 162564146, '39,65%', 0, '0,00%', 150262693, 6010508, 6010508, '62,98%', '59,91%', 'UNACCEPTABLE', '45,00%', ''],
    [3, 'MGS M FADLI', 27, 304997527, '0,00%', 14, 148197103, '48,59%', 14, 148197103, '48,59%', 0, '0,00%', 139047177, 5561887, 5561887, '57,96%', '51,41%', 'UNACCEPTABLE', '42,00%', ''],
    [4, 'R. MAULANA ZHUIDY SYAHRIZA', 31, 541400995, '4,63%', 20, 265584392, '49,06%', 20, 265584392, '49,06%', 0, '0,00%', 249342362, 9973694, 9973694, '62,97%', '46,31%', '#N/A', '42,00%', ''],
    [5, "RAHMAT SYA'BAN", 22, 717412124, '1,19%', 15, 491751251, '68,55%', 15, 491751251, '68,55%', 0, '0,00%', 470228887, 18809155, 18809155, '59,78%', '30,26%', 'UNACCEPTABLE', '46,00%', ''],
    [6, 'AHMAD RIZAL ARJUNA', 28, 1067820665, '0,00%', 18, 785239476, '73,54%', 18, 785239476, '73,54%', 0, '0,00%', 753204856, 30128194, 30128194, '50,51%', '26,46%', 'UNACCEPTABLE', '48,00%', ''],
    [7, 'MUHAMMAD ANIP FARHAN', 24, 576906970, '0,00%', 16, 476459028, '82,59%', 16, 476459028, '82,59%', 0, '0,00%', 459151818, 18366073, 18366073, '63,04%', '17,41%', 'UNACCEPTABLE', '52,00%', ''],
    [8, 'RAKA PRATAMA OKTAVIANUS', 40, 894748242, '1,23%', 29, 786681869, '87,92%', 29, 786681869, '87,92%', 0, '0,00%', 759839422, 30393577, 30393577, '65,41%', '10,85%', 'UNACCEPTABLE', '43,50%', ''],
    [9, 'RIKO TORNANDO', 24, 735054065, '0,00%', 19, 655569005, '89,19%', 19, 655569005, '89,19%', 0, '0,00%', 633517383, 25340695, 25340695, '59,72%', '10,81%', '#N/A', '43,50%', ''],
    ['CABANG', '', 251, 7923476455, '0,56%', 167, 6200304731, '78,25%', 167, 6200304731, '78,25%', 0, '0,00%', 5962600437, 238504017, 238504017, '38,97%', '21,16%', '#N/A'],
    [],
    ['', 'MID RANGE (MR)'],
    [
      'RANK',
      'NAMA',
      'BAHAN AWAL',
      '',
      'BTC',
      'ACTUAL PAGI',
      '',
      '',
      'AKTUAL SORE',
      '',
      '',
      'REALISASI',
      '',
      'KURANG CLOSING',
      'TARGET HARIAN',
      'KURANG TARGET HARIAN',
      'Delq (30+)',
      'Ball 31-60',
      'Estimasi Raport'
    ],
    [
      '',
      '',
      'ACT',
      'AMT',
      '%',
      'ACT',
      'AMT',
      '%',
      'ACT',
      'AMT',
      '%',
      'AMT',
      '%',
      '',
      '',
      '',
      '%',
      '%',
      ''
    ],
    [1, 'RAKA GILANG DWI PUTRA', 23, 354733776, '0,00%', 19, 250891220, '70,73%', 19, 250891220, '70,73%', 0, '0,00%', 197681154, 7907246, 7907246, '#N/A', '7,64%', '#N/A'],
    [2, 'EMIR AFIKI', 29, 526605809, '0,00%', 21, 388732376, '73,82%', 21, 388732376, '73,82%', 0, '0,00%', 309741505, 12389660, 12389660, '7,49%', '5,09%', 'UNACCEPTABLE'],
    ['CABANG', '', 53, 990849381, '0,00%', 41, 749133392, '75,61%', 41, 749133392, '75,61%', 0, '0,00%', 600505985, 24020239, 24020239, '9,38%', '6,44%']
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'ACTUAL FLOW DAN REALISASI');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}
