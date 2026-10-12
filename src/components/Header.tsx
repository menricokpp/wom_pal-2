import React, { useRef } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Download, 
  Upload,
  PlusCircle, 
  Play, 
  Pause, 
  ShieldCheck,
  Calendar,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  Users,
  RefreshCw,
  Radio
} from 'lucide-react';
import { formatIndonesianFullDate, formatIndonesianTime } from '../utils/dateUtils';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenManageCollectors?: () => void;
  onOpenExcelUpload: () => void;
  onResetData: () => void;
  onExportCsv: () => void;
  onOpenUpdateGuide: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  lastUpdated: Date;
  currentDate?: Date;
  isRealtimeConnected?: boolean;
  activeDevicesCount?: number;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenManageCollectors,
  onOpenExcelUpload,
  onResetData,
  onExportCsv,
  onOpenUpdateGuide,
  isSimulating,
  onToggleSimulating,
  lastUpdated,
  currentDate,
  isRealtimeConnected = true,
  activeDevicesCount = 1,
  onManualSync,
}) => {
  const displayDate = currentDate || new Date();

  return (
    <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white shadow-xl border-b border-blue-800/60 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Branch Information */}
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-blue-950 font-black text-2xl shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/40">
              W
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  WOM FINANCE
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-800/80 text-amber-300 border border-blue-600/50">
                  Maybank Group
                </span>
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                  isRealtimeConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isRealtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}></span>
                  <span>
                    {isRealtimeConnected
                      ? `REAL-TIME ALL DEVICES (${activeDevicesCount} ONLINE)`
                      : 'OFFLINE / LOCAL CACHE'}
                  </span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-blue-200/90 mt-0.5 font-medium">
                <span className="flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  CABANG PALEMBANG 2
                </span>
                <span className="text-blue-400">•</span>
                <span className="text-amber-300 font-semibold">SUMBAGSEL BUSINESS UNIT 8</span>
                <span className="text-blue-400">•</span>
                <span className="text-blue-300 italic">CORE: Raising New Horizon</span>
              </div>
            </div>
          </div>

          {/* Date, Status & Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Clock / Date Badge */}
            <div className="flex items-center bg-blue-900/60 backdrop-blur px-3 py-1.5 rounded-lg border border-blue-700/60 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
              <div className="text-left">
                <div className="font-semibold text-white">
                  {formatIndonesianFullDate(displayDate)}
                </div>
                <div className="text-[10px] text-blue-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Live: {formatIndonesianTime(displayDate)} WIB</span>
                </div>
              </div>
            </div>

            {/* Sync Now Button */}
            {onManualSync && (
              <button
                onClick={onManualSync}
                className="flex items-center text-xs font-semibold px-2.5 py-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-emerald-300 border border-blue-700 hover:border-emerald-500/50 transition-all cursor-pointer"
                title="Sinkronkan ulang data dari server secara manual"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span className="hidden sm:inline">Sync Cloud</span>
              </button>
            )}

            {/* Cara Update Guide Button */}
            <button
              onClick={onOpenUpdateGuide}
              className="flex items-center text-xs font-semibold px-2.5 py-2 rounded-lg bg-blue-800/90 hover:bg-blue-700 text-amber-300 border border-blue-600 transition-all cursor-pointer"
              title="Panduan cara update real-time"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Cara Update</span>
            </button>

            {/* Live Simulation Stream Toggle */}
            <button
              onClick={onToggleSimulating}
              className={`flex items-center text-xs font-semibold px-2.5 py-2 rounded-lg transition-all border shadow-sm ${
                isSimulating
                  ? 'bg-amber-500 hover:bg-amber-400 text-blue-950 border-amber-300 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-blue-800/80 hover:bg-blue-700 text-blue-100 border-blue-600'
              }`}
              title="Simulasi real-time pergerakan pembayaran collection lapangan secara otomatis"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1 text-blue-950" />
                  <span>Simulasi On</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  <span>Auto-Stream</span>
                </>
              )}
            </button>

            {/* Upload File Excel Monitoring Asli */}
            <button
              onClick={onOpenExcelUpload}
              className="flex items-center text-xs font-bold px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 shadow-md shadow-emerald-950/40 transition-all cursor-pointer ring-1 ring-emerald-300/30"
              title="Upload file Excel (.xlsx / .xls / .csv) monitoring harian asli Anda secara langsung"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-amber-300" />
              <span>Upload File Excel</span>
            </button>

            {/* Kelola Jumlah Petugas CO (Tambah / Kurangi CO) */}
            {onOpenManageCollectors && (
              <button
                onClick={onOpenManageCollectors}
                className="flex items-center text-xs font-bold px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 shadow-md transition-all cursor-pointer ring-1 ring-blue-400/30"
                title="Buka menu untuk menambah atau mengurangi petugas Collection Officer (CO)"
              >
                <Users className="w-4 h-4 mr-1.5 text-amber-300" />
                <span>Kelola CO</span>
              </button>
            )}

            {/* Quick Add / Update Data */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center text-xs font-semibold px-2.5 py-2 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-white border border-blue-600 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              Edit Manual
            </button>

            {/* Export Excel / CSV */}
            <button
              onClick={onExportCsv}
              className="flex items-center text-xs font-medium px-2.5 py-2 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-700 hover:border-blue-500 transition-all cursor-pointer"
              title="Export data ke CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-blue-300" />
              Export
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="flex items-center text-xs font-medium px-2.5 py-2 rounded-lg bg-blue-950 hover:bg-red-950 text-blue-300 hover:text-red-200 border border-blue-800 hover:border-red-700 transition-all cursor-pointer"
              title="Reset ke data baseline Excel"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
