/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  User,
  Power,
  Trash2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserDetailSkeleton } from "./skeleton";
import Link from "next/link";
import { toast } from "sonner";

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  role: string;
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const ADMIN_TOKEN = "admin-super-secret-token";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<RegisteredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State aksi
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const isAdmin =
    session?.user && (session.user as { role?: string }).role === "admin";

  const fetchUserDetail = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      if (response.ok) {
        setUser(await response.json());
      } else {
        setError("Data detail pengguna tidak ditemukan.");
      }
    } catch {
      setError("Gagal terhubung ke backend API.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session) {
      if (!isAdmin) router.push("/dashboard");
      else fetchUserDetail();
    }
  }, [session, isPending, isAdmin, fetchUserDetail, router]);

  // Toggle status Aktif/Nonaktif
  const handleToggleStatus = async () => {
    if (!user) return;
    setTogglingStatus(true);
    const newStatus = !user.isActive;
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
          body: JSON.stringify({ isActive: newStatus }),
        },
      );
      if (response.ok) {
        setUser((prev) => (prev ? { ...prev, isActive: newStatus } : prev));
        toast.success(
          `Akun berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
        );
      } else {
        toast.error("Gagal memperbarui status akun.");
      }
    } catch {
      toast.error("Gagal menghubungi server backend.");
    } finally {
      setTogglingStatus(false);
    }
  };

  // Hapus pengguna
  const handleDeleteUser = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      if (response.ok) {
        toast.success("Pengguna berhasil dihapus secara permanen.");
        router.push("/users");
      } else {
        toast.error("Gagal menghapus pengguna.");
        setShowDeleteDialog(false);
      }
    } catch {
      toast.error("Gagal menghubungi server backend.");
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  if (isPending || loading) return <UserDetailSkeleton />;

  if (!isAdmin || error || !user) {
    return (
      <div className="flex-1 p-6">
        <Card className="border border-red-200 bg-red-50/50 p-6 rounded-xl">
          <div className="text-center text-xs text-red-600 font-medium mb-4">
            {error || "Akses ditolak atau data tidak ditemukan."}
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/users")}
              className="h-8 text-xs cursor-pointer"
            >
              Kembali ke Daftar Pengguna
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const localTime = new Date(user.createdAt).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-slate-50/40 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1 text-[11px] font-medium text-slate-400">
        <Link
          href="/dashboard"
          className="hover:text-indigo-600 transition-colors"
        >
          Portal
        </Link>
        <span>/</span>
        <Link href="/users" className="hover:text-indigo-600 transition-colors">
          Pengguna Terdaftar
        </Link>
        <span>/</span>
        <span className="text-slate-600">Detail Profil</span>
      </div>

      <div className="flex items-center justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <User className="h-5.5 w-5.5 text-indigo-600" />
            <span>Detail Pengguna</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 hidden sm:block">
            Melihat informasi profil dan status akun dari pengguna SSO terpilih.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/users")}
          className="h-9 text-xs font-semibold cursor-pointer flex items-center space-x-1.5 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Button>
      </div>

      {/* Main Detail Card — full width */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        {/* Card Header: Avatar + Nama + Email */}
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-lg border border-indigo-100 shrink-0">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-base font-bold text-slate-900 truncate">
                {user.name}
              </CardTitle>
              <span className="text-xs text-slate-400 mt-0.5 truncate">
                {user.email}
              </span>
            </div>
          </div>
 
          {/* Tombol Aksi */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Toggle Status */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              className={`h-9 text-xs font-semibold cursor-pointer flex-1 sm:flex-initial flex items-center justify-center gap-1.5 transition-colors ${
                user.isActive
                  ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {togglingStatus ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )}
              {user.isActive ? "Nonaktifkan" : "Aktifkan"}
            </Button>
 
            {/* Hapus */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-9 text-xs font-semibold cursor-pointer flex-1 sm:flex-initial flex items-center justify-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 divide-y divide-slate-100">
          {/* Row 1: ID & Peran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 first:pt-0">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                User ID (Sistem)
              </span>
              <p className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 border border-slate-100 rounded-md select-all w-fit">
                {user.id}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Peran Pengguna (Role)
              </span>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Status Akun & Terdaftar Sejak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Status Keaktifan Akun
              </span>
              <div>
                {user.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Nonaktif
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Terdaftar Sejak
              </span>
              <p className="text-xs font-medium text-slate-700">{localTime}</p>
            </div>
          </div>

          {/* Row 3: Status Verifikasi Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 last:pb-0">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Status Verifikasi Email
              </span>
              <div>
                {user.emailVerified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                    Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                    Belum Terverifikasi
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[400px] rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
          <AlertDialogHeader className="flex flex-col items-center text-center sm:items-center sm:text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-sm font-bold text-slate-900">
              Hapus Pengguna Secara Permanen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed mt-2">
              Tindakan ini bersifat destruktif dan tidak dapat dibatalkan.
              Seluruh data pengguna{" "}
              <strong className="text-slate-700">{user.name}</strong> akan
              dihapus permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-2 mt-5">
            <AlertDialogCancel className="w-full text-xs font-semibold h-9 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              disabled={deleting}
              variant="destructive"
              className="w-full text-xs font-semibold h-9 rounded-md cursor-pointer disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Hapus Akun"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
