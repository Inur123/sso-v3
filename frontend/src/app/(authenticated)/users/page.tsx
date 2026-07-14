"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Users, Eye, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { UsersSkeleton } from "./skeleton";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ADMIN_TOKEN = "admin-super-secret-token";

export default function UsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [emailFilter, setEmailFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const isAdmin =
    session?.user && (session.user as { role?: string }).role === "admin";

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    // Tidak set loading=true di sini agar tidak menampilkan skeleton saat re-fetch
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      if (response.ok) {
        setUsers(await response.json());
        setError(null);
      } else {
        setError("Gagal memuat data pengguna dari server.");
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      else fetchUsers();
    }
  }, [session, isPending, isAdmin, fetchUsers, router]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmail =
      emailFilter === "all" ||
      (emailFilter === "verified" && u.emailVerified) ||
      (emailFilter === "unverified" && !u.emailVerified);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesEmail && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (isPending || (loading && users.length === 0)) return <UsersSkeleton />;
  if (!isAdmin) return null;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-slate-50/40 min-h-screen">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
          <Users className="h-5.5 w-5.5 text-indigo-600" />
          <span>Manajemen Pengguna</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Kelola status keaktifan akun pengguna portal Single Sign-On (SSO) Anda
          secara tersentralisasi.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 shadow-sm placeholder:text-slate-400"
        />
        <select
          value={emailFilter}
          onChange={(e) => {
            setEmailFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="sm:w-44 px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 cursor-pointer shadow-sm"
        >
          <option value="all">Email: Semua</option>
          <option value="verified">Terverifikasi</option>
          <option value="unverified">Belum Verifikasi</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="sm:w-40 px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 cursor-pointer shadow-sm"
        >
          <option value="all">Status: Semua</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
        <button
          onClick={() => {
            setSearchQuery("");
            setEmailFilter("all");
            setStatusFilter("all");
            setCurrentPage(1);
          }}
          title="Reset semua filter"
          className="w-full sm:w-[38px] h-[38px] shrink-0 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm cursor-pointer text-xs"
        >
          <X className="h-4 w-4" />
          <span className="sm:hidden font-medium">Reset Filter</span>
        </button>
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
              Daftar Akun Pengguna Terdaftar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-slate-500 py-12 text-xs">
                {searchQuery || emailFilter !== "all" || statusFilter !== "all"
                  ? "Tidak ditemukan pengguna yang cocok dengan kriteria filter."
                  : "Belum ada data pengguna terdaftar."}
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
                        <TableHead className="font-bold text-slate-500">
                          Nama Pengguna
                        </TableHead>
                        <TableHead className="font-bold text-slate-500">
                          Email
                        </TableHead>
                        <TableHead className="w-36 font-bold text-slate-500">
                          Verifikasi Email
                        </TableHead>
                        <TableHead className="w-32 font-bold text-slate-500">
                          Status Akun
                        </TableHead>
                        <TableHead className="w-20 text-center font-bold text-slate-500">
                          Detail
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((u, index) => {
                        const actualIndex =
                          (currentPage - 1) * itemsPerPage + index + 1;
                        return (
                          <TableRow
                            key={u.id}
                            className="border-b border-slate-100 hover:bg-slate-50/50 text-xs"
                          >
                            <TableCell className="text-center font-medium text-slate-500">
                              {actualIndex}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-900">
                              {u.name}
                            </TableCell>
                            <TableCell className="text-slate-500">
                              {u.email}
                            </TableCell>
                            <TableCell>
                              {u.emailVerified ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                  Terverifikasi
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                  Belum Verifikasi
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  Nonaktif
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Link
                                href={`/users/${u.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                                title="Lihat Detail Pengguna"
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-bold text-slate-700">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      sampai{" "}
                      <span className="font-bold text-slate-700">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredUsers.length,
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold text-slate-700">
                        {filteredUsers.length}
                      </span>{" "}
                      pengguna
                    </div>
                    <Pagination className="mx-0 w-auto justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            text="Sebelumnya"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((p) => Math.max(p - 1, 1));
                            }}
                            aria-disabled={currentPage === 1}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-40"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                        {(totalPages <= 7
                          ? Array.from({ length: totalPages }, (_, i) => i + 1)
                          : currentPage <= 4
                            ? [1, 2, 3, 4, 5, "...", totalPages]
                            : currentPage >= totalPages - 3
                              ? [
                                  1,
                                  "...",
                                  totalPages - 4,
                                  totalPages - 3,
                                  totalPages - 2,
                                  totalPages - 1,
                                  totalPages,
                                ]
                              : [
                                  1,
                                  "...",
                                  currentPage - 1,
                                  currentPage,
                                  currentPage + 1,
                                  "...",
                                  totalPages,
                                ]
                        ).map((page, idx) =>
                          page === "..." ? (
                            <PaginationItem key={`e-${idx}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page as number);
                                }}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}
                        <PaginationItem>
                          <PaginationNext
                            text="Selanjutnya"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((p) =>
                                Math.min(p + 1, totalPages),
                              );
                            }}
                            aria-disabled={currentPage === totalPages}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-40"
                                : "cursor-pointer"
                            }
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
