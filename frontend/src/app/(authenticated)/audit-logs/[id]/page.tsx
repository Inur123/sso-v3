"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ClipboardList } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuditLogDetailSkeleton } from "./skeleton";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const ADMIN_TOKEN = "admin-super-secret-token";

export default function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.email === "admin@gmail.com";

  const fetchLogDetail = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/audit-logs/${id}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLog(data);
      } else {
        setError("Detail log audit tidak ditemukan.");
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
      if (!isAdmin) {
        router.push("/dashboard");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLogDetail();
      }
    }
  }, [session, isPending, isAdmin, fetchLogDetail, router]);

  // Helper untuk mewarnai badge Aksi Log agar lebih informatif
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
    return <AuditLogDetailSkeleton />;
  }

  if (!isAdmin || error || !log) {
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
              onClick={() => router.push("/audit-logs")}
              className="h-8 text-xs cursor-pointer"
            >
              Kembali ke Log Audit
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const localTime = new Date(log.createdAt).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "medium",
  });

  const emailMatch = log.metadata?.match(/\(([^)]+@[^)]+)\)/);
  const actor = log.userEmail
    ? `${log.userName || "User"} (${log.userEmail})`
    : emailMatch
      ? emailMatch[1]
      : "Sistem / Admin API";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-slate-50/40 min-h-screen">
      {/* Breadcrumbs / Back navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <span
          className="hover:text-slate-900 cursor-pointer"
          onClick={() => router.push("/audit-logs")}
        >
          Log Audit
        </span>
        <span>/</span>
        <span className="text-slate-900 font-medium">Detail Log</span>
      </div>

      <div className="flex items-center justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <ClipboardList className="h-5.5 w-5.5 text-indigo-600" />
            <span>Detail Aktivitas Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 hidden sm:block">
            Rincian data aktivitas sistem dan pengguna berdasar ID: {log.id}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/audit-logs")}
          className="h-9 text-xs font-semibold cursor-pointer flex items-center space-x-1.5 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Button>
      </div>

      {/* Main Details Card */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <CardTitle className="text-sm font-semibold text-slate-800">
            Rincian Informasi Log Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-slate-100">
          {/* Row 1: Waktu & Aksi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 first:pt-0">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Waktu Kejadian
              </span>
              <p className="text-sm font-medium text-slate-900">{localTime}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Jenis Tindakan
              </span>
              <div>{getActionBadge(log.action)}</div>
            </div>
          </div>

          {/* Row 2: Pelaku & IP Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Pelaku / Aktor
              </span>
              <p className="text-sm font-semibold text-indigo-950">{actor}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                IP Address Klien
              </span>
              <p className="text-sm font-mono text-slate-700">
                {log.clientIp || "127.0.0.1"}
              </p>
            </div>
          </div>

          {/* Row 3: User Agent */}
          <div className="py-4 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              User Agent Browser
            </span>
            <p className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed break-all">
              {log.userAgent || "unknown"}
            </p>
          </div>

          {/* Row 4: Metadata detail */}
          <div className="py-4 last:pb-0 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Metadata / Deskripsi Detail
            </span>
            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed">
              {log.metadata || "Tidak ada detail metadata tambahan."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
