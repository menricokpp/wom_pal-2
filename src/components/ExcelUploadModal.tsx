import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  FileCheck,
  Download,
  Layers,
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { CollectorRecord } from '../types';
import { 
  parseExcelFile, 
  ExcelParseReport, 
  ParsedRowResult, 
  generateSampleExcelWorkbook 
} from '../utils/excelParser';
import { formatRupiah } from '../utils/calculations';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectors: CollectorRecord[];
  onApplyExcelData: (updatedCollectors: CollectorRecord[], message: string) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  collectors,
  onApplyExcelData,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [cachedBuffer, setCachedBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [parseReport, setParseReport] = useState<ExcelParseReport | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [filterRole, setFilterRole] = useState<'ALL' | 'FE' | 'MR' | 'NOOD'>('ALL');
  const [previewMode, setPreviewMode] = useState<'monitoring' | 'performance'>('monitoring');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMappingDetails, setShowMappingDetails] = useState<boolean>(false);

  const processBuffer = (buffer: ArrayBuffer, sheet?: string) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const report = parseExcelFile(buffer, collectors, sheet);
      setParseReport(report);
      setSelectedSheet(report.sheetName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    setErrorMessage(null);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      setCachedBuffer(buffer);
      processBuffer(buffer);
    } catch (err: any) {
      setErrorMessage('Gagal membaca file dari penyimpanan lokal: ' + (err.message || 'File tidak dapat diakses'));
      setIsProcessing(false);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (!cachedBuffer) return;
    setSelectedSheet(sheetName);
    processBuffer(cachedBuffer, sheetName);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
    // Reset input so same file can be reselected if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Download official reference Excel template
  const handleDownloadSample = () => {
    try {
      const buffer = generateSampleExcelWorkbook();
      const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TEMPLATE_MONITORING_WOM_PALEMBANG2_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate template:', err);
    }
  };

  const handleApply = () => {
    if (!parseReport || !parseReport.success) return;

    const updatedList = [...collectors];

    parseReport.rows.forEach((row: ParsedRowResult) => {
      // Disallow any Cabang, Total, or non-person row
      const upperName = row.name.toUpperCase();
      if (
        upperName.includes('CABANG') ||
        upperName.includes('TOTAL') ||
        upperName.includes('BRANCH') ||
        upperName.includes('PALEMBANG 2') ||
        upperName.includes('REKAP')
      ) {
        return;
      }

      const index = updatedList.findIndex(
        (c) =>
          (row.matchedCollectorId && c.id === row.matchedCollectorId) ||
          (c.nik && row.nik && c.nik.replace(/\D/g, '') === row.nik.replace(/\D/g, '')) ||
          (row.name && c.name && (
            (row.name.toUpperCase().includes('ARJUNA') || row.name.toUpperCase().includes('RIZAL') || (row.name.toUpperCase().includes('AHMAD') && !row.name.toUpperCase().includes('FARHAN'))) && (c.name.toUpperCase().includes('ARJUNA') || c.name.toUpperCase().includes('RIZAL') || c.id === 'col-1') ||
            row.name.toUpperCase().includes('YUDI') && c.name.toUpperCase().includes('APRIYADI') ||
            row.name.toUpperCase().includes('FADLI') && c.name.toUpperCase().includes('FADLI') ||
            (row.name.toUpperCase().includes('TEXAS') || row.name.toUpperCase().includes('TEXSAS')) && (c.name.toUpperCase().includes('TEXAS') || c.name.toUpperCase().includes('TEXSAS')) ||
            row.name.toUpperCase().includes('SYA') && c.name.toUpperCase().includes('SYA') ||
            (row.name.toUpperCase().includes('ZHUIDY') || row.name.toUpperCase().includes('ZUIDY') || row.name.toUpperCase().includes('ZHUDY') || row.name.toUpperCase().includes('MAULANA')) && (c.name.toUpperCase().includes('ZHUIDY') || c.name.toUpperCase().includes('MAULANA') || c.id === 'col-9') ||
            row.name.toUpperCase().includes('TORNANDO') && c.name.toUpperCase().includes('TORNANDO') ||
            row.name.toUpperCase().includes('ANIP') && c.name.toUpperCase().includes('ANIP') ||
            row.name.toUpperCase().includes('OKTAVIANUS') && c.name.toUpperCase().includes('OKTAVIANUS') ||
            row.name.toUpperCase().includes('GILANG') && c.name.toUpperCase().includes('GILANG') ||
            row.name.toUpperCase().includes('EMIR') && c.name.toUpperCase().includes('EMIR') ||
            c.name.toUpperCase() === row.name.toUpperCase()
          ))
      );

      if (index !== -1) {
        // Merge with existing: separate FE and NOOD portfolios strictly!
        const existing = updatedList[index];
        const isMRCollector = existing.primaryRole === 'MR' || row.role === 'MR' || existing.name.toUpperCase().includes('EMIR') || existing.name.toUpperCase().includes('GILANG');
        updatedList[index] = {
          ...existing,
          name: row.name || existing.name,
          nik: row.nik || existing.nik,
          primaryRole: existing.primaryRole || row.role || 'FE',
          // Data Portofolio FRONT END (FE 01-30) / MR
          bahanAwalAct: row.bahanAwalAct,
          bahanAwalAmt: row.bahanAwalAmt,
          aktualSoreAct: row.aktualSoreAct,
          aktualSoreAmt: row.aktualSoreAmt,
          realisasiAmt: row.realisasiAmt,
          kurangClosing: row.kurangClosing,
          targetHarian: row.targetHarian,
          kurangTargetHarian: row.kurangTargetHarian,
          btcPct: row.btcPct,
          stayPct: row.stayPct ?? existing.stayPct,
          ball0130Pct: isMRCollector ? undefined : (row.ball0130Pct ?? existing.ball0130Pct),
          // Data Portofolio NO OVERDUE (NOOD) - terpisah khusus NO OD (CO MR tidak memiliki NO OD)
          ballNoOdPct: isMRCollector ? undefined : (row.ballNoOdPct ?? existing.ballNoOdPct),
          flowNoOdPct: isMRCollector ? undefined : (row.flowNoOdPct ?? existing.flowNoOdPct),
          noodBahanAct: isMRCollector ? undefined : (row.noodBahanAct ?? existing.noodBahanAct),
          noodBahanAmt: isMRCollector ? undefined : (row.noodBahanAmt ?? existing.noodBahanAmt),
          noodAktualSoreAct: isMRCollector ? undefined : (row.noodAktualSoreAct ?? existing.noodAktualSoreAct),
          noodAktualSoreAmt: isMRCollector ? undefined : (row.noodAktualSoreAmt ?? existing.noodAktualSoreAmt),
          noodRealisasiAmt: isMRCollector ? undefined : (row.noodRealisasiAmt ?? existing.noodRealisasiAmt),
          noodKurangClosing: isMRCollector ? undefined : (row.noodKurangClosing ?? existing.noodKurangClosing),
          noodTargetHarian: isMRCollector ? undefined : (row.noodTargetHarian ?? existing.noodTargetHarian),
          noodKurangTargetHarian: isMRCollector ? undefined : (row.noodKurangTargetHarian ?? existing.noodKurangTargetHarian),
          angsuran1_3: isMRCollector ? undefined : (row.angsuran1_3 ?? existing.angsuran1_3),
          angsuran1_6: isMRCollector ? undefined : (row.angsuran1_6 ?? existing.angsuran1_6),
          angsuran1_9: isMRCollector ? undefined : (row.angsuran1_9 ?? existing.angsuran1_9),
          delq30Pct: row.delq30Pct ?? existing.delq30Pct,
          ball3160Pct: row.ball3160Pct ?? existing.ball3160Pct,
          successRateMRPct: row.successRateMRPct ?? existing.successRateMRPct,
          raporFE: isMRCollector ? undefined : {
            flowEver: row.raporFE?.flowEver ?? existing.raporFE?.flowEver ?? 45.0,
            balance: row.raporFE?.balance ?? (row.ball0130Pct !== undefined && row.ball0130Pct <= 20 ? row.ball0130Pct : existing.raporFE?.balance ?? 8.0),
            flowNoOd: row.flowNoOdPct ?? row.raporFE?.flowNoOd ?? existing.flowNoOdPct ?? existing.raporFE?.flowNoOd ?? 2.5,
          },
          raporMR: row.raporMR ?? existing.raporMR,
          weeklyProgress: {
            ...existing.weeklyProgress,
            ...row.weeklyProgress,
          },
          dkhPct: row.dkhPct || existing.dkhPct,
          unitTarikan: row.unitTarikan || existing.unitTarikan,
          bastkStatus: row.bastkStatus || existing.bastkStatus,
          isActive: true,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Create new entry if not matched
        const isNoodNew = row.role === 'NOOD';
        const newCol: CollectorRecord = {
          id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          nik: row.nik,
          name: row.name,
          primaryRole: row.role,
          isActive: true,
          bahanAwalAct: isNoodNew ? (row.noodBahanAct ?? row.bahanAwalAct) : row.bahanAwalAct,
          bahanAwalAmt: isNoodNew ? (row.noodBahanAmt ?? row.bahanAwalAmt) : row.bahanAwalAmt,
          aktualSoreAct: isNoodNew ? (row.noodAktualSoreAct ?? row.aktualSoreAct) : row.aktualSoreAct,
          aktualSoreAmt: isNoodNew ? (row.noodAktualSoreAmt ?? row.aktualSoreAmt) : row.aktualSoreAmt,
          realisasiAmt: isNoodNew ? (row.noodRealisasiAmt ?? row.realisasiAmt) : row.realisasiAmt,
          kurangClosing: isNoodNew ? (row.noodKurangClosing ?? row.kurangClosing) : row.kurangClosing,
          targetHarian: isNoodNew ? (row.noodTargetHarian ?? row.targetHarian) : row.targetHarian,
          kurangTargetHarian: isNoodNew ? (row.noodKurangTargetHarian ?? row.kurangTargetHarian) : row.kurangTargetHarian,
          btcPct: row.btcPct,
          stayPct: row.stayPct,
          ball0130Pct: row.ball0130Pct,
          ballNoOdPct: row.ballNoOdPct,
          flowNoOdPct: row.flowNoOdPct,
          noodBahanAct: row.noodBahanAct,
          noodBahanAmt: row.noodBahanAmt,
          noodAktualSoreAct: row.noodAktualSoreAct,
          noodAktualSoreAmt: row.noodAktualSoreAmt,
          noodRealisasiAmt: row.noodRealisasiAmt,
          noodKurangClosing: row.noodKurangClosing,
          noodTargetHarian: row.noodTargetHarian,
          noodKurangTargetHarian: row.noodKurangTargetHarian,
          angsuran1_3: row.angsuran1_3,
          angsuran1_6: row.angsuran1_6,
          angsuran1_9: row.angsuran1_9,
          delq30Pct: row.delq30Pct,
          ball3160Pct: row.ball3160Pct,
          successRateMRPct: row.successRateMRPct,
          raporFE: row.raporFE,
          raporMR: row.raporMR,
          weeklyProgress: row.weeklyProgress,
          dkhPct: row.dkhPct,
          unitTarikan: row.unitTarikan,
          bastkStatus: row.bastkStatus,
          updatedAt: new Date().toISOString(),
        };
        updatedList.push(newCol);
      }
    });

    onApplyExcelData(
      updatedList,
      `Berhasil memperbarui ${parseReport.matchedCount} kolektor Cabang Palembang 2 dari file "${fileName}" secara real-time!`
    );
    onClose();
  };

  const filteredRows = parseReport?.rows.filter((r) => {
    if (filterRole === 'FE') return r.role === 'FE';
    if (filterRole === 'MR') return r.role === 'MR';
    if (filterRole === 'NOOD') return r.role === 'NOOD' || r.role === 'FE' || r.ballNoOdPct !== undefined || (r.noodBahanAmt !== undefined && r.noodBahanAmt > 0) || r.name.toUpperCase().includes('ARJUNA');
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-blue-950 font-black shadow-md shadow-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  Upload Langsung File Excel Monitoring Harian
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Semua Format Excel (.xlsx, .xls, .csv)
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Cukup upload file Excel asli yang Anda miliki. Sistem otomatis mendeteksi nama, NIK, FE (1-30) &amp; MR (31-60).
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Dropzone Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                : parseReport && parseReport.success
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-blue-400'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.xlsm"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Upload className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {fileName ? `File Terpilih: ${fileName}` : 'Klik atau Tarik File Excel Anda ke Sini'}
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Bisa upload file harian Cabang Palembang 2 langsung tanpa harus ubah template
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {fileSize && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px]">
                    Ukuran: {fileSize}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                  Auto-Detect Smart Parser
                </span>
              </div>
            </div>
          </div>

          {/* Quick Template Download Helper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-100/80 border border-slate-200 gap-2">
            <div className="flex items-center space-x-2 text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[11px]">
                Ingin melihat contoh susunan tabel standar WOM Palembang 2 (9 FE &amp; 2 MR)?
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-900 border border-slate-300 rounded-lg font-bold text-[11px] shadow-2xs cursor-pointer transition-all shrink-0"
              title="Download file contoh .xlsx"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh Contoh Excel (.xlsx)</span>
            </button>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center space-x-2 text-blue-900 font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Memindai seluruh sheet dan mencocokkan kolektor...</span>
            </div>
          )}

          {/* Error Message Notification */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Terjadi Kendala Membaca File</strong>
                <p className="text-[11px] mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Parse Result Summary */}
          {parseReport && (
            <div className="space-y-4">
              {/* Sheet selector if workbook has multiple sheets */}
              {parseReport.allSheetNames.length > 1 && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2 text-indigo-950 font-bold text-xs">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Pilih Sheet Tab Excel ({parseReport.allSheetNames.length} sheet terdeteksi):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parseReport.allSheetNames.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSheetChange(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedSheet === s
                            ? 'bg-indigo-700 text-white shadow-xs font-bold'
                            : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {parseReport.success ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-500 text-white rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          Total Terbaca
                        </span>
                        <span className="text-base font-black text-emerald-900">
                          {parseReport.matchedCount} Kolektor
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center space-x-2.5">
                      <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-700 font-bold block">
                          Front End (01-30)
                        </span>
                        <span className="text-base font-black text-blue-900">
                          {parseReport.feCount} CO FE
                        </span>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center space-x-2.5">
                      <div className="p-2 bg-purple-600 text-white rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-700 font-bold block">
                          Mid Range (31-60)
                        </span>
                        <span className="text-base font-black text-purple-900">
                          {parseReport.mrCount} CO MR
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center space-x-2.5">
                      <div className="p-2 bg-amber-500 text-white rounded-lg">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 font-bold block">
                          Sheet Aktif
                        </span>
                        <span className="text-xs font-bold text-amber-950 truncate max-w-[120px] block" title={parseReport.sheetName}>
                          {parseReport.sheetName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column Mapping Toggle Banner */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[11px] font-bold flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Pendeteksian Kolom Otomatis: Berhasil memetakan metrik ke tabel live
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMappingDetails(!showMappingDetails)}
                        className="text-blue-700 hover:text-blue-900 font-bold text-[10px] underline cursor-pointer"
                      >
                        {showMappingDetails ? 'Sembunyikan Pemetaan' : 'Lihat Posisi Kolom'}
                      </button>
                    </div>

                    {showMappingDetails && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200 text-[10px]">
                        {parseReport.columnMappingSummary.map((m, idx) => (
                          <div key={idx} className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-500 block">{m.label}:</span>
                            <span className="font-bold text-slate-800">{m.colName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setFilterRole('ALL')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          filterRole === 'ALL'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Semua ({parseReport.rows.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterRole('FE')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          filterRole === 'FE'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Front End FE ({parseReport.feCount} CO)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterRole('MR')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          filterRole === 'MR'
                            ? 'bg-purple-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Mid Range MR ({parseReport.mrCount} CO)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterRole('NOOD')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          filterRole === 'NOOD'
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        CO NOOD ({parseReport.rows.filter(r => r.role === 'NOOD' || r.role === 'FE' || r.ballNoOdPct !== undefined).length} CO)
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setPreviewMode('monitoring')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            previewMode === 'monitoring'
                              ? 'bg-white text-blue-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Monitoring &amp; Closing
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode('performance')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            previewMode === 'performance'
                              ? 'bg-white text-blue-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Performance KPI (Beban, Flow, Balance)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        {previewMode === 'monitoring' ? (
                          <>
                            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold sticky top-0 border-b border-slate-200">
                              <tr>
                                <th className="py-2 px-3">Collector &amp; NIK</th>
                                <th className="py-2 px-3">Role</th>
                                <th className="py-2 px-3 text-right">Beban Awal (Amt)</th>
                                <th className="py-2 px-3 text-right">Sisa OS Sore</th>
                                <th className="py-2 px-3 text-center">Sisa Akun</th>
                                <th className="py-2 px-3 text-right bg-emerald-50 text-emerald-950 font-bold">Realisasi Tertagih</th>
                                <th className="py-2 px-3 text-right">Kurang Closing</th>
                                <th className="py-2 px-3 text-center">W1 %</th>
                                <th className="py-2 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                              {filteredRows.map((r, i) => {
                                const isNoodPreview = filterRole === 'NOOD';
                                const displayBahanAmt = (isNoodPreview && r.noodBahanAmt) ? r.noodBahanAmt : r.bahanAwalAmt;
                                const displaySoreAmt = (isNoodPreview && r.noodAktualSoreAmt) ? r.noodAktualSoreAmt : r.aktualSoreAmt;
                                const displaySoreAct = (isNoodPreview && r.noodAktualSoreAct) ? r.noodAktualSoreAct : r.aktualSoreAct;
                                const displayRealAmt = (isNoodPreview && r.noodRealisasiAmt) ? r.noodRealisasiAmt : r.realisasiAmt;
                                const displayKurangClosing = (isNoodPreview && r.noodKurangClosing !== undefined) ? r.noodKurangClosing : r.kurangClosing;

                                return (
                                <tr key={i} className="hover:bg-blue-50/40">
                                  <td className="py-2 px-3">
                                    <div className="font-bold text-slate-800">{r.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{r.nik}</div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                                        r.role === 'FE'
                                          ? 'bg-blue-100 text-blue-800'
                                          : r.role === 'NOOD'
                                          ? 'bg-teal-100 text-teal-800'
                                          : 'bg-purple-100 text-purple-800'
                                      }`}
                                    >
                                      {r.role}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-right font-medium text-slate-700">
                                    {formatRupiah(displayBahanAmt)}
                                  </td>
                                  <td className="py-2 px-3 text-right font-semibold text-slate-800">
                                    {formatRupiah(displaySoreAmt)}
                                  </td>
                                  <td className="py-2 px-3 text-center font-bold text-slate-700">
                                    {displaySoreAct}
                                  </td>
                                  <td className="py-2 px-3 text-right font-bold text-emerald-700 bg-emerald-50/30">
                                    {formatRupiah(displayRealAmt)}
                                  </td>
                                  <td
                                    className={`py-2 px-3 text-right font-semibold ${
                                      displayKurangClosing >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                  >
                                    {displayKurangClosing >= 0 ? '+' : ''}{formatRupiah(displayKurangClosing)}
                                  </td>
                                  <td className="py-2 px-3 text-center font-bold text-blue-900">
                                    {r.weeklyProgress.w1}%
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    {r.changesSummary.length > 0 ? (
                                      <span
                                        className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                                        title={r.changesSummary.join(', ')}
                                      >
                                        Update Sore
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        Sinkron
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                              })}
                            </tbody>
                          </>
                        ) : (
                          <>
                            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold sticky top-0 border-b border-slate-200">
                              <tr>
                                <th className="py-2 px-3">Collector &amp; NIK</th>
                                <th className="py-2 px-3">Role</th>
                                <th className="py-2 px-3 text-right">Beban Awal (Act &amp; Amt)</th>
                                <th className="py-2 px-3 text-center">Flow Ever</th>
                                <th className="py-2 px-3 text-center">Balance / Ball</th>
                                <th className="py-2 px-3 text-center">Flow No OD / Fwd</th>
                                <th className="py-2 px-3 text-center">Parameter NOOD</th>
                                <th className="py-2 px-3 text-center">Angsuran Ke</th>
                                <th className="py-2 px-3 text-center">BTC %</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                              {filteredRows.map((r, i) => {
                                const flowEver = r.role === 'FE' ? (r.raporFE?.flowEver ?? 45) : (r.raporMR?.flowEver ?? 50);
                                const balance = r.role === 'FE' ? (r.ball0130Pct ?? r.raporFE?.balance ?? 8) : (r.ball3160Pct ?? r.raporMR?.balance ?? 1.5);
                                const secondary = r.role === 'FE' ? (r.flowNoOdPct ?? r.raporFE?.flowNoOd ?? 2.5) : (r.raporMR?.flowForward ?? 6.0);
                                const displayPerfBahanAmt = (filterRole === 'NOOD' && r.noodBahanAmt) ? r.noodBahanAmt : r.bahanAwalAmt;
                                const displayPerfBahanAct = (filterRole === 'NOOD' && r.noodBahanAct) ? r.noodBahanAct : r.bahanAwalAct;

                                return (
                                  <tr key={i} className="hover:bg-blue-50/40">
                                    <td className="py-2 px-3">
                                      <div className="font-bold text-slate-800">{r.name}</div>
                                      <div className="text-[10px] text-slate-400 font-mono">{r.nik}</div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span
                                        className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                                          r.role === 'FE'
                                            ? 'bg-blue-100 text-blue-800'
                                            : r.role === 'NOOD'
                                            ? 'bg-teal-100 text-teal-800'
                                            : 'bg-purple-100 text-purple-800'
                                        }`}
                                      >
                                        {r.role}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <div className="font-bold text-blue-950">{formatRupiah(displayPerfBahanAmt)}</div>
                                      <div className="text-[10px] text-blue-700">{displayPerfBahanAct} Kontrak</div>
                                    </td>
                                    <td className="py-2 px-3 text-center font-bold text-slate-800">
                                      {flowEver}%
                                    </td>
                                    <td className="py-2 px-3 text-center font-bold text-slate-800">
                                      {balance}%
                                    </td>
                                    <td className="py-2 px-3 text-center font-bold text-slate-800">
                                      {secondary}%
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      {r.role === 'FE' || r.role === 'NOOD' || r.ballNoOdPct !== undefined ? (
                                        <div>
                                          <span className="font-extrabold text-blue-950">
                                            {r.ballNoOdPct ?? 96}%
                                          </span>
                                          <div className="text-[9px] text-slate-400">
                                            Flow: {r.flowNoOdPct ?? r.raporFE?.flowNoOd ?? 2.5}%
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-slate-400">-</span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      {r.role === 'FE' || r.role === 'NOOD' || (r.angsuran1_3 || r.angsuran1_6 || r.angsuran1_9) ? (
                                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-semibold">
                                          A9: {r.angsuran1_9 || 0} | A6: {r.angsuran1_6 || 0} | A3: {r.angsuran1_3 || 0}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">-</span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-center font-bold text-emerald-700">
                                      {r.btcPct}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </>
                        )}
                      </table>
                    </div>
                  </div>

                  <div className="mt-2 px-1 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <span>💡 Angka <strong>Aktual Sore</strong> dibaca sebagai <strong>Sisa OS &amp; Akun</strong> yang belum terselesaikan (Realisasi = <strong>Beban Awal − Sisa Sore</strong>). Kolom Aktual Sore % pada NOOD dipetakan sebagai <strong>Flow NO OD</strong>.</span>
                    <span className="text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                      ✓ DKH dihitung otomatis di background formula rapot berjalan
                    </span>
                  </div>
                </>
              ) : (
                /* Unmatched State / Help */
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-xs">
                        Tidak Ada Baris Kolektor Yang Terdeteksi pada Sheet &quot;{parseReport.sheetName}&quot;
                      </strong>
                      <p className="text-[11px] mt-1 text-amber-800 leading-relaxed">
                        {parseReport.errorMessage || 'Pastikan file Anda memuat nama kolektor (misal: AHMAD RIZAL, RAKA PRATAMA, YUDI, RAKA GILANG, EMIR AFIKI, dll).'}
                      </p>
                    </div>
                  </div>

                  {parseReport.diagnosticInfo && (
                    <div className="text-[11px] bg-white/80 p-2.5 rounded-lg border border-amber-200/80 text-slate-700">
                      <strong>Tips Penanganan:</strong> {parseReport.diagnosticInfo}
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs inline-flex items-center space-x-1 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh File Contoh Excel WOM (.xlsx)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {parseReport?.success ? (
              <span>
                Data akan langsung memperbarui KPI, tabel segmen, dan kalkulasi estimasi insentif real-time.
              </span>
            ) : (
              <span>Pilih file Excel dari komputer Anda untuk melihat pratinjau data.</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-xs cursor-pointer"
            >
              Tutup
            </button>

            {parseReport && parseReport.success && (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
              >
                <span>Terapkan ke Dashboard Real-Time ({parseReport.matchedCount} CO)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
