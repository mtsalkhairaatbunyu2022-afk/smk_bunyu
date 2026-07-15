/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Siswa, JurnalMengajar, Absensi } from '../types';
import { CLASSES } from '../utils/constants';
import { exportToWord, exportToPDF, exportToExcel } from '../utils/documentExport';
import { 
  Calendar, 
  Search, 
  Trash2, 
  Edit2, 
  Download, 
  FileText, 
  Plus, 
  BookOpen,
  CheckCircle,
  FileCheck,
  Award,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface JournalManagerProps {
  siswaList: Siswa[];
  absensiList: Absensi[];
  jurnalList: JurnalMengajar[];
  setJurnalList: React.Dispatch<React.SetStateAction<JurnalMengajar[]>>;
}

export default function JournalManager({ siswaList, absensiList, jurnalList, setJurnalList }: JournalManagerProps) {
  // Query / Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  // Form Inputs
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formNomor, setFormNomor] = useState<number | ''>('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formKelas, setFormKelas] = useState('');
  const [formMataPelajaran, setFormMataPelajaran] = useState('');
  const [formMateriPokok, setFormMateriPokok] = useState('');
  const [formGuruNama, setFormGuruNama] = useState('');
  const [formKehadiranRingkasan, setFormKehadiranRingkasan] = useState('');
  const [formCatatanKelas, setFormCatatanKelas] = useState('');

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

  // Auto-calculate attendance summary when Kelas and Tanggal are changed
  useEffect(() => {
    if (formKelas && formTanggal && !isEditing) {
      // Find all attendance logs for this class and date
      const classLogs = absensiList.filter(a => a.kelas === formKelas && a.tanggal === formTanggal);
      const totalSiswaInClass = siswaList.filter(s => s.kelas === formKelas).length;
      
      if (classLogs.length > 0) {
        const hadir = classLogs.filter(a => a.status === 'Hadir').length;
        const terlambat = classLogs.filter(a => a.status === 'Terlambat').length;
        const sakit = classLogs.filter(a => a.status === 'Sakit').length;
        const izin = classLogs.filter(a => a.status === 'Izin').length;
        const alfa = classLogs.filter(a => a.status === 'Alfa').length;
        
        setFormKehadiranRingkasan(`Hadir: ${hadir}, Terlambat: ${terlambat}, Sakit: ${sakit}, Izin: ${izin}, Alfa: ${alfa}`);
      } else {
        // No logs yet, show default
        setFormKehadiranRingkasan(`Hadir: ${totalSiswaInClass}, Terlambat: 0, Sakit: 0, Izin: 0, Alfa: 0 (Presensi belum dicatat)`);
      }
    }
  }, [formKelas, formTanggal, absensiList, siswaList, isEditing]);

  // Reset form
  const resetForm = () => {
    setFormNomor('');
    setFormKelas('');
    setFormMataPelajaran('');
    setFormMateriPokok('');
    setFormGuruNama('');
    setFormKehadiranRingkasan('');
    setFormCatatanKelas('');
    setIsEditing(false);
    setEditingId('');
  };

  // Save journal
  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTanggal || !formKelas || formKelas === '__lainnya__' || !formMataPelajaran || !formMateriPokok || !formGuruNama) {
      setAlertMsg({ type: 'error', text: 'Semua kolom bertanda bintang wajib diisi dengan benar!' });
      return;
    }

    const assignedNomor = formNomor === '' ? jurnalList.length + 1 : Number(formNomor);

    if (isEditing) {
      setJurnalList(prev => prev.map(item => item.id === editingId ? {
        ...item,
        nomor: assignedNomor,
        tanggal: formTanggal,
        kelas: formKelas,
        jurusan: formKelas.split(' ').slice(1).join(' ') || 'Umum',
        mataPelajaran: formMataPelajaran.trim(),
        materiPokok: formMateriPokok.trim(),
        guruNama: formGuruNama.trim(),
        kehadiranRingkasan: formKehadiranRingkasan.trim(),
        catatanKelas: formCatatanKelas.trim()
      } : item));
      setAlertMsg({ type: 'success', text: `Jurnal mengajar mata pelajaran ${formMataPelajaran} berhasil diperbarui.` });
    } else {
      const newJournal: JurnalMengajar = {
        id: 'jurnal-' + Date.now(),
        nomor: assignedNomor,
        tanggal: formTanggal,
        kelas: formKelas,
        jurusan: formKelas.split(' ').slice(1).join(' ') || 'Umum',
        mataPelajaran: formMataPelajaran.trim(),
        materiPokok: formMateriPokok.trim(),
        guruNama: formGuruNama.trim(),
        kehadiranRingkasan: formKehadiranRingkasan.trim() || 'Hadir lengkap',
        catatanKelas: formCatatanKelas.trim() || 'Kelas berjalan kondusif.'
      };
      setJurnalList(prev => [...prev, newJournal]);
      setAlertMsg({ type: 'success', text: `Jurnal mengajar mata pelajaran ${formMataPelajaran} berhasil disimpan.` });
    }

    resetForm();
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Delete journal
  const handleDeleteJournal = (id: string, mapel: string, tanggal: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Jurnal Mengajar',
      message: `Apakah Anda yakin ingin menghapus catatan jurnal mengajar untuk mata pelajaran "${mapel}" pada tanggal ${tanggal}?`,
      onConfirm: () => {
        setJurnalList(prev => prev.filter(item => item.id !== id));
        setAlertMsg({ type: 'success', text: 'Jurnal mengajar berhasil dihapus.' });
        setTimeout(() => setAlertMsg(null), 3000);
      }
    });
  };

  // Start edit
  const handleStartEdit = (item: JurnalMengajar) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormNomor(item.nomor);
    setFormTanggal(item.tanggal);
    setFormKelas(item.kelas);
    setFormMataPelajaran(item.mataPelajaran);
    setFormMateriPokok(item.materiPokok);
    setFormGuruNama(item.guruNama);
    setFormKehadiranRingkasan(item.kehadiranRingkasan);
    setFormCatatanKelas(item.catatanKelas);

    // Smooth scroll to form container
    setTimeout(() => {
      document.getElementById('form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Filter journals
  const filteredJournals = jurnalList.filter(item => {
    const matchesSearch = item.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.materiPokok.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.guruNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(item.nomor).includes(searchQuery);
    const matchesClass = selectedClassFilter ? item.kelas === selectedClassFilter : true;
    return matchesSearch && matchesClass;
  }).sort((a, b) => a.nomor - b.nomor); // Ordered starting with NOMOR

  // Export headers (ORDER: NOMOR, TANGGAL, KELAS, MATA PELAJARAN, MATERI POKOK, NAMA GURU, RINGKASAN KEHADIRAN, CATATAN KEJADIAN KELAS)
  const docHeaders = ['NOMOR', 'TANGGAL', 'KELAS', 'MATA PELAJARAN', 'MATERI POKOK', 'NAMA GURU', 'RINGKASAN KEHADIRAN', 'CATATAN KEJADIAN KELAS'];
  const docRows = filteredJournals.map(item => [
    String(item.nomor),
    item.tanggal,
    item.kelas,
    item.mataPelajaran,
    item.materiPokok,
    item.guruNama,
    item.kehadiranRingkasan,
    item.catatanKelas
  ]);

  const handleExportWord = () => {
    let sub = 'Hasil Input Jurnal Mengajar Harian';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    exportToWord('Laporan Jurnal Mengajar', docHeaders, docRows, 'Laporan_Jurnal_Mengajar_Guru', sub);
  };

  const handleExportExcel = () => {
    let sub = 'Hasil Input Jurnal Mengajar Harian';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    exportToExcel('Laporan Jurnal Mengajar', docHeaders, docRows, 'Laporan_Jurnal_Mengajar_Guru', sub);
  };

  const handleExportPDF = () => {
    let sub = 'Hasil Input Jurnal Mengajar Harian';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    exportToPDF('Laporan Jurnal Mengajar', docHeaders, docRows, 'Laporan_Jurnal_Mengajar_Guru', sub);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-5 h-5" /></span>
            Jurnal Mengajar Guru
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Catat agenda pembelajaran harian kelas, materi pokok, serta rekap presensi kelas terintegrasi.</p>
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form Column */}
        <div id="form-container" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
          <h3 className="text-md font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="text-blue-600"><FileCheck className="w-4 h-4" /></span>
            {isEditing ? 'Ubah Jurnal Mengajar' : 'Input Jurnal Mengajar'}
          </h3>

          <form onSubmit={handleSaveJournal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 1: NOMOR JURNAL</label>
              <input
                type="number"
                value={formNomor}
                onChange={e => setFormNomor(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contoh: 1 (opsional)"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 2: TANGGAL MENGAJAR *</label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 3: KELAS YANG DIAJAR *</label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 4: MATA PELAJARAN *</label>
              <input
                type="text"
                required
                value={formMataPelajaran}
                onChange={e => setFormMataPelajaran(e.target.value)}
                placeholder="Contoh: Pemrograman Web, PAI, Kimia"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 5: MATERI POKOK PEMBELAJARAN *</label>
              <input
                type="text"
                required
                value={formMateriPokok}
                onChange={e => setFormMateriPokok(e.target.value)}
                placeholder="Contoh: Instalasi Framework Node.js"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 6: NAMA LENGKAP GURU *</label>
              <input
                type="text"
                required
                value={formGuruNama}
                onChange={e => setFormGuruNama(e.target.value)}
                placeholder="Nama & gelar pengajar"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                KOLOM 7: RINGKASAN KEHADIRAN SISWA
                <span className="text-[10px] text-slate-400 font-normal ml-1">(Otomatis tersinkronisasi)</span>
              </label>
              <input
                type="text"
                value={formKehadiranRingkasan}
                onChange={e => setFormKehadiranRingkasan(e.target.value)}
                placeholder="Otomatis terisi dari log absensi siswa"
                className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 8: CATATAN KEJADIAN KELAS / INCIDENT</label>
              <textarea
                value={formCatatanKelas}
                onChange={e => setFormCatatanKelas(e.target.value)}
                placeholder="Uraikan kondisi siswa, keterlambatan massal, atau prestasi luar biasa hari ini."
                rows={2.5}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                {isEditing ? 'Simpan' : 'Simpan Jurnal'}
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
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mapel, materi, guru..."
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
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExportExcel}
                disabled={filteredJournals.length === 0}
                className="p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportWord}
                disabled={filteredJournals.length === 0}
                className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Word"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={filteredJournals.length === 0}
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
                  <th className="py-3 px-4">MATA PELAJARAN / GURU</th>
                  <th className="py-3 px-4">MATERI POKOK</th>
                  <th className="py-3 px-4">PRESENSI SEKELAS</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredJournals.length > 0 ? (
                  filteredJournals.map((jurnal) => (
                    <tr key={jurnal.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500">{jurnal.nomor}</td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">{jurnal.tanggal}</td>
                      <td className="py-3 px-4 text-slate-600 font-bold text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md">{jurnal.kelas}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs">{jurnal.mataPelajaran}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{jurnal.guruNama}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs max-w-[130px] truncate" title={jurnal.materiPokok}>
                        {jurnal.materiPokok}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg inline-block font-mono font-medium max-w-[160px] truncate" title={jurnal.kehadiranRingkasan}>
                          {jurnal.kehadiranRingkasan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(jurnal)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJournal(jurnal.id, jurnal.mataPelajaran, jurnal.tanggal)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Belum ada agenda jurnal mengajar hari ini.<br/>
                      Gunakan form di sebelah kiri untuk mencatatkan jurnal mengajar baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recapitulation Footer inside Menu */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              Menampilkan <span className="font-semibold text-slate-700">{filteredJournals.length}</span> dari <span className="font-semibold text-slate-700">{jurnalList.length}</span> total log jurnal.
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Persentase input jurnal berjalan normal <strong>100%</strong></span>
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
