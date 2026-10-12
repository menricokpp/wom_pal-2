import React from 'react';
import { 
  X, 
  Edit3, 
  Calculator, 
  Upload, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Smartphone, 
  Database,
  ArrowRight
} from 'lucide-react';

interface RealtimeUpdateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditModal: () => void;
  onGoToSimulator: () => void;
  onOpenExcelUpload: () => void;
}

export const RealtimeUpdateGuideModal: React.FC<RealtimeUpdateGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenEditModal,
  onGoToSimulator,
  onOpenExcelUpload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-blue-950 font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Panduan Cara Update Data Real-Time di Web
              </h3>
              <p className="text-[11px] text-blue-200">
                Dashboard ini 100% interaktif dan dapat diperbarui kapan saja secara instan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-900 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Bisa di-update real-time kapan saja!</strong> Setiap angka yang Anda ubah akan langsung menghitung ulang insentif, ranking, dan predikat rapor secara live tanpa perlu reload halaman.
            </span>
          </div>

          <div className="space-y-3">
            {/* Cara 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px]">1</span>
                  Edit Langsung per Collector (Paling Cepat)
                </span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Rekomendasi
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                Klik ikon pensil <Edit3 className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> di samping nama collector pada tabel utama, atau klik tombol <strong>"Update Real-Time"</strong> di menu atas.
                <br />• Masukkan nominal pembayaran terbaru sore ini (Aktual Sore).
                <br />• Update unit tarikan motor / mobil atau kelengkapan BASTK.
                <br />• Klik <em>"Simpan Perubahan"</em> $\rightarrow$ angka di dashboard langsung ter-update seketika.
              </p>
              <button
                onClick={() => { onClose(); onOpenEditModal(); }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer transition-all"
              >
                <span>Coba Buka Form Update Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cara 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px]">2</span>
                  Lewat Tab "Simulator & What-If Insentif"
                </span>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  Uji Skenario
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                Buka tab <strong>"Simulator & What-If Insentif"</strong> di atas. Pilih collector yang ingin Anda ubah, geser slider target W1-W4, DKH %, atau unit tarikan. Di bagian bawah kalkulator, klik tombol <strong>"Terapkan Hasil Simulasi ke Collector"</strong> untuk menyimpan hasil kalkulasi tersebut langsung ke data live.
              </p>
              <button
                onClick={() => { onClose(); onGoToSimulator(); }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer transition-all"
              >
                <span>Buka Tab Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cara 3 */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 transition-all shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px]">3</span>
                  Upload Langsung File Excel Asli (.xlsx / .xls)
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                  Tanpa Template Khusus
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                Anda dapat langsung mengunggah file Excel monitoring harian dari komputer Anda (format asli WOM Finance). Sistem pintar kami akan otomatis membaca sheet, mencocokkan nama dan NIK kolektor, serta mengupdate nominal Aktual Sore, Kontrak, W1-W4, dan BTC secara otomatis!
              </p>
              <button
                onClick={() => { onClose(); onOpenExcelUpload(); }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-all"
              >
                <span>Buka Modal Upload Excel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cara 4 */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 hover:border-indigo-300 transition-all shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[11px]">4</span>
                  Sinkronisasi Real-Time Semua Perangkat (Multi-Device Live Sync)
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 animate-pulse">
                  Aktif Otomatis
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Website ini dilengkapi arsitektur <strong>Server-Sent Events (SSE) &amp; Cloud State Synchronization</strong>. Ketika Anda mengunggah Excel atau mengedit collector di satu perangkat (misal laptop admin), data akan <strong>otomatis ter-update seketika di semua perangkat lain</strong> (HP pimpinan, tablet supervisor, PC cabang) yang sedang membuka dashboard ini, tanpa perlu refresh manual.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
          >
            Mengerti, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};
