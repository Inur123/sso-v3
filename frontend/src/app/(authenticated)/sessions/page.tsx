"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { SessionsSkeleton } from "./skeleton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SSOLog {
  id: string;
  token: string;
  createdAt: string;
  clientName: string;
}

export default function SessionsPage() {
  const [ssoLogs, setSsoLogs] = useState<SSOLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // State untuk melacak ID token mana yang sedang di-reveal (dilihat) kuncinya
  const [visibleTokenIds, setVisibleTokenIds] = useState<
    Record<string, boolean>
  >({});

  // State untuk dialog konfirmasi cabut akses kustom
  const [isRevoking, setIsRevoking] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedLogName, setSelectedLogName] = useState("");

  const router = useRouter();

  // Membaca session aktif dari Better Auth Client
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.email === "admin@gmail.com";

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fungsi memuat riwayat log masuk aplikasi SSO riil dari database Fastify API
  const fetchSSOLogs = useCallback(async () => {
    const token = session?.session?.token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/user/sso-logs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSsoLogs(data);
      } else {
        console.error("Gagal memuat log SSO.");
      }
    } catch (err) {
      console.error("Gagal mengambil log SSO:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [API_URL, session?.session?.token]);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/login");
      } else if (isAdmin) {
        router.push("/dashboard");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSSOLogs();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, session?.session?.token, isAdmin, router, fetchSSOLogs]);

  // Fungsi mencabut sesi aplikasi (revoke) di backend secara nyata
  const handleRevokeClient = async (id: string) => {
    const token = session?.session?.token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/user/sso-logs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success(`Akses sesi untuk aplikasi berhasil dicabut.`);
        // Refresh daftar log SSO
        fetchSSOLogs();
      } else {
        toast.error("Gagal mencabut akses sesi aplikasi.");
      }
    } catch (err) {
      console.error("Gagal memanggil API revoke:", err);
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  const confirmRevoke = (id: string, name: string) => {
    setSelectedLogId(id);
    setSelectedLogName(name);
    setIsRevoking(true);
  };

  // Fungsi toggle visibilitas sensor token (eye icon)
  const toggleTokenVisibility = (id: string) => {
    setVisibleTokenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isPending) {
    return <SessionsSkeleton />;
  }

  if (!session || isAdmin) return null;

  function handleRevoke(selectedLogId: string) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <span
          className="hover:text-slate-900 cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          Portal
        </span>
        <span>/</span>
        <span className="text-slate-900 font-medium">Riwayat Sesi SSO</span>
      </div>

      {/* Page Header (Luar Card) */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <History className="h-5.5 w-5.5 text-indigo-600" />
            <span>Riwayat Sesi SSO</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar aplikasi klien SSO yang sedang aktif diakses menggunakan akun
            Anda. Anda dapat mencabut otorisasi kapan saja.
          </p>
        </div>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardContent className="p-0">
          {!loadingLogs && ssoLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-2">
              <History className="h-8 w-8 text-slate-300" />
              <p className="font-semibold text-slate-600 mt-2">
                Belum ada aplikasi yang terhubung.
              </p>
              <p className="text-xs text-slate-400">
                Silakan login ke aplikasi client menggunakan SSO ini terlebih
                dahulu.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/50">
                    <TableHead className="font-bold text-slate-700 text-[10px] uppercase tracking-wider py-4 w-12 text-center">
                      No
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 text-[10px] uppercase tracking-wider py-4">
                      Nama Aplikasi
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 text-[10px] uppercase tracking-wider py-4">
                      Key / Token Otorisasi
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 text-[10px] uppercase tracking-wider py-4">
                      Waktu Login SSO
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 text-[10px] uppercase tracking-wider py-4">
                      Status Sesi
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700 text-[10px] uppercase tracking-wider py-4 pr-6">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLogs
                    ? // Baris loading skeleton (shimmer)
                      Array.from({ length: 3 }).map((_, idx) => (
                        <TableRow
                          key={idx}
                          className="border-b border-slate-100 animate-pulse"
                        >
                          <TableCell className="text-center py-4">
                            <div className="h-3.5 w-4 bg-slate-200 rounded mx-auto" />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-3.5 w-32 bg-slate-200 rounded" />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-7 w-48 bg-slate-200/60 rounded-md" />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-3.5 w-36 bg-slate-200 rounded" />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="h-6 w-20 bg-slate-200/50 rounded-full" />
                          </TableCell>
                          <TableCell className="text-right py-4 pr-6">
                            <div className="h-8 w-24 bg-slate-200/40 rounded-md ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    : ssoLogs.map((log, idx) => {
                        const isTokenVisible = !!visibleTokenIds[log.id];
                        const displayToken = isTokenVisible
                          ? log.token
                          : `${log.token.substring(0, 8)}...${log.token.substring(log.token.length - 8)}`;
                        return (
                          <TableRow
                            key={log.id}
                            className="border-b border-slate-100 hover:bg-slate-50/50"
                          >
                            <TableCell className="text-center font-medium text-slate-500 text-xs">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-900 text-xs">
                              {log.clientName}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-slate-600">
                              <div className="flex items-center space-x-2">
                                <code className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200/60 font-mono text-[11px]">
                                  {displayToken}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-slate-700 cursor-pointer"
                                  onClick={() => toggleTokenVisibility(log.id)}
                                  title={
                                    isTokenVisible
                                      ? "Sembunyikan Key"
                                      : "Tampilkan Key"
                                  }
                                >
                                  {isTokenVisible ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600 text-xs">
                              {new Date(log.createdAt).toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                                Terhubung
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer py-1 h-8 px-3 rounded-md"
                                onClick={() =>
                                  confirmRevoke(log.id, log.clientName)
                                }
                              >
                                Cabut Akses
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRevoking} onOpenChange={setIsRevoking}>
        <DialogContent
          showCloseButton={false}
          className="bg-white border border-slate-200 max-w-[400px] rounded-xl p-6 shadow-xl"
        >
          <DialogHeader className="flex flex-col items-center text-center sm:items-center sm:text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Cabut Akses Sesi Aplikasi?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed mt-2">
              Apakah Anda yakin ingin memutuskan sesi dan mencabut akses untuk
              aplikasi{" "}
              <strong className="text-slate-700">
                &quot;{selectedLogName}&quot;
              </strong>
              ? Anda harus masuk kembali ke aplikasi tersebut untuk menggunakan
              layanan SSO.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-2 mt-5">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full text-xs font-semibold h-9 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="w-full text-xs font-semibold h-9 rounded-md cursor-pointer"
              onClick={() => {
                if (selectedLogId) {
                  handleRevokeClient(selectedLogId);
                }
              }}
            >
              Ya, Cabut Akses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
