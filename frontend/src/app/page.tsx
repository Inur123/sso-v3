import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Globe,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ornamen Latar Belakang (Glow Effects) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

      {/* Header Navigasi (Fixed Top) */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sso_logo.png"
              alt="SSO Logo"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight">
                Portal SSO
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Identity Provider
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Dokumentasi</span>
            </a>
            <Link
              href="/login"
              className="h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Masuk Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section (Dengan offset padding atas pt-28 untuk fixed navbar) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-20 flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-indigo-950/60 border border-indigo-800/50 rounded-full px-4 py-1.5 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
            Sistem Otentikasi Terpusat v3
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] sm:leading-[1.1] max-w-4xl mb-6">
          Satu Kredensial, <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Akses Seluruh Layanan Tanpa Batas
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Masuk sekali untuk mengakses semua aplikasi internal dan eksternal
          yang diizinkan secara aman, instan, dan terpantau dalam satu dashboard
          terintegrasi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center sm:w-auto mb-16">
          <Link
            href="/login"
            className="h-12 w-full sm:w-48 flex items-center justify-center bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold rounded-lg transition-all cursor-pointer shadow-xl"
          >
            Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 w-full sm:w-48 flex items-center justify-center bg-slate-800 hover:bg-slate-700/80 text-white text-sm font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
          >
            Lihat Integrasi Docs
          </a>
        </div>

        {/* Fitur Utama Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left pt-8 border-t border-slate-800">
          {/* Fitur 1 */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">
                Otentikasi Aman
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Menerapkan standar industri OAuth2 dan OpenID Connect (OIDC)
                untuk melindungi sesi masuk dan data profil Anda secara
                kriptografis.
              </p>
            </div>
          </div>

          {/* Fitur 2 */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">
                Manajemen Kredensial
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kemudahan mengelola kata sandi, memperbarui data profil akun,
                serta memantau integrasi langsung dari satu antarmuka portal
                mandiri.
              </p>
            </div>
          </div>

          {/* Fitur 3 */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">
                Kontrol Sesi Terpusat
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor seluruh riwayat aktivitas sesi perangkat yang terhubung
                secara real-time dan cabut akses mencurigakan kapan pun
                diperlukan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-6 px-6 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 Zainur Portal SSO. All rights reserved.</p>
      </footer>
    </div>
  );
}
