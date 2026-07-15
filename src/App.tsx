/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  HeartHandshake, 
  BookOpen, 
  GraduationCap, 
  Wifi, 
  WifiOff, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

// Data types
import { Siswa, Absensi, BimbinganKonseling, JurnalMengajar, PenilaianHarian } from './types';

// Prepopulated sample values
import { 
  SAMPLE_SISWA, 
  SAMPLE_ABSENSI, 
  SAMPLE_BK, 
  SAMPLE_JURNAL, 
  SAMPLE_PENILAIAN 
} from './utils/sampleData';

// Subcomponents
import StudentManager from './components/StudentManager';
import AttendanceManager from './components/AttendanceManager';
import CounselingManager from './components/CounselingManager';
import JournalManager from './components/JournalManager';
import GradeManager from './components/GradeManager';

export default function App() {
  // Navigation Menu state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'siswa' | 'absensi' | 'bk' | 'jurnal' | 'nilai'>('dashboard');

  // Core databases synced to LocalStorage
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    const local = localStorage.getItem('bk_la_smkn1_siswa');
    return local ? JSON.parse(local) : SAMPLE_SISWA;
  });

  const [absensiList, setAbsensiList] = useState<Absensi[]>(() => {
    const local = localStorage.getItem('bk_la_smkn1_absensi');
    return local ? JSON.parse(local) : SAMPLE_ABSENSI;
  });

  const [bkList, setBkList] = useState<BimbinganKonseling[]>(() => {
    const local = localStorage.getItem('bk_la_smkn1_bk');
    return local ? JSON.parse(local) : SAMPLE_BK;
  });

  const [jurnalList, setJurnalList] = useState<JurnalMengajar[]>(() => {
    const local = localStorage.getItem('bk_la_smkn1_jurnal');
    return local ? JSON.parse(local) : SAMPLE_JURNAL;
  });

  const [nilaiList, setNilaiList] = useState<PenilaianHarian[]>(() => {
    const local = localStorage.getItem('bk_la_smkn1_nilai');
    return local ? JSON.parse(local) : SAMPLE_PENILAIAN;
  });

  // Offline / Online Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Real-time local time tracking
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  // Save changes to LocalStorage instantly
  useEffect(() => {
    localStorage.setItem('bk_la_smkn1_siswa', JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem('bk_la_smkn1_absensi', JSON.stringify(absensiList));
  }, [absensiList]);

  useEffect(() => {
    localStorage.setItem('bk_la_smkn1_bk', JSON.stringify(bkList));
  }, [bkList]);

  useEffect(() => {
    localStorage.setItem('bk_la_smkn1_jurnal', JSON.stringify(jurnalList));
  }, [jurnalList]);

  useEffect(() => {
    localStorage.setItem('bk_la_smkn1_nilai', JSON.stringify(nilaiList));
  }, [nilaiList]);

  // General counts for dashboard
  const activeStudentsCount = siswaList.length;
  const todayAbsencesCount = absensiList.filter(
    a => a.tanggal === new Date().toISOString().split('T')[0] && a.status !== 'Hadir'
  ).length;
  const activeCasesCount = bkList.filter(bk => bk.statusKasus !== 'Selesai').length;
  const totalJournalsCount = jurnalList.length;
  
  const gradeScores = nilaiList.map(n => n.nilai);
  const averageGrade = gradeScores.length > 0 
    ? (gradeScores.reduce((a, b) => a + b, 0) / gradeScores.length).toFixed(1)
    : '0';

  // Format Current Date
  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Dynamic Top Banner for Online/Offline feedback */}
      <div className={`text-center py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
        isOnline 
          ? 'bg-blue-600 text-blue-50' 
          : 'bg-amber-600 text-amber-50'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>Portal Berjalan dalam Mode Online (Sinkronisasi Cloudflare Pages Aktif)</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 animate-bounce" />
            <span>Mode Offline Aktif (Semua perubahan data disimpan aman di penyimpanan lokal Anda)</span>
          </>
        )}
      </div>

      {/* Main Header Brand */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3.5">
            <img 
              src="/logo_konselor.png" 
              alt="Logo SMKN 1 Bunyu" 
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">BK LA SMKN 1 BUNYU</h1>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-sm">PWA READY</span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                SMK Negeri 1 Bunyu • Bimbingan Konseling & Jurnal Akademik
              </p>
            </div>
          </div>

          {/* Time & Calendar Board */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-xl text-xs text-slate-600 shadow-2xs font-medium">
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-900">{formattedTime}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200/50 sticky top-[73px] sm:top-[68px] z-20 shadow-2xs overflow-x-auto select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
          {[
            { id: 'dashboard', label: 'Dashboard Utama', icon: Layers },
            { id: 'siswa', label: 'Data Siswa', icon: Users },
            { id: 'absensi', label: 'Absensi Siswa', icon: UserCheck },
            { id: 'bk', label: 'Bimbingan Konseling', icon: HeartHandshake },
            { id: 'jurnal', label: 'Jurnal Mengajar', icon: BookOpen },
            { id: 'nilai', label: 'Penilaian Harian', icon: GraduationCap }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 sm:px-5 border-b-2 text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
                       {/* TAB: DASHBOARD UTAMA */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* School Welcome Hero Card */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 border border-blue-950/40 relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="relative z-10 space-y-4 max-w-2xl flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Selamat Datang di Sistem Portal SMKN 1 Bunyu
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Sistem Informasi Pelayanan Konseling & Administrasi Guru
                    </h2>
                    <p className="text-sm text-blue-100/90 leading-relaxed font-light">
                      BK LA SMKN 1 BUNYU adalah aplikasi terpadu untuk mendata rekapitulasi siswa, mengelola catatan absensi harian kelas, merekam sesi bimbingan konseling siswa, mengisi jurnal mengajar guru, hingga melakukan penginputan skor penilaian harian secara offline maupun online.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => setActiveTab('siswa')}
                        className="px-4 py-2 text-xs font-semibold text-blue-900 bg-white hover:bg-blue-50 active:scale-95 rounded-xl transition flex items-center gap-1.5"
                      >
                        Impor Data Siswa
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveTab('bk')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-700/60 hover:bg-blue-700 border border-blue-600/50 rounded-xl transition flex items-center gap-1.5"
                      >
                        Konseling Siswa
                      </button>
                    </div>
                  </div>
                  
                  {/* Circular Frame Logo */}
                  <div className="relative shrink-0 flex items-center justify-center z-10">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white/20 bg-white/5 backdrop-blur-xs p-2 shadow-xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center overflow-hidden">
                        <img 
                          src="/logo_konselor.png" 
                          alt="Logo Sekolah" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: DATA SISWA */}
            {activeTab === 'siswa' && (
              <StudentManager 
                siswaList={siswaList} 
                setSiswaList={setSiswaList} 
              />
            )}

            {/* TAB: ABSENSI */}
            {activeTab === 'absensi' && (
              <AttendanceManager 
                siswaList={siswaList}
                absensiList={absensiList}
                setAbsensiList={setAbsensiList}
              />
            )}

            {/* TAB: BIMBINGAN KONSELING */}
            {activeTab === 'bk' && (
              <CounselingManager 
                siswaList={siswaList}
                bkList={bkList}
                setBkList={setBkList}
              />
            )}

            {/* TAB: JURNAL MENGAJAR */}
            {activeTab === 'jurnal' && (
              <JournalManager 
                siswaList={siswaList}
                absensiList={absensiList}
                jurnalList={jurnalList}
                setJurnalList={setJurnalList}
              />
            )}

            {/* TAB: PENILAIAN HARIAN */}
            {activeTab === 'nilai' && (
              <GradeManager 
                siswaList={siswaList}
                nilaiList={nilaiList}
                setNilaiList={setNilaiList}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-950 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-200">SISTEM INTEGRASI BK LA SMKN 1 BUNYU v1.0.0</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Dikembangkan khusus untuk SMK Negeri 1 Bunyu. Kecepatan, presisi, offline-first.</p>
          </div>
          <div className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} SMKN 1 Bunyu. Semua hak dilindungi undang-undang.
          </div>
        </div>
      </footer>

    </div>
  );
}

