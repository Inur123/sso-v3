/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Eye, X, ChevronDown, Check } from "lucide-react";
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

const ALL_ACTIONS = [
  "user.login",
  "user.logout",
  "user.signup",
  "user.activated",
  "user.deactivated",
  "user.deleted",
  "client.created",
  "client.deleted",
  "system.init",
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Filter states ---
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  // Combobox user open/search state
  const [userOpen, setUserOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.email === "admin@gmail.com";

  const fetchLogs = useCallback(async () => {
    if (!isAdmin) return;
    // Tidak set loading=true di sini agar tidak menampilkan skeleton saat re-fetch
    try {
      const response = await fetch(`${API_URL}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
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
      if (!isAdmin) router.push("/dashboard");
      else fetchLogs();
    }
  }, [session, isPending, isAdmin, fetchLogs, router]);

  // Helper untuk mendapatkan label pelaku dari log entry
  const getActor = (log: AuditLog): string => {
    const emailMatch = log.metadata?.match(/\(([^)]+@[^)]+)\)/);
    if (log.userEmail) return log.userEmail;
    if (emailMatch) return emailMatch[1];
    return "Sistem / Admin API";
  };

  // Daftar unik user pelaku dari semua log
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => set.add(getActor(log)));
    return Array.from(set).sort();
  }, [logs]);

  // Hasil filter combobox user berdasar pencarian
  const filteredUserOptions = useMemo(() => {
    if (!userSearch) return uniqueUsers;
    return uniqueUsers.filter((u) =>
      u.toLowerCase().includes(userSearch.toLowerCase()),
    );
  }, [uniqueUsers, userSearch]);

  // Log setelah difilter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;
      const matchesUser = userFilter === "all" || getActor(log) === userFilter;
      return matchesAction && matchesUser;
    });
  }, [logs, actionFilter, userFilter]);

  const isFiltered = actionFilter !== "all" || userFilter !== "all";

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset page saat filter berubah
  const handleActionFilter = (val: string) => {
    setActionFilter(val);
    setCurrentPage(1);
  };
  const handleUserFilter = (val: string) => {
    setUserFilter(val);
    setUserOpen(false);
    setUserSearch("");
    setCurrentPage(1);
  };
  const handleReset = () => {
    setActionFilter("all");
    setUserFilter("all");
    setUserSearch("");
    setCurrentPage(1);
  };

  // Helper badge aksi log
  const getActionBadge = (action: string) => {
    const base =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border";
    switch (action) {
      case "client.created":
        return (
          <span
            className={`${base} bg-green-50 text-green-700 border-green-200`}
          >
            {action}
          </span>
        );
      case "client.deleted":
        return (
          <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
            {action}
          </span>
        );
      case "user.signup":
        return (
          <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>
            {action}
          </span>
        );
      case "user.login":
        return (
          <span
            className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}
          >
            {action}
          </span>
        );
      case "user.logout":
        return (
          <span
            className={`${base} bg-amber-50 text-amber-700 border-amber-200`}
          >
            {action}
          </span>
        );
      case "user.activated":
        return (
          <span
            className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}
          >
            {action}
          </span>
        );
      case "user.deactivated":
        return (
          <span
            className={`${base} bg-orange-50 text-orange-700 border-orange-200`}
          >
            {action}
          </span>
        );
      case "user.deleted":
        return (
          <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}>
            {action}
          </span>
        );
      case "system.init":
        return (
          <span
            className={`${base} bg-purple-50 text-purple-700 border-purple-200`}
          >
            {action}
          </span>
        );
      default:
        return (
          <span
            className={`${base} bg-slate-50 text-slate-700 border-slate-200`}
          >
            {action}
          </span>
        );
    }
  };

  if (isPending || (loading && logs.length === 0)) return <AuditLogsSkeleton />;
  if (!isAdmin) return null;

  return (
    <div className="flex-1 w-full max-w-full min-w-0 overflow-hidden space-y-6 p-4 md:p-6 bg-slate-50/40 min-h-screen">
      {/* Header */}
      <div className="w-full">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
          <ClipboardList className="h-5.5 w-5.5 text-indigo-600" />
          <span>Log Audit Aktivitas</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 break-words whitespace-normal max-w-full">
          Pantau seluruh aktivitas otentikasi pengguna dan manipulasi data klien
          SSO secara real-time.
        </p>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        {/* Filter Aksi */}
        <div className="relative flex-1 min-w-0">
          <select
            id="action-filter"
            value={actionFilter}
            onChange={(e) => handleActionFilter(e.target.value)}
            className="w-full h-[38px] pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 appearance-none cursor-pointer transition-colors hover:border-slate-300"
          >
            <option value="all">Semua Aksi</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* Filter User / Pelaku — Combobox dengan search */}
        <div className="relative flex-1 min-w-0">
          <button
            id="user-filter-btn"
            type="button"
            onClick={() => {
              setUserOpen((v) => !v);
              setUserSearch("");
            }}
            className="w-full h-[38px] pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer transition-colors hover:border-slate-300 flex items-center text-left"
          >
            <span
              className={
                userFilter === "all" ? "text-slate-400" : "text-slate-700"
              }
            >
              {userFilter === "all" ? "Semua User / Pelaku" : userFilter}
            </span>
          </button>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />

          {/* Dropdown combobox */}
          {userOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-slate-100">
                <input
                  autoFocus
                  type="text"
                  placeholder="Cari user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              {/* Options */}
              <ul className="max-h-48 overflow-y-auto py-1">
                <li>
                  <button
                    type="button"
                    onClick={() => handleUserFilter("all")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer text-slate-700 font-medium"
                  >
                    <Check
                      className={`h-3.5 w-3.5 shrink-0 ${userFilter === "all" ? "text-indigo-600" : "invisible"}`}
                    />
                    <span>Semua User / Pelaku</span>
                  </button>
                </li>
                {uniqueUsers
                  .filter((u) =>
                    u.toLowerCase().includes(userSearch.toLowerCase()),
                  )
                  .map((u) => (
                    <li key={u}>
                      <button
                        type="button"
                        onClick={() => handleUserFilter(u)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer text-slate-700"
                      >
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 ${userFilter === u ? "text-indigo-600" : "invisible"}`}
                        />
                        <span className="truncate">{u}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tombol Reset X */}
        <Button
          id="reset-filter-btn"
          variant="outline"
          onClick={handleReset}
          disabled={!isFiltered}
          className="w-full sm:w-[38px] h-[38px] p-0 shrink-0 flex items-center justify-center gap-2 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40 cursor-pointer text-xs"
          title="Reset Filter"
        >
          <X className="h-4 w-4" />
          <span className="sm:hidden font-medium">Reset Filter</span>
        </Button>
      </div>

      {/* Tutup combobox saat klik luar */}
      {userOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserOpen(false)}
        />
      )}

      {error ? (
        <Card className="border border-red-200 bg-red-50/50 p-6 rounded-xl">
          <div className="text-center text-xs text-red-600 font-medium">
            {error}
          </div>
        </Card>
      ) : (
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl w-full max-w-full">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Histori Aktivitas Sistem &amp; User
              {isFiltered && (
                <span className="ml-2 text-[10px] font-normal text-slate-400">
                  ({filteredLogs.length} dari {logs.length} log)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 w-full overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-slate-500 py-12 text-xs">
                {isFiltered
                  ? "Tidak ada log yang sesuai dengan filter."
                  : "Belum ada aktivitas yang tercatat."}
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto border-t border-slate-100">
                  <table className="w-full min-w-[800px] table-fixed text-sm caption-bottom">
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 bg-slate-50/70">
                        <TableHead className="w-12 text-center font-bold text-slate-500">
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
                        const actor = getActor(log);

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
                              <Link href={`/audit-logs/${log.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredLogs.length > 0 && (
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-bold text-slate-700">
                        {Math.min(
                          (currentPage - 1) * itemsPerPage + 1,
                          filteredLogs.length,
                        )}
                      </span>{" "}
                      sampai{" "}
                      <span className="font-bold text-slate-700">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredLogs.length,
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold text-slate-700">
                        {filteredLogs.length}
                      </span>{" "}
                      log aktivitas
                    </div>
                    <Pagination className="mx-0 w-auto justify-end">
                      <PaginationContent>
                          <PaginationItem>
                      <PaginationPrevious
                              text="Sebelumnya"
                              onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(p - 1, 1)); }}
                              aria-disabled={currentPage === 1}
                              className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {(totalPages <= 7
                            ? Array.from({ length: totalPages }, (_, i) => i + 1)
                            : currentPage <= 4
                            ? [1, 2, 3, 4, 5, "...", totalPages]
                            : currentPage >= totalPages - 3
                            ? [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
                            : [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
                          ).map((page, idx) =>
                            page === "..." ? (
                              <PaginationItem key={`e-${idx}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            ) : (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={currentPage === page}
                                  onClick={(e) => { e.preventDefault(); setCurrentPage(page as number); }}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          )}
                          <PaginationItem>
                            <PaginationNext
                              text="Selanjutnya"
                              onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(p + 1, totalPages)); }}
                              aria-disabled={currentPage === totalPages || totalPages === 0}
                              className={(currentPage === totalPages || totalPages === 0) ? "pointer-events-none opacity-40" : "cursor-pointer"}
                            />
                          </PaginationItem>
                      </PaginationContent>
                    </Pagination>
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
