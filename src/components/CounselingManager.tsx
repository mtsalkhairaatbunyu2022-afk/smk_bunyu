/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Siswa, BimbinganKonseling } from '../types';
import { CLASSES, JENIS_LAYANAN, STATUS_KASUS } from '../utils/constants';
import { exportToWord, exportToPDF, exportToExcel } from '../utils/documentExport';
import { 
  Calendar, 
  Search, 
  Trash2, 
  Edit2, 
  Download, 
  FileText, 
  Plus, 
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface CounselingManagerProps {
  siswaList: Siswa[];
  bkList: BimbinganKonseling[];
  setBkList: React.Dispatch<React.SetStateAction<BimbinganKonseling[]>>;
}

export default function CounselingManager({ siswaList, bkList, setBkList }: CounselingManagerProps) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedLayananFilter, setSelectedLayananFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Form inputs
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formNomor, setFormNomor] = useState<number | ''>('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formKelas, setFormKelas] = useState('');
  const [formSiswaId, setFormSiswaId] = useState('');
  const [formSiswaNamaManual, setFormSiswaNamaManual] = useState('');
  const [formJenisLayanan, setFormJenisLayanan] = useState<BimbinganKonseling['jenisLayanan']>('Pribadi');
  const [formMasalah, setFormMasalah] = useState('');
  const [formSolusi, setFormSolusi] = useState('');
  const [formTindakLanjut, setFormTindakLanjut] = useState('');
  const [formStatusKasus, setFormStatusKasus] = useState<BimbinganKonseling['statusKasus']>('Selesai');

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-select first student when class is selected in form
  const classStudents = siswaList.filter(s => s.kelas === formKelas);

  useEffect(() => {
    if (formKelas && classStudents.length > 0 && !isEditing) {
      setFormSiswaId(classStudents[0].id);
    } else if (!formKelas) {
      setFormSiswaId('');
    }
  }, [formKelas, siswaList]);

  // Reset Form
  const resetForm = () => {
    setFormNomor('');
    setFormKelas('');
    setFormSiswaId('');
    setFormJenisLayanan('Pribadi');
    setFormMasalah('');
    setFormSolusi('');
    setFormTindakLanjut('');
    setFormStatusKasus('Selesai');
    setIsEditing(false);
    setEditingId('');
  };

  // Save session
  const handleSaveBK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTanggal || !formKelas || formKelas === '__lainnya__' || !formSiswaId || formSiswaId === '__lainnya__' || !formMasalah || !formSolusi || formJenisLayanan === '__lainnya__') {
      setAlertMsg({ type: 'error', text: 'Semua kolom bertanda bintang wajib diisi dengan benar!' });
      return;
    }

    let matchedSiswa = siswaList.find(s => s.id === formSiswaId);
    if (!matchedSiswa) {
      if (formSiswaId === '__lainnya__' && formSiswaNamaManual.trim() !== '') {
        matchedSiswa = { id: `manual-${Date.now()}`, nama: formSiswaNamaManual.trim(), kelas: formKelas, jurusan: formKelas.split(' ').slice(1).join(' ') || 'Umum', nomor: 999 };
      } else {
        setAlertMsg({ type: 'error', text: 'Data siswa tidak ditemukan.' });
        return;
      }
    }

    const assignedNomor = formNomor === '' ? bkList.length + 1 : Number(formNomor);

    if (isEditing) {
      setBkList(prev => prev.map(item => item.id === editingId ? {
        ...item,
        nomor: assignedNomor,
        tanggal: formTanggal,
        siswaId: formSiswaId,
        namaSiswa: matchedSiswa.nama,
        kelas: formKelas,
        jurusan: matchedSiswa.jurusan,
        jenisLayanan: formJenisLayanan,
        masalah: formMasalah.trim(),
        solusi: formSolusi.trim(),
        tindakLanjut: formTindakLanjut.trim(),
        statusKasus: formStatusKasus
      } : item));
      setAlertMsg({ type: 'success', text: `Data konseling ${matchedSiswa.nama} berhasil diperbarui.` });
    } else {
      const newBK: BimbinganKonseling = {
        id: 'bk-' + Date.now(),
        nomor: assignedNomor,
        tanggal: formTanggal,
        siswaId: formSiswaId,
        namaSiswa: matchedSiswa.nama,
        kelas: formKelas,
        jurusan: matchedSiswa.jurusan,
        jenisLayanan: formJenisLayanan,
        masalah: formMasalah.trim(),
        solusi: formSolusi.trim(),
        tindakLanjut: formTindakLanjut.trim() || 'Pemantauan perkembangan berkala',
        statusKasus: formStatusKasus
      };
      setBkList(prev => [...prev, newBK]);
      setAlertMsg({ type: 'success', text: `Sesi konseling ${matchedSiswa.nama} berhasil disimpan.` });
    }

    resetForm();
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Delete session
  const handleDeleteBK = (id: string, namaSiswa: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Sesi Bimbingan',
      message: `Apakah Anda yakin ingin menghapus catatan bimbingan konseling untuk siswa "${namaSiswa}"?`,
      onConfirm: () => {
        setBkList(prev => prev.filter(item => item.id !== id));
        setAlertMsg({ type: 'success', text: 'Data bimbingan konseling berhasil dihapus.' });
        setTimeout(() => setAlertMsg(null), 3000);
      }
    });
  };

  // Start Edit
  const handleStartEdit = (item: BimbinganKonseling) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormNomor(item.nomor);
    setFormTanggal(item.tanggal);
    setFormKelas(item.kelas);
    setFormSiswaId(item.siswaId);
    setFormJenisLayanan(item.jenisLayanan);
    setFormMasalah(item.masalah);
    setFormSolusi(item.solusi);
    setFormTindakLanjut(item.tindakLanjut);
    setFormStatusKasus(item.statusKasus);

    // Smooth scroll to form container
    setTimeout(() => {
      document.getElementById('form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Filter BK list
  const filteredBK = bkList.filter(item => {
    const matchesSearch = item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.masalah.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(item.nomor).includes(searchQuery);
    const matchesClass = selectedClassFilter ? item.kelas === selectedClassFilter : true;
    const matchesLayanan = selectedLayananFilter ? item.jenisLayanan === selectedLayananFilter : true;
    const matchesStatus = selectedStatusFilter ? item.statusKasus === selectedStatusFilter : true;
    return matchesSearch && matchesClass && matchesLayanan && matchesStatus;
  }).sort((a, b) => a.nomor - b.nomor); // Order must be sequential starting with NOMOR

  // Export headers (ORDER: NOMOR, TANGGAL, KELAS, NAMA SISWA, JENIS LAYANAN, MASALAH, SOLUSI, TINDAK LANJUT, STATUS KASUS)
  const docHeaders = ['NOMOR', 'TANGGAL', 'KELAS', 'NAMA SISWA', 'JENIS LAYANAN', 'DETAIL MASALAH', 'SOLUSI / KESEPAKATAN', 'TINDAK LANJUT', 'STATUS KASUS'];
  const docRows = filteredBK.map(item => [
    String(item.nomor),
    item.tanggal,
    item.kelas,
    item.namaSiswa,
    item.jenisLayanan,
    item.masalah,
    item.solusi,
    item.tindakLanjut,
    item.statusKasus
  ]);

  const handleExportWord = () => {
    let sub = 'Hasil Input Rekap Bimbingan Konseling';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    if (selectedLayananFilter) sub += ` Layanan ${selectedLayananFilter}`;
    exportToWord('Laporan Bimbingan Konseling', docHeaders, docRows, 'Laporan_Bimbingan_Konseling_Siswa', sub);
  };

  const handleExportExcel = () => {
    let sub = 'Hasil Input Rekap Bimbingan Konseling';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    if (selectedLayananFilter) sub += ` Layanan ${selectedLayananFilter}`;
    exportToExcel('Laporan Bimbingan Konseling', docHeaders, docRows, 'Laporan_Bimbingan_Konseling_Siswa', sub);
  };

  const handleExportPDF = () => {
    let sub = 'Hasil Input Rekap Bimbingan Konseling';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    if (selectedLayananFilter) sub += ` Layanan ${selectedLayananFilter}`;
    exportToPDF('Laporan Bimbingan Konseling', docHeaders, docRows, 'Laporan_Bimbingan_Konseling_Siswa', sub);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><HeartHandshake className="w-5 h-5" /></span>
            Layanan Bimbingan Konseling (BK)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Catat bimbingan pribadi, sosial, belajar, dan karir murid, pantau status masalah secara intensif.</p>
        </div>
      </div>

      {/* Alerts */}
      {alertMsg && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{alertMsg.text}</p>
        </div>
      )}

      {/* Main split dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column */}
        <div id="form-container" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
          <h3 className="text-md font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="text-blue-600"><ClipboardList className="w-4 h-4" /></span>
            {isEditing ? 'Ubah Catatan Konseling' : 'Input Sesi Konseling'}
          </h3>

          <form onSubmit={handleSaveBK} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 1: NOMOR BK</label>
              <input
                type="number"
                value={formNomor}
                onChange={e => setFormNomor(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contoh: 1 (opsional)"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 2: TANGGAL BIMBINGAN *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={formTanggal}
                  onChange={e => setFormTanggal(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 3: KELAS SISWA *</label>
              <select
                required={formKelas !== '__lainnya__' && !(!CLASSES.includes(formKelas) && formKelas !== '')}
                value={CLASSES.includes(formKelas) ? formKelas : (formKelas ? '__lainnya__' : '')}
                onChange={e => setFormKelas(e.target.value === '__lainnya__' ? '__lainnya__' : e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              >
                <option value="">-- Pilih Aktivitas --</option>
                {CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
                <option value="__lainnya__">Lainnya...</option>
              </select>
              {(formKelas === '__lainnya__' || (formKelas !== '' && !CLASSES.includes(formKelas))) && (
                <input
                  type="text"
                  required
                  value={formKelas === '__lainnya__' ? '' : formKelas}
                  onChange={e => setFormKelas(e.target.value)}
                  placeholder="Ketik entri manual..."
                  className="w-full mt-2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                KOLOM 4: NAMA SISWA *
                <span className="text-[10px] text-slate-400 font-normal ml-1">(Otomatis mengambil dari kelas)</span>
              </label>
              <select
                required={formSiswaId !== '__lainnya__'}
                disabled={!formKelas}
                value={classStudents.some(s => s.id === formSiswaId) ? formSiswaId : (formSiswaId ? '__lainnya__' : '')}
                onChange={e => setFormSiswaId(e.target.value === '__lainnya__' ? '__lainnya__' : e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              >
                {!formKelas ? (
                  <option value="">-- Pilih Aktivitas --</option>
                ) : classStudents.length === 0 ? (
                  <option value="">-- Tidak ada siswa di kelas ini --</option>
                ) : (
                  <>
                    <option value="">-- Pilih Aktivitas --</option>
                    {classStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.nomor}. {s.nama} ({s.jurusan})</option>
                    ))}
                    <option value="__lainnya__">Lainnya...</option>
                  </>
                )}
                {classStudents.length === 0 && formKelas && <option value="__lainnya__">Lainnya...</option>}
              </select>
              {formSiswaId === '__lainnya__' && (
                <input
                  type="text"
                  required
                  value={formSiswaNamaManual}
                  onChange={e => setFormSiswaNamaManual(e.target.value)}
                  placeholder="Ketik nama siswa manual..."
                  className="w-full mt-2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 5: JENIS LAYANAN BK *</label>
              <select
                required={formJenisLayanan !== '__lainnya__' && !(!JENIS_LAYANAN.includes(formJenisLayanan) && formJenisLayanan !== '')}
                value={JENIS_LAYANAN.includes(formJenisLayanan) ? formJenisLayanan : (formJenisLayanan ? '__lainnya__' : '')}
                onChange={e => setFormJenisLayanan(e.target.value === '__lainnya__' ? '__lainnya__' : e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              >
                <option value="">-- Pilih Aktivitas --</option>
                {JENIS_LAYANAN.map(lay => (
                  <option key={lay} value={lay}>Layanan Bimbingan {lay}</option>
                ))}
                <option value="__lainnya__">Lainnya...</option>
              </select>
              {(formJenisLayanan === '__lainnya__' || (formJenisLayanan !== '' && !JENIS_LAYANAN.includes(formJenisLayanan))) && (
                <input
                  type="text"
                  required
                  value={formJenisLayanan === '__lainnya__' ? '' : formJenisLayanan}
                  onChange={e => setFormJenisLayanan(e.target.value)}
                  placeholder="Ketik entri manual..."
                  className="w-full mt-2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 6: DESKRIPSI MASALAH *</label>
              <textarea
                required
                value={formMasalah}
                onChange={e => setFormMasalah(e.target.value)}
                placeholder="Uraikan keluhan/masalah siswa secara komprehensif"
                rows={3}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 7: SOLUSI / KESEPAKATAN *</label>
              <textarea
                required
                value={formSolusi}
                onChange={e => setFormSolusi(e.target.value)}
                placeholder="Rekomendasi solusi atau kesepakatan bersama siswa"
                rows={2}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 8: TINDAK LANJUT KONSULTASI</label>
              <input
                type="text"
                value={formTindakLanjut}
                onChange={e => setFormTindakLanjut(e.target.value)}
                placeholder="Contoh: Pemantauan kehadiran, Kunjungan rumah"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 9: STATUS PENYELESAIAN KASUS *</label>
              <div className="grid grid-cols-3 gap-1.5">
                {STATUS_KASUS.map(st => {
                  const colors = {
                    Selesai: 'peer-checked:bg-emerald-600 peer-checked:text-white hover:bg-emerald-50 text-emerald-700 bg-emerald-50/40',
                    'Dalam Proses': 'peer-checked:bg-amber-500 peer-checked:text-white hover:bg-amber-50 text-amber-700 bg-amber-50/40',
                    Lanjutan: 'peer-checked:bg-rose-600 peer-checked:text-white hover:bg-rose-50 text-rose-700 bg-rose-50/40'
                  };
                  return (
                    <label key={st} className="cursor-pointer text-center">
                      <input
                        type="radio"
                        name="statusKasus"
                        value={st}
                        checked={formStatusKasus === st}
                        onChange={() => setFormStatusKasus(st)}
                        className="sr-only peer"
                      />
                      <span className={`block py-1.5 text-[10px] font-bold rounded-lg transition ${colors[st]}`}>
                        {st}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                {isEditing ? 'Simpan' : 'Simpan Sesi'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recapitulation Table Column */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            
            <div className="flex flex-wrap gap-1.5 flex-1">
              <div className="relative flex-1 min-w-[130px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa/masalah..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition"
              >
                <option value="">Semua Kelas</option>
                {CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              <select
                value={selectedLayananFilter}
                onChange={e => setSelectedLayananFilter(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition"
              >
                <option value="">Semua Layanan</option>
                {JENIS_LAYANAN.map(lay => (
                  <option key={lay} value={lay}>Bimbingan {lay}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition text-slate-500"
              >
                <option value="">Semua Kasus</option>
                {STATUS_KASUS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExportExcel}
                disabled={filteredBK.length === 0}
                className="p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportWord}
                disabled={filteredBK.length === 0}
                className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Word"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={filteredBK.length === 0}
                className="p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">NOMOR</th>
                  <th className="py-3 px-4">TANGGAL</th>
                  <th className="py-3 px-4">KELAS</th>
                  <th className="py-3 px-4">NAMA SISWA</th>
                  <th className="py-3 px-4">LAYANAN</th>
                  <th className="py-3 px-4">MASALAH & SOLUSI</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBK.length > 0 ? (
                  filteredBK.map((bk) => {
                    const statusColors = {
                      Selesai: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      'Dalam Proses': 'bg-amber-50 text-amber-700 border-amber-100',
                      Lanjutan: 'bg-rose-50 text-rose-700 border-rose-100'
                    };
                    const layananColors = {
                      Pribadi: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                      Sosial: 'bg-purple-50 text-purple-700 border-purple-100',
                      Belajar: 'bg-cyan-50 text-cyan-700 border-cyan-100',
                      Karir: 'bg-teal-50 text-teal-700 border-teal-100'
                    };
                    return (
                      <tr key={bk.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500">{bk.nomor}</td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-600">{bk.tanggal}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-md font-semibold">{bk.kelas}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{bk.namaSiswa}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-md ${layananColors[bk.jenisLayanan]}`}>
                            {bk.jenisLayanan}
                          </span>
                        </td>
                        <td className="py-3 px-4 space-y-1">
                          <div className="text-xs text-slate-800 font-medium line-clamp-1">
                            <span className="text-rose-600 font-bold mr-1">M:</span> {bk.masalah}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            <span className="text-emerald-600 font-bold mr-1">S:</span> {bk.solusi}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md whitespace-nowrap ${statusColors[bk.statusKasus]}`}>
                            {bk.statusKasus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(bk)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBK(bk.id, bk.namaSiswa)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      <HeartHandshake className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Belum ada sesi bimbingan konseling.<br/>
                      Gunakan form di sebelah kiri untuk mencatat sesi BK baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recapitulation results */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700 flex justify-between items-center">
              <span>REKAPITULASI HASIL INPUT DATA:</span>
              <span className="font-normal text-slate-500">Total Sesi BK: {filteredBK.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 border-t border-slate-200/60">
              <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100/50">
                <span className="block text-[10px] text-indigo-600 font-medium uppercase">Bimbingan Pribadi</span>
                <span className="text-md font-bold text-indigo-800">{filteredBK.filter(a => a.jenisLayanan === 'Pribadi').length}</span>
              </div>
              <div className="p-2 bg-purple-50/60 rounded-lg border border-purple-100/50">
                <span className="block text-[10px] text-purple-600 font-medium uppercase">Bimbingan Sosial</span>
                <span className="text-md font-bold text-purple-800">{filteredBK.filter(a => a.jenisLayanan === 'Sosial').length}</span>
              </div>
              <div className="p-2 bg-cyan-50/60 rounded-lg border border-cyan-100/50">
                <span className="block text-[10px] text-cyan-600 font-medium uppercase">Bimbingan Belajar</span>
                <span className="text-md font-bold text-cyan-800">{filteredBK.filter(a => a.jenisLayanan === 'Belajar').length}</span>
              </div>
              <div className="p-2 bg-teal-50/60 rounded-lg border border-teal-100/50">
                <span className="block text-[10px] text-teal-600 font-medium uppercase">Bimbingan Karir</span>
                <span className="text-md font-bold text-teal-800">{filteredBK.filter(a => a.jenisLayanan === 'Karir').length}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-100 shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h4 className="text-md font-bold text-slate-900">{confirmModal.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
              >
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
