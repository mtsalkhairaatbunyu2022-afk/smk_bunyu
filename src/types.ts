/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Siswa {
  id: string;
  nomor: number;
  nama: string;
  kelas: string;
  jurusan: string;
}

export type AbsensiStatus = string;

export interface Absensi {
  id: string;
  nomor: number; // sequential order matching form
  tanggal: string;
  siswaId: string;
  namaSiswa: string;
  kelas: string;
  jurusan: string;
  status: AbsensiStatus;
  keterangan: string;
}

export interface BimbinganKonseling {
  id: string;
  nomor: number; // sequential order matching form
  tanggal: string;
  siswaId: string;
  namaSiswa: string;
  kelas: string;
  jurusan: string;
  jenisLayanan: string;
  masalah: string;
  solusi: string;
  tindakLanjut: string;
  statusKasus: string;
}

export interface JurnalMengajar {
  id: string;
  nomor: number; // sequential order matching form
  tanggal: string;
  kelas: string;
  jurusan: string;
  mataPelajaran: string;
  materiPokok: string;
  guruNama: string;
  kehadiranRingkasan: string; // e.g. "Hadir: 28, Sakit: 1, Izin: 1, Alfa: 0"
  catatanKelas: string;
}

export interface PenilaianHarian {
  id: string;
  nomor: number; // sequential order matching form
  tanggal: string;
  siswaId: string;
  namaSiswa: string;
  kelas: string;
  jurusan: string;
  namaPenilaian: string; // e.g., Tugas 1, UH 1, UTS
  nilai: number;
  keterangan: string;
}
