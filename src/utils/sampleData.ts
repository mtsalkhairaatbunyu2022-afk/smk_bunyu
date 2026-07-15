/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Siswa, Absensi, BimbinganKonseling, JurnalMengajar, PenilaianHarian } from '../types';

export const SAMPLE_SISWA: Siswa[] = [
  { id: 'siswa-1', nomor: 1, nama: 'Andi Pratama', kelas: 'X RPL', jurusan: 'Rekayasa Perangkat Lunak' },
  { id: 'siswa-2', nomor: 2, nama: 'Bella Syahputri', kelas: 'X RPL', jurusan: 'Rekayasa Perangkat Lunak' },
  { id: 'siswa-3', nomor: 3, nama: 'Candra Wijaya', kelas: 'X TKJ', jurusan: 'Teknik Komputer & Jaringan' },
  { id: 'siswa-4', nomor: 4, nama: 'Dina Mariana', kelas: 'X AKL', jurusan: 'Akuntansi & Keuangan Lembaga' },
  { id: 'siswa-5', nomor: 5, nama: 'Eko Sulistyo', kelas: 'XI RPL', jurusan: 'Rekayasa Perangkat Lunak' },
  { id: 'siswa-6', nomor: 6, nama: 'Fitri Handayani', kelas: 'XI TKJ', jurusan: 'Teknik Komputer & Jaringan' },
  { id: 'siswa-7', nomor: 7, nama: 'Guntur Saputra', kelas: 'XI AKL', jurusan: 'Akuntansi & Keuangan Lembaga' },
  { id: 'siswa-8', nomor: 8, nama: 'Hendra Setiawan', kelas: 'XII RPL', jurusan: 'Rekayasa Perangkat Lunak' },
  { id: 'siswa-9', nomor: 9, nama: 'Indah Lestari', kelas: 'XII TKJ', jurusan: 'Teknik Komputer & Jaringan' },
  { id: 'siswa-10', nomor: 10, nama: 'Joko Susilo', kelas: 'XII AKL', jurusan: 'Akuntansi & Keuangan Lembaga' },
  { id: 'siswa-11', nomor: 11, nama: 'Kiki Amelia', kelas: 'X RPL', jurusan: 'Rekayasa Perangkat Lunak' },
  { id: 'siswa-12', nomor: 12, nama: 'Lukman Hakim', kelas: 'XI TKJ', jurusan: 'Teknik Komputer & Jaringan' },
  { id: 'siswa-13', nomor: 13, nama: 'Mega Utami', kelas: 'XII RPL', jurusan: 'Rekayasa Perangkat Lunak' },
  { id: 'siswa-14', nomor: 14, nama: 'Novan Saputra', kelas: 'X TKJ', jurusan: 'Teknik Komputer & Jaringan' },
];

export const SAMPLE_ABSENSI: Absensi[] = [
  {
    id: 'abs-1',
    nomor: 1,
    tanggal: '2026-07-13',
    siswaId: 'siswa-1',
    namaSiswa: 'Andi Pratama',
    kelas: 'X RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    status: 'Hadir',
    keterangan: 'Tepat waktu'
  },
  {
    id: 'abs-2',
    nomor: 2,
    tanggal: '2026-07-13',
    siswaId: 'siswa-2',
    namaSiswa: 'Bella Syahputri',
    kelas: 'X RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    status: 'Sakit',
    keterangan: 'Surat dokter terlampir'
  },
  {
    id: 'abs-3',
    nomor: 3,
    tanggal: '2026-07-13',
    siswaId: 'siswa-3',
    namaSiswa: 'Candra Wijaya',
    kelas: 'X TKJ',
    jurusan: 'Teknik Komputer & Jaringan',
    status: 'Izin',
    keterangan: 'Acara keluarga di luar pulau'
  },
  {
    id: 'abs-4',
    nomor: 4,
    tanggal: '2026-07-14',
    siswaId: 'siswa-5',
    namaSiswa: 'Eko Sulistyo',
    kelas: 'XI RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    status: 'Alfa',
    keterangan: 'Tanpa keterangan'
  }
];

export const SAMPLE_BK: BimbinganKonseling[] = [
  {
    id: 'bk-1',
    nomor: 1,
    tanggal: '2026-07-13',
    siswaId: 'siswa-1',
    namaSiswa: 'Andi Pratama',
    kelas: 'X RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    jenisLayanan: 'Belajar',
    masalah: 'Kurang konsentrasi saat pembelajaran teori pemrograman dasar.',
    solusi: 'Diberikan tips belajar pemrograman praktis serta disarankan untuk istirahat cukup.',
    tindakLanjut: 'Akan dievaluasi hasil kuis pemrograman minggu depan.',
    statusKasus: 'Selesai'
  },
  {
    id: 'bk-2',
    nomor: 2,
    tanggal: '2026-07-14',
    siswaId: 'siswa-5',
    namaSiswa: 'Eko Sulistyo',
    kelas: 'XI RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    jenisLayanan: 'Pribadi',
    masalah: 'Sering terlambat masuk sekolah dikarenakan begadang bermain game online.',
    solusi: 'Konseling individual, membuat jadwal rutinitas harian, dan pembatasan screen time.',
    tindakLanjut: 'Memanggil orang tua jika keterlambatan berlanjut dalam 3 hari ke depan.',
    statusKasus: 'Dalam Proses'
  }
];

export const SAMPLE_JURNAL: JurnalMengajar[] = [
  {
    id: 'jurnal-1',
    nomor: 1,
    tanggal: '2026-07-13',
    kelas: 'X RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    mataPelajaran: 'Pemrograman Dasar',
    materiPokok: 'Pengenalan Tipe Data dan Algoritma Percabangan',
    guruNama: 'Supriyadi, S.Kom.',
    kehadiranRingkasan: 'Hadir: 3, Sakit: 1, Izin: 0, Alfa: 0',
    catatanKelas: 'Siswa sangat aktif bertanya tentang operator ternary.'
  },
  {
    id: 'jurnal-2',
    nomor: 2,
    tanggal: '2026-07-14',
    kelas: 'XI TKJ',
    jurusan: 'Teknik Komputer & Jaringan',
    mataPelajaran: 'Administrasi Infrastruktur Jaringan',
    materiPokok: 'Konfigurasi VLAN dan Routing Dinamis',
    guruNama: 'Aris Munandar, M.T.',
    kehadiranRingkasan: 'Hadir: 2, Sakit: 0, Izin: 0, Alfa: 0',
    catatanKelas: 'Praktikum berjalan lancar meskipun 1 router bermasalah.'
  }
];

export const SAMPLE_PENILAIAN: PenilaianHarian[] = [
  {
    id: 'ph-1',
    nomor: 1,
    tanggal: '2026-07-13',
    siswaId: 'siswa-1',
    namaSiswa: 'Andi Pratama',
    kelas: 'X RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    namaPenilaian: 'Ulangan Harian 1 (Algoritma)',
    nilai: 85,
    keterangan: 'Sangat baik, menguasai algoritma flowchart'
  },
  {
    id: 'ph-2',
    nomor: 2,
    tanggal: '2026-07-13',
    siswaId: 'siswa-2',
    namaSiswa: 'Bella Syahputri',
    kelas: 'X RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    namaPenilaian: 'Ulangan Harian 1 (Algoritma)',
    nilai: 72,
    keterangan: 'Cukup, perlu latihan untuk kondisi bersarang'
  },
  {
    id: 'ph-3',
    nomor: 3,
    tanggal: '2026-07-14',
    siswaId: 'siswa-5',
    namaSiswa: 'Eko Sulistyo',
    kelas: 'XI RPL',
    jurusan: 'Rekayasa Perangkat Lunak',
    namaPenilaian: 'Tugas Mandiri 1 (Database SQL)',
    nilai: 92,
    keterangan: 'Luar biasa, pengerjaan join table sempurna'
  }
];
