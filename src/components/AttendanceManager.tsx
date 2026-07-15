/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Siswa, Absensi, AbsensiStatus } from '../types';
import { CLASSES, ABSENSI_STATUSES } from '../utils/constants';
import { exportToWord, exportToPDF, exportToExcel } from '../utils/documentExport';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Search, 
  Trash2, 
  Edit2, 
  Download, 
  FileText, 
  Plus, 
  CheckCircle,
  Clock,
  Sparkles,
  ClipboardList,
  FileSpreadsheet
} from 'lucide-react';

interface AttendanceManagerProps {
  siswaList: Siswa[];
  absensiList: Absensi[];
  setAbsensiList: React.Dispatch<React.SetStateAction<Absensi[]>>;
}

export default function AttendanceManager({ siswaList, absensiList, setAbsensiList }: AttendanceManagerProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<'logs' | 'rekap'>('rekap');

  // Query / Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Form input states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formNomor, setFormNomor] = useState<number | ''>('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formKelas, setFormKelas] = useState('');
  const [formSiswaId, setFormSiswaId] = useState('');
  const [formSiswaNamaManual, setFormSiswaNamaManual] = useState('');
  const [formStatus, setFormStatus] = useState<AbsensiStatus>('Hadir');
  const [formKeterangan, setFormKeterangan] = useState('');

  // Bulk / Collective Attendance states
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkKelas, setBulkKelas] = useState('');
  const [bulkTanggal, setBulkTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStatuses, setBulkStatuses] = useState<{ [siswaId: string]: { status: AbsensiStatus; keterangan: string } }>({});

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

  // Get students of the selected class
  const classStudents = siswaList.filter(s => s.kelas === (isBulkMode ? bulkKelas : formKelas));

  // Auto-select first student when class is changed in individual form
  useEffect(() => {
    if (formKelas && classStudents.length > 0 && !isEditing) {
      setFormSiswaId(classStudents[0].id);
    } else if (!formKelas) {
      setFormSiswaId('');
    }
  }, [formKelas, siswaList]);

  // Initialize collective statuses when bulk class is selected
  useEffect(() => {
    if (bulkKelas) {
      const initial: typeof bulkStatuses = {};
      classStudents.forEach(s => {
        initial[s.id] = { status: 'Hadir', keterangan: 'Hadir Tepat Waktu' };
      });
      setBulkStatuses(initial);
    }
  }, [bulkKelas, siswaList]);

  // Reset form
  const resetForm = () => {
    setFormNomor('');
    setFormKelas('');
    setFormSiswaId('');
    setFormStatus('Hadir');
    setFormKeterangan('');
    setIsEditing(false);
    setEditingId('');
  };

  // Save Individual Attendance
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTanggal || !formKelas || formKelas === '__lainnya__' || !formSiswaId || formSiswaId === '__lainnya__' || !formStatus) {
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

    const assignedNomor = formNomor === '' ? absensiList.length + 1 : Number(formNomor);

    if (isEditing) {
      setAbsensiList(prev => prev.map(item => item.id === editingId ? {
        ...item,
        nomor: assignedNomor,
        tanggal: formTanggal,
        siswaId: formSiswaId,
        namaSiswa: matchedSiswa.nama,
        kelas: formKelas,
        jurusan: matchedSiswa.jurusan,
        status: formStatus,
        keterangan: formKeterangan.trim()
      } : item));
      setAlertMsg({ type: 'success', text: `Data absensi ${matchedSiswa.nama} berhasil diperbarui.` });
    } else {
      // Check duplicate for same student on same date
      const isDuplicate = absensiList.some(a => a.siswaId === formSiswaId && a.tanggal === formTanggal);
      if (isDuplicate) {
        // Auto-overwrite existing record cleanly
        setAbsensiList(prev => prev.filter(a => !(a.siswaId === formSiswaId && a.tanggal === formTanggal)));
      }

      const newAbsensi: Absensi = {
        id: 'abs-' + Date.now(),
        nomor: assignedNomor,
        tanggal: formTanggal,
        siswaId: formSiswaId,
        namaSiswa: matchedSiswa.nama,
        kelas: formKelas,
        jurusan: matchedSiswa.jurusan,
        status: formStatus,
        keterangan: formKeterangan.trim() || 'Hadir Tepat Waktu'
      };
      setAbsensiList(prev => [...prev, newAbsensi]);
      setAlertMsg({ 
        type: 'success', 
        text: isDuplicate 
          ? `Absensi ${matchedSiswa.nama} berhasil diperbarui (menimpa catatan lama).` 
          : `Absensi ${matchedSiswa.nama} berhasil disimpan.` 
      });
    }

    resetForm();
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Save Bulk / Collective Class Attendance
  const handleSaveBulkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkKelas || bulkKelas === '__lainnya__' || !bulkTanggal) {
      setAlertMsg({ type: 'error', text: 'Kelas dan Tanggal wajib diisi dengan benar!' });
      return;
    }

    if (classStudents.length === 0) {
      setAlertMsg({ type: 'error', text: `Tidak ada data siswa terdaftar di kelas ${bulkKelas}.` });
      return;
    }

    // Filter out existing attendance on same date and class to avoid clutter
    setAbsensiList(prev => prev.filter(a => !(a.kelas === bulkKelas && a.tanggal === bulkTanggal)));

    const newLogs: Absensi[] = classStudents.map((siswa, index) => {
      const state = bulkStatuses[siswa.id] || { status: 'Hadir', keterangan: 'Hadir' };
      return {
        id: `abs-bulk-${siswa.id}-${bulkTanggal}-${Date.now()}`,
        nomor: absensiList.length + index + 1,
        tanggal: bulkTanggal,
        siswaId: siswa.id,
        namaSiswa: siswa.nama,
        kelas: bulkKelas,
        jurusan: siswa.jurusan,
        status: state.status,
        keterangan: state.keterangan.trim() || (state.status === 'Hadir' ? 'Hadir Tepat Waktu' : state.status)
      };
    });

    setAbsensiList(prev => [...prev, ...newLogs]);
    setAlertMsg({ type: 'success', text: `Berhasil mencatat absensi kelas ${bulkKelas} (${newLogs.length} siswa) untuk tanggal ${bulkTanggal}.` });
    setIsBulkMode(false);
    setBulkKelas('');
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Handle status toggle inside Bulk Table
  const handleBulkStatusChange = (siswaId: string, status: AbsensiStatus) => {
    setBulkStatuses(prev => {
      const defaultKet = status === 'Hadir' ? 'Hadir Tepat Waktu' : status;
      return {
        ...prev,
        [siswaId]: { status, keterangan: defaultKet }
      };
    });
  };

  const handleBulkKeteranganChange = (siswaId: string, keterangan: string) => {
    setBulkStatuses(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], keterangan }
    }));
  };

  // Delete individual log
  const handleDeleteAttendance = (id: string, namaSiswa: string, tanggal: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Log Absensi',
      message: `Apakah Anda yakin ingin menghapus catatan absensi siswa "${namaSiswa}" pada tanggal ${tanggal}?`,
      onConfirm: () => {
        setAbsensiList(prev => prev.filter(item => item.id !== id));
        setAlertMsg({ type: 'success', text: 'Log absensi berhasil dihapus.' });
        setTimeout(() => setAlertMsg(null), 3000);
      }
    });
  };

  // Start Editing
  const handleStartEdit = (item: Absensi) => {
    setIsEditing(true);
    setIsBulkMode(false);
    setEditingId(item.id);
    setFormNomor(item.nomor);
    setFormTanggal(item.tanggal);
    setFormKelas(item.kelas);
    setFormSiswaId(item.siswaId);
    setFormStatus(item.status);
    setFormKeterangan(item.keterangan);

    // Smooth scroll to form container
    setTimeout(() => {
      document.getElementById('form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Filter attendance recapitulation
  const filteredAbsensi = absensiList.filter(item => {
    const matchesSearch = item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(item.nomor).includes(searchQuery);
    const matchesClass = selectedClassFilter ? item.kelas === selectedClassFilter : true;
    const matchesStatus = selectedStatusFilter ? item.status === selectedStatusFilter : true;
    const matchesDate = selectedDateFilter ? item.tanggal === selectedDateFilter : true;
    return matchesSearch && matchesClass && matchesStatus && matchesDate;
  }).sort((a, b) => a.nomor - b.nomor); // Order must be sequential starting with Number (NOMOR)

  // Calculate student statistics for the table's keterangan format
  const getStudentStats = (siswaId: string) => {
    const studentLogs = absensiList.filter(abs => {
      const matchesSiswa = abs.siswaId === siswaId;
      const matchesDate = selectedDateFilter ? abs.tanggal === selectedDateFilter : true;
      return matchesSiswa && matchesDate;
    });

    return {
      hadir: studentLogs.filter(l => l.status === 'Hadir').length,
      terlambat: studentLogs.filter(l => l.status === 'Terlambat').length,
      sakit: studentLogs.filter(l => l.status === 'Sakit').length,
      izin: studentLogs.filter(l => l.status === 'Izin').length,
      alfa: studentLogs.filter(l => l.status === 'Alfa').length,
    };
  };

  // Get list of unique students for Rekapitulasi view
  const filteredStudentsForRekap = siswaList.filter(siswa => {
    const matchesSearch = siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(siswa.nomor).includes(searchQuery);
    const matchesClass = selectedClassFilter ? siswa.kelas === selectedClassFilter : true;
    return matchesSearch && matchesClass;
  }).sort((a, b) => a.nomor - b.nomor);

  // Export headers (ORDER: NOMOR, TANGGAL, KELAS, NAMA SISWA, STATUS, KETERANGAN)
  const docHeaders = viewMode === 'logs'
    ? ['NOMOR', 'TANGGAL', 'KELAS', 'NAMA SISWA', 'STATUS', 'KETERANGAN']
    : ['NOMOR', 'KELAS', 'NAMA SISWA', 'TOTAL HADIR', 'TOTAL TERLAMBAT', 'TOTAL SAKIT', 'TOTAL IZIN', 'TOTAL ALFA'];

  const docRows = viewMode === 'logs'
    ? filteredAbsensi.map(item => [
        String(item.nomor),
        item.tanggal,
        item.kelas,
        item.namaSiswa,
        item.status,
        item.keterangan
      ])
    : filteredStudentsForRekap.map((siswa, idx) => {
        const stats = getStudentStats(siswa.id);
        return [
          String(siswa.nomor || idx + 1),
          siswa.kelas,
          siswa.nama,
          String(stats.hadir),
          String(stats.terlambat),
          String(stats.sakit),
          String(stats.izin),
          String(stats.alfa)
        ];
      });

  const handleExportWord = () => {
    let sub = viewMode === 'logs' ? 'Log Harian Kehadiran Siswa' : 'Rekapitulasi Akumulasi Kehadiran';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    if (selectedDateFilter) sub += ` pada ${selectedDateFilter}`;
    exportToWord(viewMode === 'logs' ? 'Laporan Absensi Siswa' : 'Rekapitulasi Absensi Siswa', docHeaders, docRows, 'Laporan_Absensi_Siswa', sub);
  };

  const handleExportExcel = () => {
    let sub = viewMode === 'logs' ? 'Log Harian Kehadiran Siswa' : 'Rekapitulasi Akumulasi Kehadiran';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    if (selectedDateFilter) sub += ` pada ${selectedDateFilter}`;
    exportToExcel(viewMode === 'logs' ? 'Laporan Absensi Siswa' : 'Rekapitulasi Absensi Siswa', docHeaders, docRows, 'Laporan_Absensi_Siswa', sub);
  };

  const handleExportPDF = () => {
    let sub = viewMode === 'logs' ? 'Log Harian Kehadiran Siswa' : 'Rekapitulasi Akumulasi Kehadiran';
    if (selectedClassFilter) sub += ` Kelas ${selectedClassFilter}`;
    if (selectedDateFilter) sub += ` pada ${selectedDateFilter}`;
    exportToPDF(viewMode === 'logs' ? 'Laporan Absensi Siswa' : 'Rekapitulasi Absensi Siswa', docHeaders, docRows, 'Laporan_Absensi_Siswa', sub);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><UserCheck className="w-5 h-5" /></span>
            Absensi Kehadiran Siswa
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Catat presensi harian siswa secara berkala, kelola rekapitulasi, dan ekspor dokumen.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsBulkMode(!isBulkMode); resetForm(); }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
              isBulkMode 
                ? 'bg-slate-200 text-slate-700' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Users className="w-4 h-4" />
            {isBulkMode ? 'Mode Input Individu' : 'Input Absen Kelas (Massal)'}
          </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form Column */}
        <div id="form-container" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
          
          {!isBulkMode ? (
            /* INDIVIDUAL ATTENDANCE FORM */
            <>
              <h3 className="text-md font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <span className="text-blue-600"><Plus className="w-4 h-4" /></span>
                {isEditing ? 'Ubah Absensi Siswa' : 'Input Absensi Individu'}
              </h3>
              
              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 1: NOMOR LOG</label>
                  <input
                    type="number"
                    value={formNomor}
                    onChange={e => setFormNomor(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 1 (opsional)"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 2: TANGGAL ABSENSI *</label>
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 3: PILIH KELAS *</label>
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 5: STATUS HADIR *</label>
                  <div className="grid grid-cols-5 gap-1">
                    {ABSENSI_STATUSES.map(st => {
                      const colors = {
                        Hadir: 'peer-checked:bg-emerald-600 peer-checked:text-white hover:bg-emerald-50 text-emerald-700 bg-emerald-50/40',
                        Terlambat: 'peer-checked:bg-orange-500 peer-checked:text-white hover:bg-orange-50 text-orange-700 bg-orange-50/40',
                        Sakit: 'peer-checked:bg-amber-500 peer-checked:text-white hover:bg-amber-50 text-amber-700 bg-amber-50/40',
                        Izin: 'peer-checked:bg-blue-500 peer-checked:text-white hover:bg-blue-50 text-blue-700 bg-blue-50/40',
                        Alfa: 'peer-checked:bg-rose-600 peer-checked:text-white hover:bg-rose-50 text-rose-700 bg-rose-50/40'
                      };
                      return (
                        <label key={st} className="cursor-pointer text-center">
                          <input
                            type="radio"
                            name="status"
                            value={st}
                            checked={formStatus === st}
                            onChange={() => setFormStatus(st)}
                            className="sr-only peer"
                          />
                          <span className={`block py-1.5 text-[10px] font-semibold rounded-lg transition ${colors[st]}`}>
                            {st}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">KOLOM 6: KETERANGAN / CATATAN</label>
                  <textarea
                    value={formKeterangan}
                    onChange={e => setFormKeterangan(e.target.value)}
                    placeholder="Contoh: Sakit influenza, Surat dilampirkan"
                    rows={2}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    {isEditing ? 'Simpan Perubahan' : 'Catat Presensi'}
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
            </>
          ) : (
            /* COLLECTIVE/BULK CLASS ATTENDANCE FORM */
            <>
              <h3 className="text-md font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <span className="text-emerald-600"><Users className="w-4 h-4" /></span>
                Absen Kolektif Sekelas
              </h3>
              
              <form onSubmit={handleSaveBulkAttendance} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">TANGGAL ABSENSI SEKELAS *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={bulkTanggal}
                      onChange={e => setBulkTanggal(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">PILIH KELAS KOLEKTIF *</label>
                  <select
                    required={bulkKelas !== '__lainnya__' && !(!CLASSES.includes(bulkKelas) && bulkKelas !== '')}
                    value={CLASSES.includes(bulkKelas) ? bulkKelas : (bulkKelas ? '__lainnya__' : '')}
                    onChange={e => setBulkKelas(e.target.value === '__lainnya__' ? '__lainnya__' : e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                  >
                    <option value="">-- Pilih Aktivitas --</option>
                    {CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                    <option value="__lainnya__">Lainnya...</option>
                  </select>
                  {(bulkKelas === '__lainnya__' || (bulkKelas !== '' && !CLASSES.includes(bulkKelas))) && (
                    <input
                      type="text"
                      required
                      value={bulkKelas === '__lainnya__' ? '' : bulkKelas}
                      onChange={e => setBulkKelas(e.target.value)}
                      placeholder="Ketik entri manual..."
                      className="w-full mt-2 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                    />
                  )}
                </div>

                {bulkKelas && classStudents.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold text-slate-600">DAFTAR SISWA KELAS {bulkKelas} ({classStudents.length} siswa)</label>
                    
                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                      {classStudents.map((siswa) => {
                        const state = bulkStatuses[siswa.id] || { status: 'Hadir', keterangan: '' };
                        return (
                          <div key={siswa.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">{siswa.nomor}. {siswa.nama}</span>
                              <span className="text-[10px] text-slate-400">{siswa.jurusan}</span>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-1">
                              {ABSENSI_STATUSES.map(st => {
                                const isChecked = state.status === st;
                                const colors = {
                                  Hadir: isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-50 text-slate-600',
                                  Terlambat: isChecked ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-orange-50 text-slate-600',
                                  Sakit: isChecked ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-amber-50 text-slate-600',
                                  Izin: isChecked ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-blue-50 text-slate-600',
                                  Alfa: isChecked ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-rose-50 text-slate-600'
                                };
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleBulkStatusChange(siswa.id, st)}
                                    className={`py-1 text-[10px] font-semibold rounded-md transition ${colors[st]}`}
                                  >
                                    {st}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {state.status !== 'Hadir' && (
                              <input
                                type="text"
                                placeholder={`Keterangan ${state.status}...`}
                                value={state.keterangan === state.status ? '' : state.keterangan}
                                onChange={e => handleBulkKeteranganChange(siswa.id, e.target.value)}
                                className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {bulkKelas && classStudents.length === 0 && (
                  <p className="text-xs text-rose-500 text-center py-4 bg-rose-50 border border-rose-100 rounded-xl">
                    Siswa pada kelas {bulkKelas} belum terisi di database utama. Silakan isi/impor di Data Siswa dahulu.
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!bulkKelas || classStudents.length === 0}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98] rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Simpan Presensi Kelas
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsBulkMode(false); setBulkKelas(''); }}
                    className="px-4 py-2.5 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

        {/* Recapitulation Table Column */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          
          {/* View Mode Switcher */}
          <div className="flex border-b border-slate-100 pb-1">
            <button
              type="button"
              onClick={() => setViewMode('rekap')}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                viewMode === 'rekap'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Rekapitulasi Kehadiran (Format Tabel)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('logs')}
              className={`flex-1 pb-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                viewMode === 'logs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Log Aktivitas Presensi (Harian)
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            
            <div className="flex flex-wrap gap-1.5 flex-1">
              <div className="relative flex-1 min-w-[130px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa..."
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

              {viewMode === 'logs' && (
                <select
                  value={selectedStatusFilter}
                  onChange={e => setSelectedStatusFilter(e.target.value)}
                  className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition"
                >
                  <option value="">Semua Status</option>
                  {ABSENSI_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              )}

              <input
                type="date"
                value={selectedDateFilter}
                onChange={e => setSelectedDateFilter(e.target.value)}
                className="px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden transition text-slate-500"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExportExcel}
                disabled={viewMode === 'logs' ? filteredAbsensi.length === 0 : filteredStudentsForRekap.length === 0}
                className="p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportWord}
                disabled={viewMode === 'logs' ? filteredAbsensi.length === 0 : filteredStudentsForRekap.length === 0}
                className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan Word"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={viewMode === 'logs' ? filteredAbsensi.length === 0 : filteredStudentsForRekap.length === 0}
                className="p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition"
                title="Ekspor Laporan PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            {viewMode === 'rekap' ? (
              /* FORMATTED REKAPITULASI TABLE */
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-slate-200 font-bold uppercase tracking-wider">NOMOR</th>
                    <th rowSpan={2} className="py-3 px-3 border-r border-slate-200 font-bold uppercase tracking-wider">KELAS</th>
                    <th rowSpan={2} className="py-3 px-3 border-r border-slate-200 font-bold uppercase tracking-wider">NAMA SISWA</th>
                    <th colSpan={5} className="py-1 px-3 border-b border-slate-200 text-center font-bold text-slate-800 bg-slate-100/60 lowercase tracking-wider">keterangan</th>
                  </tr>
                  <tr className="bg-slate-50/50 text-slate-600 text-[10px] uppercase font-semibold border-b border-slate-200">
                    <th className="py-1.5 px-2 border-r border-slate-200 text-center text-emerald-700 font-bold bg-emerald-50/10">Total Hadir</th>
                    <th className="py-1.5 px-2 border-r border-slate-200 text-center text-orange-700 font-bold bg-orange-50/10">Total Terlambat</th>
                    <th className="py-1.5 px-2 border-r border-slate-200 text-center text-amber-700 font-bold bg-amber-50/10">Total Sakit</th>
                    <th className="py-1.5 px-2 border-r border-slate-200 text-center text-blue-700 font-bold bg-blue-50/10">Total Izin</th>
                    <th className="py-1.5 px-2 text-center text-rose-700 font-bold bg-rose-50/10">Total Alfa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudentsForRekap.length > 0 ? (
                    filteredStudentsForRekap.map((siswa, idx) => {
                      const stats = getStudentStats(siswa.id);
                      return (
                        <tr key={siswa.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-2.5 px-3 font-mono text-center font-semibold text-slate-500 border-r border-slate-200 bg-slate-50/30">{siswa.nomor || idx + 1}</td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-xs">{siswa.kelas}</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-900">{siswa.nama}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-emerald-800 border-r border-slate-200 bg-emerald-50/5">{stats.hadir}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-orange-800 border-r border-slate-200 bg-orange-50/5">{stats.terlambat}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-amber-800 border-r border-slate-200 bg-amber-50/5">{stats.sakit}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-blue-800 border-r border-slate-200 bg-blue-50/5">{stats.izin}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-rose-800 bg-rose-50/5">{stats.alfa}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Tidak ada data siswa ditemukan untuk kriteria pencarian ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              /* INDIVIDUAL DAILY LOGS TABLE */
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">NOMOR</th>
                    <th className="py-3 px-4">TANGGAL</th>
                    <th className="py-3 px-4">KELAS</th>
                    <th className="py-3 px-4">NAMA SISWA</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">KETERANGAN</th>
                    <th className="py-3 px-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAbsensi.length > 0 ? (
                    filteredAbsensi.map((abs) => {
                      const statusColors = {
                        Hadir: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        Terlambat: 'bg-orange-50 text-orange-700 border-orange-100',
                        Sakit: 'bg-amber-50 text-amber-700 border-amber-100',
                        Izin: 'bg-blue-50 text-blue-700 border-blue-100',
                        Alfa: 'bg-rose-50 text-rose-700 border-rose-100'
                      };
                      return (
                        <tr key={abs.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500">{abs.nomor}</td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {abs.tanggal}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-md font-semibold">{abs.kelas}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">{abs.namaSiswa}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 text-xs font-semibold border rounded-md ${statusColors[abs.status]}`}>
                              {abs.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs truncate max-w-[150px]">{abs.keterangan}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleStartEdit(abs)}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAttendance(abs.id, abs.namaSiswa, abs.tanggal)}
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
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Belum ada catatan presensi hari ini.<br/>
                        Gunakan form di sebelah kiri untuk mencatat kehadiran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Recapitulation Footer */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700 flex justify-between items-center">
              <span>REKAPITULASI HASIL INPUT DATA:</span>
              <span className="font-normal text-slate-500">Total data log: {filteredAbsensi.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1.5 border-t border-slate-200/60">
              <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100/50">
                <span className="block text-[10px] text-emerald-600 font-medium uppercase">Total Hadir</span>
                <span className="text-md font-bold text-emerald-800">{filteredAbsensi.filter(a => a.status === 'Hadir').length}</span>
              </div>
              <div className="p-2 bg-orange-50/60 rounded-lg border border-orange-100/50">
                <span className="block text-[10px] text-orange-600 font-medium uppercase">Total Terlambat</span>
                <span className="text-md font-bold text-orange-800">{filteredAbsensi.filter(a => a.status === 'Terlambat').length}</span>
              </div>
              <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100/50">
                <span className="block text-[10px] text-amber-600 font-medium uppercase">Total Sakit</span>
                <span className="text-md font-bold text-amber-800">{filteredAbsensi.filter(a => a.status === 'Sakit').length}</span>
              </div>
              <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100/50">
                <span className="block text-[10px] text-blue-600 font-medium uppercase">Total Izin</span>
                <span className="text-md font-bold text-blue-800">{filteredAbsensi.filter(a => a.status === 'Izin').length}</span>
              </div>
              <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-100/50">
                <span className="block text-[10px] text-rose-600 font-medium uppercase">Total Alfa</span>
                <span className="text-md font-bold text-rose-800">{filteredAbsensi.filter(a => a.status === 'Alfa').length}</span>
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
