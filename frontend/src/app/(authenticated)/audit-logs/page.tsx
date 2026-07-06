"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Eye } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { AuditLogsSkeleton } from "./skeleton";

interface AuditLog {
  id: string;
  action: string;
  clientIp: string | null;
  userAgent: string | null;
  createdAt: string;
  metadata: string | null;
  userEmail: string | null;
  userName: string | null;
}

// Pindahkan konstanta ke tingkat modul luar agar dependensi useCallback stabil
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const ADMIN_TOKEN = "admin-super-secret-token";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Log audit lebih bagus tampil 10 per halaman

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const isAdmin = session?.user?.email === "admin@gmail.com";

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const fetchLogs = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/audit-logs`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
        setError(null);
      } else {
        setError("Gagal memuat log audit dari server.");
      }
    } catch {
      setError("Gagal terhubung ke backend API.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session) {
      if (!isAdmin) {
        router.push("/dashboard");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLogs();
      }
    }
  }, [session, isPending, isAdmin, fetchLogs, router]);

  // Helper untuk mewarnai badge Aksi Log agar lebih informatif (mengembalikan JSX Span)
  const getActionBadge = (action: string) => {
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border";
    switch (action) {
      case "client.created":
        return (
          <span
            className={`${baseClass} bg-green-50 text-green-700 border-green-200`}
          >
            {action}
          </span>
        );
      case "client.deleted":
        return (
          <span
            className={`${baseClass} bg-red-50 text-red-700 border-red-200`}
          >
            {action}
          </span>
        );
      case "user.signup":
        return (
          <span
            className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}
          >
            {action}
          </span>
        );
      case "user.login":
        return (
          <span
            className={`${baseClass} bg-indigo-50 text-indigo-700 border-indigo-200`}
          >
            {action}
          </span>
        );
      case "user.logout":
        return (
          <span
            className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}
          >
            {action}
          </span>
        );
      case "system.init":
        return (
          <span
            className={`${baseClass} bg-purple-50 text-purple-700 border-purple-200`}
          >
            {action}
          </span>
        );
      default:
        return (
          <span
            className={`${baseClass} bg-slate-50 text-slate-700 border-slate-200`}
          >
            {action}
          </span>
        );
    }
  };

  if (isPending || loading) {
    return <AuditLogsSkeleton />;
  }

  if (!isAdmin) {
    return null; // Pengguna akan diredirect oleh useEffect
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-slate-50/40 min-h-screen">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <ClipboardList className="h-5.5 w-5.5 text-indigo-600" />
            <span>Log Audit Aktivitas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau seluruh aktivitas otentikasi pengguna dan manipulasi data
            klien SSO secara real-time.
          </p>
        </div>
      </div>

      {error ? (
        <Card className="border border-red-200 bg-red-50/50 p-6 rounded-xl">
          <div className="text-center text-xs text-red-600 font-medium">
            {error}
          </div>
        </Card>
      ) : (
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Histori Aktivitas Sistem & User
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <div className="text-center text-slate-500 py-12 text-xs">
                Belum ada aktivitas yang tercatat.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 bg-slate-50/70">
                        <TableHead className="w-16 text-center font-bold text-slate-500">
                          No
                        </TableHead>
                        <TableHead className="w-44 font-bold text-slate-500">
                          Waktu
                        </TableHead>
                        <TableHead className="w-36 font-bold text-slate-500">
                          Aksi
                        </TableHead>
                        <TableHead className="font-bold text-slate-500">
                          User / Pelaku
                        </TableHead>
                        <TableHead className="w-24 text-center font-bold text-slate-500">
                          Detail
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((log, index) => {
                        const actualIndex =
                          (currentPage - 1) * itemsPerPage + index + 1;
                        const localTime = new Date(
                          log.createdAt,
                        ).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        });
                        const actor = log.userEmail
                          ? `${log.userName || "User"} (${log.userEmail})`
                          : "Sistem / Admin API";

                        return (
                          <TableRow
                            key={log.id}
                            className="border-b border-slate-100 hover:bg-slate-50/50 text-xs"
                          >
                            <TableCell className="text-center font-medium text-slate-500">
                              {actualIndex}
                            </TableCell>
                            <TableCell className="text-slate-500 font-medium whitespace-nowrap">
                              {localTime}
                            </TableCell>
                            <TableCell>{getActionBadge(log.action)}</TableCell>
                            <TableCell className="font-semibold text-slate-900">
                              {actor}
                            </TableCell>
                            <TableCell className="text-center">
                              <Link
                                href={`/audit-logs/${log.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                                title="Lihat Detail Log Audit"
                              >
                                <Eye className="h-4.5 w-4.5" />
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Panel Kontrol Pagination Bawaan Shadcn UI */}
                {logs.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-bold text-slate-700">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      sampai{" "}
                      <span className="font-bold text-slate-700">
                        {Math.min(currentPage * itemsPerPage, logs.length)}
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold text-slate-700">
                        {logs.length}
                      </span>{" "}
                      log aktivitas
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="h-8 text-xs cursor-pointer px-2.5"
                      >
                        Sebelumnya
                      </Button>
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <Button
                          key={idx}
                          variant={
                            currentPage === idx + 1 ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`h-8 w-8 text-xs cursor-pointer`}
                        >
                          {idx + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="h-8 text-xs cursor-pointer px-2.5"
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
