/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Siswa } from '../types';
import { CLASSES, JURUSANS } from '../utils/constants';
import { downloadExcelTemplate, exportToWord, exportToPDF, exportToExcel } from '../utils/documentExport';
import { 
  FileSpreadsheet, 
  Upload, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Download, 
  FileText, 
  RefreshCw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface StudentManagerProps {
  siswaList: Siswa[];
  setSiswaList: React.Dispatch<React.SetStateAction<Siswa[]>>;
}

export default function StudentManager({ siswaList, setSiswaList }: StudentManagerProps) {
  // Filters and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedJurusanFilter, setSelectedJurusanFilter] = useState('');

  // Form states for manual Add / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formNomor, setFormNomor] = useState<number | ''>('');
  const [formNama, setFormNama] = useState('');
  const [formKelas, setFormKelas] = useState('');
  const [formJurusan, setFormJurusan] = useState('');
  
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

  // Feedbacks
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-fill jurusan when kelas is selected to make inputting faster
  const handleClassChange = (kelasVal: string) => {
    setFormKelas(kelasVal);
    // Suggest Jurusan based on Kelas suffix (e.g., 'RPL' -> 'Rekayasa Perangkat Lunak')
    if (kelasVal.includes('RPL')) {
      setFormJurusan('Rekayasa Perangkat Lunak');
    } else if (kelasVal.includes('TKJ')) {
      setFormJurusan('Teknik Komputer & Jaringan');
    } else if (kelasVal.includes('AKL')) {
      setFormJurusan('Akuntansi & Keuangan Lembaga');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormNomor('');
    setFormNama('');
    setFormKelas('');
    setFormJurusan('');
    setIsEditing(false);
    setEditingId('');
  };

  // Save student (Add / Edit)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formKelas || formKelas === '__lainnya__' || !formJurusan || formJurusan === '__lainnya__') {
      setAlertMsg({ type: 'error', text: 'Semua kolom wajib diisi dengan benar kecuali nomor!' });
      return;
    }

    const assignedNomor = formNomor === '' ? siswaList.length + 1 : Number(formNomor);

    if (isEditing) {
      setSiswaList(prev => prev.map(s => s.id === editingId ? {
        ...s,
        nomor: assignedNomor,
        nama: formNama.trim(),
        kelas: formKelas,
        jurusan: formJurusan
      } : s));
      setAlertMsg({ type: 'success', text: `Data siswa ${formNama} berhasil diperbarui.` });
    } else {
      const newStudent: Siswa = {
        id: 'siswa-' + Date.now(),
        nomor: assignedNomor,
        nama: formNama.trim(),
        kelas: formKelas,
        jurusan: formJurusan
      };
      setSiswaList(prev => [...prev, newStudent]);
      setAlertMsg({ type: 'success', text: `Siswa baru ${formNama} berhasil ditambahkan.` });
    }

    resetForm();
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Delete student
  const handleDeleteStudent = (id: string, nama: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Siswa',
      message: `Apakah Anda yakin ingin menghapus data siswa "${nama}"? Sesi absensi, bimbingan, atau nilai yang terkait mungkin juga perlu disesuaikan.`,
      onConfirm: () => {
        setSiswaList(prev => prev.filter(s => s.id !== id));
        setAlertMsg({ type: 'success', text: `Data siswa ${nama} telah dihapus.` });
        setTimeout(() => setAlertMsg(null), 3000);
      }
    });
  };

  // Prepare edit form
  const handleStartEdit = (student: Siswa) => {
    setIsEditing(true);
    setEditingId(student.id);
    setFormNomor(student.nomor);
    setFormNama(student.nama);
    setFormKelas(student.kelas);
    setFormJurusan(student.jurusan);
    
    // Smooth scroll to form container
    setTimeout(() => {
      document.getElementById('form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Import Excel (Multi Sheet supported)
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        let importedStudents: Siswa[] = [];
        let totalCount = 0;

        // Iterate through all sheets
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json(sheet) as any[];

          rawRows.forEach((row, idx) => {
            // Find keys dynamically (case-insensitive match)
            let no = idx + 1;
            let nama = '';
            let kelas = '';
            let jurusan = '';

            Object.keys(row).forEach((key) => {
              const normalizedKey = key.trim().toLowerCase();
              if (normalizedKey === 'no' || normalizedKey === 'nomor') {
                no = Number(row[key]);
              } else if (normalizedKey === 'nama' || normalizedKey === 'nama siswa' || normalizedKey === 'nama_siswa') {
                nama = String(row[key]);
              } else if (normalizedKey === 'kelas') {
                kelas = String(row[key]);
              } else if (normalizedKey === 'jurusan' || normalizedKey === 'prodi') {
                jurusan = String(row[key]);
              }
            });

            if (nama && kelas) {
              // Try to map jurusan if missing
              if (!jurusan) {
                if (kelas.includes('RPL')) jurusan = 'Rekayasa Perangkat Lunak';
                else if (kelas.includes('TKJ')) jurusan = 'Teknik Komputer & Jaringan';
                else if (kelas.includes('AKL')) jurusan = 'Akuntansi & Keuangan Lembaga';
                else jurusan = 'Umum';
              }

              importedStudents.push({
                id: `siswa-import-${sheetName}-${idx}-${Date.now()}`,
                nomor: isNaN(no) ? idx + 1 : no,
                nama: nama.trim(),
                kelas: kelas.trim(),
                jurusan: jurusan.trim()
              });
              totalCount++;
            }
          });
        });

        if (importedStudents.length > 0) {
          // Append imported students or replace? Let's ask or just append
          setSiswaList(prev => {
            // Re-sequence numbers to keep them consistent or merge
            const combined = [...prev, ...importedStudents];
            return combined;
          });
          setAlertMsg({ 
            type: 'success', 
            text: `Berhasil mengimpor ${totalCount} siswa dari ${workbook.SheetNames.length} sheet Excel!` 
          });
        } else {
          setAlertMsg({ 
            type: 'error', 
            text: 'Format file tidak sesuai. Pastikan ada kolom "NAMA" dan "KELAS" di dalam sheet Excel.' 
          });
        }
      } catch (err) {
        console.error(err);
        setAlertMsg({ type: 'error', text: 'Gagal menguraikan file Excel. Pastikan file valid.' });
      }
      // Reset input value to allow uploading same file
      e.target.value = '';
      setTimeout(() => setAlertMsg(null), 5000);
    };

    reader.readAsArrayBuffer(file);
  };

  // Clear all student data
  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Seluruh Data Siswa',
      message: 'PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH data siswa? Tindakan ini juga akan mengosongkan data absensi, bimbingan, dan penilaian yang berkaitan.',
      onConfirm: () => {
        setSiswaList([]);
        setAlertMsg({ type: 'success', text: 'Semua data siswa berhasil dibersihkan.' });
        setTimeout(() => setAlertMsg(null), 3000);
      }
    });
  };

  // Filter students based on search query, class, and major
  const filteredStudents = siswaList.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(s.nomor).includes(searchQuery);
    const matchesClass = selectedClassFilter ? s.kelas === selectedClassFilter : true;
    const matchesJurusan = selectedJurusanFilter ? s.jurusan === selectedJurusanFilter : true;
    return matchesSearch && matchesClass && matchesJurusan;
  }).sort((a, b) => a.nomor - b.nomor); // Ensure correct order starting by Nomor

  // Export to doc and pdf
  const handleExportWord = () => {
    const headers = ['NOMOR', 'NAMA', 'KELAS', 'JURUSAN'];
    const rows = filteredStudents.map(s => [String(s.nomor), s.nama, s.kelas, s.jurusan]);
    
    let subtitle = 'Roster Seluruh Siswa';
    if (selectedClassFilter) subtitle = `Daftar Siswa Kelas ${selectedClassFilter}`;
    else if (selectedJurusanFilter) subtitle = `Daftar Siswa Jurusan ${selectedJurusanFilter}`;

    exportToWord('Data Roster Siswa', headers, rows, 'Data_Siswa_SMKN1_Bunyu', subtitle);
  };

  const handleExportExcel = () => {
    const headers = ['NOMOR', 'NAMA', 'KELAS', 'JURUSAN'];
    const rows = filteredStudents.map(s => [String(s.nomor), s.nama, s.kelas, s.jurusan]);
    
    let subtitle = 'Roster Seluruh Siswa';
    if (selectedClassFilter) subtitle = `Daftar Siswa Kelas ${selectedClassFilter}`;
    else if (selectedJurusanFilter) subtitle = `Daftar Siswa Jurusan ${selectedJurusanFilter}`;

    exportToExcel('Data Roster Siswa', headers, rows, 'Data_Siswa_SMKN1_Bunyu', subtitle);
  };

  const handleExportPDF = () => {
    const headers = ['NOMOR', 'NAMA', 'KELAS', 'JURUSAN'];
    const rows = filteredStudents.map(s => [String(s.nomor), s.nama, s.kelas, s.jurusan]);
    
    let subtitle = 'Roster Seluruh Siswa';
    if (selectedClassFilter) subtitle = `Daftar Siswa Kelas ${selectedClassFilter}`;
    else if (selectedJurusanFilter) subtitle = `Daftar Siswa Jurusan ${selectedJurusanFilter}`;

    exportToPDF('Data Roster Siswa', headers, rows, 'Data_Siswa_SMKN1_Bunyu', subtitle);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Sparkles className="w-5 h-5" /></span>
            Database Data Siswa
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola data murid utama, impor Excel multi-sheet, dan ekspor dokumen resmi.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Template Excel
          </button>
          
          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition">
            <Upload className="w-4 h-4" />
            Impor Excel
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleExcelImport} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Alerts */}
      {alertMsg && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{alertMsg.text}</p>
        </div>
      )}

      {/* Split Form & View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Input Data Siswa */}
        <div id="form-container" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
          <h3 className="text-md font-semibold text-slate-900 border-b border-slate-100 pb-3">
            {isEditing ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
          </h3>
          
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 1: NOMOR URUT</label>
              <input
                type="number"
                value={formNomor}
                onChange={e => setFormNomor(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contoh: 1 (opsional)"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 2: NAMA SISWA *</label>
              <input
                type="text"
                required
                value={formNama}
                onChange={e => setFormNama(e.target.value)}
                placeholder="Nama lengkap siswa"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 3: JENJANG KELAS *</label>
              <select
                required={formKelas !== '__lainnya__' && !(!CLASSES.includes(formKelas) && formKelas !== '')}
                value={CLASSES.includes(formKelas) ? formKelas : (formKelas ? '__lainnya__' : '')}
                onChange={e => handleClassChange(e.target.value === '__lainnya__' ? '__lainnya__' : e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
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
                  onChange={e => handleClassChange(e.target.value)}
                  placeholder="Ketik entri manual..."
                  className="w-full mt-2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 4: JURUSAN AKADEMIK *</label>
              <select
                required={formJurusan !== '__lainnya__' && !(!JURUSANS.includes(formJurusan) && formJurusan !== '')}
                value={JURUSANS.includes(formJurusan) ? formJurusan : (formJurusan ? '__lainnya__' : '')}
                onChange={e => setFormJurusan(e.target.value === '__lainnya__' ? '__lainnya__' : e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              >
                <option value="">-- Pilih Aktivitas --</option>
                {JURUSANS.map(jur => (
                  <option key={jur} value={jur}>{jur}</option>
                ))}
                <option value="__lainnya__">Lainnya...</option>
              </select>
              {(formJurusan === '__lainnya__' || (formJurusan !== '' && !JURUSANS.includes(formJurusan))) && (
                <input
                  type="text"
                  required
                  value={formJurusan === '__lainnya__' ? '' : formJurusan}
                  onChange={e => setFormJurusan(e.target.value)}
                  placeholder="Ketik entri manual..."
                  className="w-full mt-2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                {isEditing ? 'Simpan' : 'Tambah'}
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

        {/* List View & Filters */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          
          {/* Controls Panel */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            
            <div className="flex flex-wrap gap-2 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nomor/nama..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Class Filter */}
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition"
              >
                <option value="">Semua Kelas</option>
                {CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              {/* Jurusan Filter */}
              <select
                value={selectedJurusanFilter}
                onChange={e => setSelectedJurusanFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition"
              >
                <option value="">Semua Jurusan</option>
                {JURUSANS.map(jur => (
                  <option key={jur} value={jur}>{jur}</option>
                ))}
              </select>
            </div>

            {/* Downloader buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportExcel}
                disabled={filteredStudents.length === 0}
                className="p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor ke Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportWord}
                disabled={filteredStudents.length === 0}
                className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor ke DOC Word"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={filteredStudents.length === 0}
                className="p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor ke PDF"
              >
                <Download className="w-4 h-4" />
              </button>
              {siswaList.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Kosongkan Semua"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">NOMOR</th>
                  <th className="py-3 px-4">NAMA LENGKAP</th>
                  <th className="py-3 px-4">KELAS</th>
                  <th className="py-3 px-4">JURUSAN</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-500 text-xs">{siswa.nomor}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{siswa.nama}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-md font-medium">{siswa.kelas}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{siswa.jurusan}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(siswa)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(siswa.id, siswa.nama)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Belum ada data siswa yang cocok.<br/>
                      Unggah template Excel atau gunakan form sebelah kiri untuk menambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recapitulation Footer inside Menu */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              Menampilkan <span className="font-semibold text-slate-700">{filteredStudents.length}</span> dari <span className="font-semibold text-slate-700">{siswaList.length}</span> total siswa terdaftar.
            </div>
            <div className="flex gap-4">
              <span>RPL: <strong className="text-slate-700">{siswaList.filter(s => s.kelas.includes('RPL')).length}</strong> siswa</span>
              <span>TKJ: <strong className="text-slate-700">{siswaList.filter(s => s.kelas.includes('TKJ')).length}</strong> siswa</span>
              <span>AKL: <strong className="text-slate-700">{siswaList.filter(s => s.kelas.includes('AKL')).length}</strong> siswa</span>
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
