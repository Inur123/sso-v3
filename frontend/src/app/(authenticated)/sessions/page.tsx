"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Loader2, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { SessionsSkeleton } from "./skeleton";

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

  const router = useRouter();

  // Membaca session aktif dari Better Auth Client
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.email === "admin@gmail.com";

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fungsi memuat riwayat log masuk aplikasi SSO riil dari database Fastify API
  const fetchSSOLogs = useCallback(async () => {
    if (!session?.session?.token) return;
    setLoadingLogs(true);
    try {
      const response = await fetch(`${API_URL}/api/user/sso-logs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session.token}`,
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
  }, [API_URL, session]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session) {
      if (isAdmin) {
        router.push("/dashboard");
      } else {
        const timer = setTimeout(() => {
          fetchSSOLogs();
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [session, isPending, isAdmin, fetchSSOLogs, router]);

  // Fungsi mencabut sesi aplikasi (revoke) di backend secara nyata
  const handleRevokeClient = async (id: string) => {
    if (
      !confirm("Apakah Anda yakin ingin memutuskan (cabut akses) aplikasi ini?")
    )
      return;
    if (!session?.session?.token) return;

    try {
      const response = await fetch(`${API_URL}/api/user/sso-logs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.session.token}`,
        },
      });
      if (response.ok) {
        // Refresh daftar log SSO
        fetchSSOLogs();
      } else {
        alert("Gagal mencabut akses aplikasi.");
      }
    } catch (err) {
      console.error("Gagal memanggil API revoke:", err);
    }
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

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
          <History className="h-5 w-5 text-indigo-600" />
          <div>
            <CardTitle className="text-sm font-semibold">
              Aplikasi Terhubung & Sesi SSO Aktif
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Daftar aplikasi klien SSO yang sedang aktif diakses menggunakan
              akun Anda. Anda dapat mencabut otorisasi kapan saja.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingLogs ? (
            <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              <p>Memuat data sesi dari database...</p>
            </div>
          ) : ssoLogs.length === 0 ? (
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
                    <TableHead className="font-semibold text-slate-700 text-xs">
                      Nama Aplikasi
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">
                      Key / Token Otorisasi
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">
                      Waktu Login SSO
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">
                      Status Sesi
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ssoLogs.map((log) => {
                    const isTokenVisible = !!visibleTokenIds[log.id];
                    const displayToken = isTokenVisible
                      ? log.token
                      : `${log.token.substring(0, 8)}...${log.token.substring(log.token.length - 8)}`;
                    return (
                      <TableRow
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50"
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {log.clientName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          <div className="flex items-center space-x-2">
                            <code className="bg-slate-50 px-2 py-1 rounded border border-slate-200/60">
                              {displayToken}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
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
                        <TableCell className="text-slate-600">
                          {new Date(log.createdAt).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 animate-pulse">
                            Terhubung
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer py-1 h-7"
                            onClick={() => handleRevokeClient(log.id)}
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
    </div>
  );
}
