import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { CollectorRecord } from '../types';
import { formatRupiah } from '../utils/calculations';

interface DeleteCollectorConfirmModalProps {
  isOpen: boolean;
  collector: CollectorRecord | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteCollectorConfirmModal: React.FC<DeleteCollectorConfirmModalProps> = ({
  isOpen,
  collector,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !collector) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 text-rose-600">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Hapus Petugas CO?
              </h3>
              <span className="text-xs text-rose-600 font-semibold">
                Tindakan pengurangan jumlah Collection Officer
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-500">Nama Petugas:</span>
            <span className="font-bold text-slate-900">{collector.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">NIK:</span>
            <span className="font-mono font-semibold text-slate-700">{collector.nik}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Segmen (Role):</span>
            <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
              collector.primaryRole === 'FE'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {collector.primaryRole}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Beban Awal:</span>
            <span className="font-semibold text-slate-800">
              {formatRupiah(collector.bahanAwalAmt)} ({collector.bahanAwalAct} Akun)
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          Apakah Anda yakin ingin menghapus <strong>{collector.name}</strong> dari daftar Collection Officer cabang? 
          Data kolektor ini beserta beban dan perhitungan insentifnya akan ditarik dari sistem.
        </p>

        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(collector.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus Kolektor Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
