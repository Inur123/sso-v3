"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShieldCheck, History, ArrowRight, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "./skeleton";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Membaca session aktif dari Better Auth Client
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.email === "admin@gmail.com";

  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const ADMIN_TOKEN = "admin-super-secret-token"; // Token khusus API admin

  const fetchUserCount = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/count`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTotalUsers(data.count);
      }
    } catch (err) {
      console.error("Gagal mengambil jumlah total user:", err);
    }
  }, [API_URL, ADMIN_TOKEN, isAdmin]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session) {
      if (isAdmin) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUserCount();
      }
    }
  }, [session, isPending, isAdmin, fetchUserCount, router]);

  // Efek untuk memunculkan notifikasi welcome toast
  useEffect(() => {
    if (!isPending && session) {
      const loginParam = searchParams.get("login");
      if (loginParam === "true") {
        const welcomeRole = isAdmin ? "Administrator" : "Pengguna Portal";
        toast.success(
          `Selamat datang kembali, ${session.user.name}! Anda masuk sebagai ${welcomeRole}.`,
        );
        router.replace("/dashboard"); // Bersihkan query params
      }
    }
  }, [session, isPending, isAdmin, searchParams, router]);

  if (isPending) {
    return <DashboardSkeleton />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Halo, {session.user.name}! <span className="hidden md:inline-block ml-1">👋</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
            Selamat datang di beranda utama Portal Layanan Single Sign-On (SSO).
            Dari sini, Anda dapat mengelola detail profil diri serta memonitor
            riwayat seluruh perangkat yang terhubung ke sesi Anda.
          </p>
        </div>
        <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg shrink-0">
          {session.user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Kelola Profil */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
              <User className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-sm font-semibold">
                Profil Saya
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Nama Lengkap
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {session.user.name}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Terdaftar
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {session.user.email}
                </p>
              </div>
            </CardContent>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
            <Button
              variant="ghost"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer flex items-center p-0 hover:bg-transparent"
              onClick={() => router.push("/profile")}
            >
              Buka Detail Profil <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Card 2: Keamanan Sesi / Total Pengguna (Disesuaikan berdasarkan Peranan) */}
        {isAdmin ? (
          // KARTU KHUSUS ADMIN: TOTAL USER
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
                <Users className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-sm font-semibold">
                  Total Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pengguna Terdaftar
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {totalUsers !== null
                      ? `${totalUsers} Akun Pengguna`
                      : "Memuat..."}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status Portal SSO
                  </span>
                  <div className="flex items-center text-sm text-green-700 font-semibold mt-0.5">
                    <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />{" "}
                    Aktif & Normal
                  </div>
                </div>
              </CardContent>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <Button
                variant="ghost"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer flex items-center p-0 hover:bg-transparent"
                onClick={() => router.push("/clients")}
              >
                Kelola Aplikasi <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        ) : (
          // KARTU KHUSUS USER BIASA: RIWAYAT SESI
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
                <History className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-sm font-semibold">
                  Riwayat Sesi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Keamanan Akun
                  </span>
                  <div className="flex items-center text-sm text-green-700 font-semibold mt-0.5">
                    <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />{" "}
                    Aktif & Aman
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Aktivitas Terakhir
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    Fastify API Server (Connected)
                  </p>
                </div>
              </CardContent>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <Button
                variant="ghost"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer flex items-center p-0 hover:bg-transparent"
                onClick={() => router.push("/sessions")}
              >
                Mulai Monitor Sesi <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
