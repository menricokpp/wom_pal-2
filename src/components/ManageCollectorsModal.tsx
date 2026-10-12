import React, { useState } from 'react';
import { CollectorRecord, CollectorRole } from '../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  Check, 
  X, 
  AlertTriangle,
  UserCheck,
  UserX,
  Edit2
} from 'lucide-react';
import { formatRupiah } from '../utils/calculations';

interface ManageCollectorsModalProps {
  isOpen: boolean;
  collectors: CollectorRecord[];
  onClose: () => void;
  onAddCollector: (newCol: Omit<CollectorRecord, 'id' | 'updatedAt'>) => void;
  onDeleteCollector: (id: string) => void;
  onToggleActive: (id: string) => void;
  onSelectForEdit: (col: CollectorRecord) => void;
}

export const ManageCollectorsModal: React.FC<ManageCollectorsModalProps> = ({
  isOpen,
  collectors,
  onClose,
  onAddCollector,
  onDeleteCollector,
  onToggleActive,
  onSelectForEdit,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Collector Form State
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [role, setRole] = useState<CollectorRole>('FE');
  const [bahanAwalAct, setBahanAwalAct] = useState<number>(300);
  const [bahanAwalAmt, setBahanAwalAmt] = useState<number>(350000000);
  const [targetHarian, setTargetHarian] = useState<number>(10000000);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanNik = nik.trim() || `0${Math.floor(1000000 + Math.random() * 9000000)}`;

    onAddCollector({
      name: name.trim().toUpperCase(),
      nik: cleanNik,
      primaryRole: role,
      isActive: true,
      bahanAwalAct: Number(bahanAwalAct) || 0,
      bahanAwalAmt: Number(bahanAwalAmt) || 0,
      aktualSoreAct: Number(bahanAwalAct) || 0,
      aktualSoreAmt: Number(bahanAwalAmt) || 0,
      realisasiAmt: 0,
      kurangClosing: -(Number(bahanAwalAmt) || 0),
      targetHarian: Number(targetHarian) || 0,
      kurangTargetHarian: Number(targetHarian) || 0,
      btcPct: 25.0,
      weeklyProgress: {
        w1: 0,
        w2: 0,
        w3: 0,
        w4: 0,
      },
      dkhPct: 96.0,
      unitTarikan: {
        motor: 0,
        mobil: 0,
      },
      bastkStatus: 'lengkap',
      stayPct: 18.0,
      ball0130Pct: 2.0,
      ballNoOdPct: 96.0,
      angsuran1_3: 0,
      angsuran1_6: 0,
      angsuran1_9: 0,
      delq30Pct: 2.0,
      ball3160Pct: 0.8,
      rollbackPct: role === 'MR' ? 18.0 : undefined,
      pelunasanPct: role === 'MR' ? 8.0 : undefined,
      successRateMRPct: role === 'MR' ? 35.0 : undefined,
      raporFE: role === 'FE' ? { flowEver: 44.0, balance: 8.2, flowNoOd: 2.5 } : undefined,
      raporMR: role === 'MR' ? { flowEver: 52.0, balance: 1.5, flowForward: 6.2 } : undefined,
    });

    setName('');
    setNik('');
    setBahanAwalAct(300);
    setBahanAwalAmt(350000000);
    setShowAddForm(false);
  };

  const activeCOs = collectors.filter(c => c.isActive);
  const inactiveCOs = collectors.filter(c => !c.isActive);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">Kelola Jumlah Petugas Collection Officer (CO)</h3>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Tambah CO baru, nonaktifkan, atau hapus petugas penagih ({collectors.length} total • {activeCOs.length} aktif)
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

        {/* Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium">
            Petugas Aktif: <strong className="text-blue-900">{activeCOs.length}</strong> (FE: {activeCOs.filter(c => c.primaryRole === 'FE').length}, MR: {activeCOs.filter(c => c.primaryRole === 'MR').length}{activeCOs.some(c => c.primaryRole === 'NOOD') ? `, NOOD: ${activeCOs.filter(c => c.primaryRole === 'NOOD').length}` : ''})
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs cursor-pointer transition-all"
          >
            {showAddForm ? (
              <>
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Batal Tambah</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 mr-1 text-amber-300" />
                <span>Tambah Petugas CO Baru</span>
              </>
            )}
          </button>
        </div>

        {/* Form Tambah CO Baru */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="p-4 bg-blue-50/70 border-b border-blue-200 text-xs animate-in fade-in duration-150">
            <div className="font-bold text-blue-950 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Formulir Tambah Petugas Collection Baru</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap CO *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BUDI SANTOSO"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NIK Kolektor</label>
                <input
                  type="text"
                  placeholder="Contoh: 08240012"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Segmen Portofolio *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as CollectorRole)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FE">Front End (FE 01-30)</option>
                  <option value="MR">Mid Range (MR 31-60)</option>
                  <option value="NOOD">No Overdue (CO NOOD)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Beban Awal Kontrak (Act)</label>
                <input
                  type="number"
                  value={bahanAwalAct}
                  onChange={(e) => setBahanAwalAct(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Beban Awal Rupiah (Amt)</label>
                <input
                  type="number"
                  value={bahanAwalAmt}
                  onChange={(e) => setBahanAwalAmt(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Harian (Rp)</label>
                <input
                  type="number"
                  value={targetHarian}
                  onChange={(e) => setTargetHarian(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan &amp; Tambahkan CO
              </button>
            </div>
          </form>
        )}

        {/* List of Collectors */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {collectors.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Belum ada petugas CO. Klik tombol &quot;Tambah Petugas CO Baru&quot; di atas.
            </div>
          ) : (
            collectors.map((col, idx) => {
              const isDeleting = deleteConfirmId === col.id;

              return (
                <div
                  key={col.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    !col.isActive
                      ? 'bg-slate-100 border-slate-300 opacity-70'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{col.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                            col.primaryRole === 'FE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : col.primaryRole === 'NOOD'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {col.primaryRole}
                        </span>
                        {!col.isActive && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-200 text-slate-600">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                        <span>NIK: {col.nik}</span>
                        <span>Beban Awal: {col.bahanAwalAct} Kontrak • {formatRupiah(col.bahanAwalAmt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 self-end sm:self-center">
                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => onToggleActive(col.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                        col.isActive
                          ? 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      }`}
                      title={col.isActive ? 'Nonaktifkan CO sementara' : 'Aktifkan CO kembali'}
                    >
                      {col.isActive ? (
                        <>
                          <UserX className="w-3.5 h-3.5 text-slate-500" />
                          <span>Nonaktifkan</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aktifkan</span>
                        </>
                      )}
                    </button>

                    {/* Edit Detail */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectForEdit(col);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                      title="Edit parameter detail kinerja & beban CO"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete CO */}
                    {isDeleting ? (
                      <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-lg border border-red-300">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCollector(col.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          Hapus!
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-slate-600 hover:bg-white rounded text-[11px] cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(col.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                        title="Hapus petugas CO ini dari sistem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Perubahan daftar CO tersimpan otomatis ke browser storage lokal.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
