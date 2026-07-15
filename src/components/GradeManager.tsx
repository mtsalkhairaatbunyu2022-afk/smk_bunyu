/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Siswa, PenilaianHarian } from '../types';
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
  GraduationCap,
  CheckCircle,
  TrendingUp,
  Award,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface GradeManagerProps {
  siswaList: Siswa[];
  nilaiList: PenilaianHarian[];
  setNilaiList: React.Dispatch<React.SetStateAction<PenilaianHarian[]>>;
}

export default function GradeManager({ siswaList, nilaiList, setNilaiList }: GradeManagerProps) {
  // Query / Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  // Form Inputs
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formNomor, setFormNomor] = useState<number | ''>('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formKelas, setFormKelas] = useState('');
  const [formSiswaId, setFormSiswaId] = useState('');
  const [formSiswaNamaManual, setFormSiswaNamaManual] = useState('');
  const [formNamaPenilaian, setFormNamaPenilaian] = useState('');
  const [formNilai, setFormNilai] = useState<number | ''>('');
  const [formKeterangan, setFormKeterangan] = useState('');

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

  // Reset form
  const resetForm = () => {
    setFormNomor('');
    setFormKelas('');
    setFormSiswaId('');
    setFormNamaPenilaian('');
    setFormNilai('');
    setFormKeterangan('');
    setIsEditing(false);
    setEditingId('');
  };

  // Save grade assessment
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTanggal || !formKelas || formKelas === '__lainnya__' || !formSiswaId || formSiswaId === '__lainnya__' || !formNamaPenilaian || formNilai === '') {
      setAlertMsg({ type: 'error', text: 'Semua kolom bertanda bintang wajib diisi dengan benar!' });
      return;
    }

    let matchedSiswa = siswaList.find(s => s.id === formSiswaId);
    if (!matchedSiswa) {
      if (formSiswaId === '__lainnya__' && formSiswaNamaManual.trim() !== '') {
        matchedSiswa = { id: `manual-${Date.now()}`, nama: formSiswaNamaManual.trim(), kelas: formKelas, jurusan: formKelas.split(' ').slice(1).join(' ') || 'Umum', nomor: 999 };
      } else {
        setAlertMsg({ type: 'error', text: 'Siswa tidak ditemukan.' });
        return;
      }
    }

    const parsedNilai = Number(formNilai);
    if (isNaN(parsedNilai) || parsedNilai < 0 || parsedNilai > 100) {
      setAlertMsg({ type: 'error', text: 'Nilai harus berupa angka antara 0 - 100!' });
      return;
    }

    const assignedNomor = formNomor === '' ? nilaiList.length + 1 : Number(formNomor);

    if (isEditing) {
      setNilaiList(prev => prev.map(item => item.id === editingId ? {
        ...item,
        nomor: assignedNomor,
        tanggal: formTanggal,
        siswaId: formSiswaId,
        namaSiswa: matchedSiswa.nama,
        kelas: formKelas,
        jurusan: matchedSiswa.jurusan,
        namaPenilaian: formNamaPenilaian.trim(),
        nilai: parsedNilai,
        keterangan: formKeterangan.trim()
      } : item));
      setAlertMsg({ type: 'success', text: `Nilai ${formNamaPenilaian} untuk ${matchedSiswa.nama} berhasil diperbarui.` });
    } else {
      const newGrade: PenilaianHarian = {
        id: 'nilai-' + Date.now(),
        nomor: assignedNomor,
        tanggal: formTanggal,
        siswaId: formSiswaId,
        namaSiswa: matchedSiswa.nama,
        kelas: formKelas,
        jurusan: matchedSiswa.jurusan,
        namaPenilaian: formNamaPenilaian.trim(),
        nilai: parsedNilai,
        keterangan: formKeterangan.trim() || 'Tuntas'
      };
      setNilaiList(prev => [...prev, newGrade]);
      setAlertMsg({ type: 'success', text: `Nilai ${formNamaPenilaian} untuk ${matchedSiswa.nama} berhasil dicatat.` });
    }

    resetForm();
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Delete grade
  const handleDeleteGrade = (id: string, namaSiswa: string, jenisNilai: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Nilai Siswa',
      message: `Apakah Anda yakin ingin menghapus data nilai "${jenisNilai}" untuk siswa "${namaSiswa}"?`,
      onConfirm: () => {
        setNilaiList(prev => prev.filter(item => item.id !== id));
        setAlertMsg({ type: 'success', text: 'Data nilai siswa berhasil dihapus.' });
        setTimeout(() => setAlertMsg(null), 3000);
      }
    });
  };

  // Start edit
  const handleStartEdit = (item: PenilaianHarian) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormNomor(item.nomor);
    setFormTanggal(item.tanggal);
    setFormKelas(item.kelas);
    setFormSiswaId(item.siswaId);
    setFormNamaPenilaian(item.namaPenilaian);
    setFormNilai(item.nilai);
    setFormKeterangan(item.keterangan);

    // Smooth scroll to form container
    setTimeout(() => {
      document.getElementById('form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Filter grades
  const filteredGrades = nilaiList.filter(item => {
    const matchesSearch = item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.namaPenilaian.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(item.nomor).includes(searchQuery);
    const matchesClass = selectedClassFilter ? item.kelas === selectedClassFilter : true;
    const matchesType = selectedTypeFilter ? item.namaPenilaian.toLowerCase().includes(selectedTypeFilter.toLowerCase()) : true;
    return matchesSearch && matchesClass && matchesType;
  }).sort((a, b) => a.nomor - b.nomor); // Order must start with NOMOR

  // Export headers (ORDER: NOMOR, TANGGAL, KELAS, NAMA SISWA, NAMA PENILAIAN, NILAI, KETERANGAN)
  const docHeaders = ['NOMOR', 'TANGGAL', 'KELAS', 'NAMA SISWA', 'NAMA PENILAIAN', 'NILAI', 'KETERANGAN'];
  const docRows = filteredGrades.map(item => [
    String(item.nomor),
    item.tanggal,
    item.kelas,
    item.namaSiswa,
    item.namaPenilaian,
    String(item.nilai),
    item.keterangan
  ]);

  const handleExportWord = () => {
    let sub = 'Hasil Input Rekapitulasi Nilai Siswa';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    exportToWord('Laporan Penilaian Harian', docHeaders, docRows, 'Laporan_Penilaian_Harian_Siswa', sub);
  };

  const handleExportExcel = () => {
    let sub = 'Hasil Input Rekapitulasi Nilai Siswa';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    exportToExcel('Laporan Penilaian Harian', docHeaders, docRows, 'Laporan_Penilaian_Harian_Siswa', sub);
  };

  const handleExportPDF = () => {
    let sub = 'Hasil Input Rekapitulasi Nilai Siswa';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    exportToPDF('Laporan Penilaian Harian', docHeaders, docRows, 'Laporan_Penilaian_Harian_Siswa', sub);
  };

  // Statistical calculations
  const totalScores = filteredGrades.map(g => g.nilai);
  const averageScore = totalScores.length > 0 ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1) : '0';
  const highestScore = totalScores.length > 0 ? Math.max(...totalScores) : 0;
  const lowestScore = totalScores.length > 0 ? Math.min(...totalScores) : 0;
  const passingStudents = filteredGrades.filter(g => g.nilai >= 75).length;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><GraduationCap className="w-5 h-5" /></span>
            Penilaian Harian Siswa
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Catat hasil ujian, kuis harian, maupun tugas siswa, pantau rekap statistik nilai kelas.</p>
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

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form Column */}
        <div id="form-container" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
          <h3 className="text-md font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span className="text-blue-600"><Plus className="w-4 h-4" /></span>
            {isEditing ? 'Ubah Catatan Nilai' : 'Input Penilaian Harian'}
          </h3>

          <form onSubmit={handleSaveGrade} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 1: NOMOR URUT</label>
              <input
                type="number"
                value={formNomor}
                onChange={e => setFormNomor(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contoh: 1 (opsional)"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 2: TANGGAL PENILAIAN *</label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 5: NAMA / JENIS PENILAIAN *</label>
              <input
                type="text"
                required
                value={formNamaPenilaian}
                onChange={e => setFormNamaPenilaian(e.target.value)}
                placeholder="Contoh: Ulangan Harian 1, Tugas 2, UTS"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 6: SKOR NILAI (0 - 100) *</label>
              <input
                type="number"
                required
                min={0}
                max={100}
                value={formNilai}
                onChange={e => setFormNilai(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Nilai angka, contoh: 85"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 7: KETERANGAN / CATATAN AKADEMIK</label>
              <textarea
                value={formKeterangan}
                onChange={e => setFormKeterangan(e.target.value)}
                placeholder="Contoh: Sangat baik pada pengerjaan coding, remedial ke-1"
                rows={2}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                {isEditing ? 'Simpan' : 'Simpan Nilai'}
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
                  placeholder="Cari siswa/penilaian..."
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
                value={selectedTypeFilter}
                onChange={e => setSelectedTypeFilter(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition text-slate-500"
              >
                <option value="">Semua Jenis Penilaian</option>
                <option value="Tugas">Tugas Mandiri</option>
                <option value="Ulangan">Ulangan Harian</option>
                <option value="UTS">UTS (Tengah Semester)</option>
                <option value="UAS">UAS (Akhir Semester)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExportExcel}
                disabled={filteredGrades.length === 0}
                className="p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportWord}
                disabled={filteredGrades.length === 0}
                className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Word"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={filteredGrades.length === 0}
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
                  <th className="py-3 px-4">NAMA PENILAIAN</th>
                  <th className="py-3 px-4">NILAI</th>
                  <th className="py-3 px-4">KETERANGAN</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredGrades.length > 0 ? (
                  filteredGrades.map((grade) => {
                    const gradeColors = grade.nilai >= 75 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100 font-bold' 
                      : 'bg-rose-50 text-rose-800 border-rose-100 font-bold';
                    return (
                      <tr key={grade.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500">{grade.nomor}</td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-600">{grade.tanggal}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-md font-semibold">{grade.kelas}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{grade.namaSiswa}</td>
                        <td className="py-3 px-4 text-slate-700 text-xs font-medium">{grade.namaPenilaian}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 text-xs border rounded-md font-mono ${gradeColors}`}>
                            {grade.nilai}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs truncate max-w-[150px]">{grade.keterangan}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(grade)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrade(grade.id, grade.namaSiswa, grade.namaPenilaian)}
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
                      <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Belum ada catatan nilai penilaian harian.<br/>
                      Gunakan form di sebelah kiri untuk mencatatkan nilai ujian siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recapitulation Footer */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700 flex justify-between items-center">
              <span>REKAPITULASI HASIL INPUT DATA:</span>
              <span className="font-normal text-slate-500">Total data dinilai: {filteredGrades.length} siswa</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 border-t border-slate-200/60 text-center">
              <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100/50">
                <span className="block text-[10px] text-blue-600 font-medium uppercase">Rata-rata Nilai</span>
                <span className="text-md font-bold text-blue-800">{averageScore}</span>
              </div>
              <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100/50">
                <span className="block text-[10px] text-emerald-600 font-medium uppercase">Nilai Tertinggi</span>
                <span className="text-md font-bold text-emerald-800">{highestScore}</span>
              </div>
              <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-100/50">
                <span className="block text-[10px] text-rose-600 font-medium uppercase">Nilai Terendah</span>
                <span className="text-md font-bold text-rose-800">{lowestScore}</span>
              </div>
              <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100/50">
                <span className="block text-[10px] text-amber-600 font-medium uppercase">Ketuntasan (KKM ≥75)</span>
                <span className="text-md font-bold text-amber-800">
                  {filteredGrades.length > 0 ? `${((passingStudents / filteredGrades.length) * 100).toFixed(0)}%` : '0%'}
                </span>
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
