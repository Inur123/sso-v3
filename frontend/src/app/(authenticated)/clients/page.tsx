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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldAlert, Plus, Eye } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import { DashboardSkeleton } from "../dashboard/skeleton";

interface ClientApp {
  id: string;
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUris: string[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [redirectUris, setRedirectUris] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const ADMIN_TOKEN = "admin-super-secret-token";

  const isAdmin = session?.user?.email === "admin@gmail.com";

  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const paginatedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const fetchClients = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/clients`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        setError("Gagal memuat data aplikasi.");
      }
    } catch {
      setError("Gagal terhubung ke backend API.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, ADMIN_TOKEN, isAdmin]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session) {
      if (!isAdmin) {
        router.push("/dashboard");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchClients();
      }
    }
  }, [session, isPending, isAdmin, fetchClients, router]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !redirectUris) {
      setError("Mohon lengkapi kolom nama aplikasi dan redirect URI.");
      return;
    }

    try {
      const formattedUris = redirectUris
        .split(",")
        .map((uri) => uri.trim())
        .filter((uri) => uri.length > 0);

      const response = await fetch(`${API_URL}/api/admin/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          name,
          redirectUris: formattedUris,
        }),
      });

      if (response.ok) {
        toast.success("Aplikasi client berhasil didaftarkan!");
        setName("");
        setRedirectUris("");
        setError(null);
        setIsDialogOpen(false);
        fetchClients();
      } else {
        const data = await response.json();
        setError(data.error || "Gagal membuat aplikasi client.");
      }
    } catch {
      setError("Gagal terhubung ke backend API.");
    }
  };

  if (isPending || loading) {
    return <DashboardSkeleton />;
  }

  if (!session || !isAdmin) {
    return (
      <div className="text-center text-slate-500 py-12">Mengalihkan...</div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Aplikasi Terdaftar
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Kelola dan daftarkan aplikasi luar yang diizinkan menggunakan
              login SSO Anda.
            </p>
          </div>

          {/* Dialog Shadcn UI: Tambah Aplikasi Baru */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer flex items-center shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" /> Tambah Aplikasi
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-slate-200 shadow-xl max-w-md p-6 rounded-xl">
              <DialogHeader className="space-y-1.5">
                <DialogTitle className="text-base font-bold text-slate-900">
                  Daftarkan Aplikasi Baru
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Masukkan detail informasi di bawah ini untuk membuat
                  kredensial SSO klien baru.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateClient} className="space-y-4 pt-3">
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2.5 rounded-lg text-xs font-medium border border-red-100">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nama Aplikasi
                  </label>
                  <input
                    type="text"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                    placeholder="Contoh: E-Learning App"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Redirect URIs (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                    placeholder="http://localhost:3000/callback"
                    value={redirectUris}
                    onChange={(e) => setRedirectUris(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2 flex items-center justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer text-xs"
                  >
                    Daftar Aplikasi
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabel Daftar Aplikasi Klien */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Daftar Aplikasi Klien
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {clients.length === 0 ? (
              <div className="text-center text-slate-500 py-12 text-xs">
                Belum ada aplikasi yang terdaftar.
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
                          Nama Aplikasi
                        </TableHead>
                        <TableHead className="font-bold text-slate-500">
                          Redirect URIs
                        </TableHead>
                        <TableHead className="w-24 text-center font-bold text-slate-500">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((client, index) => {
                        const actualIndex =
                          (currentPage - 1) * itemsPerPage + index + 1;
                        return (
                          <TableRow
                            key={client.id}
                            className="border-b border-slate-100 hover:bg-slate-50/50"
                          >
                            <TableCell className="text-center font-medium text-slate-500">
                              {actualIndex}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-900">
                              {client.name}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {client.redirectUris.join(", ")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Link
                                href={`/clients/${client.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                                title="Lihat Detail Kredensial & Kelola"
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
                {clients.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-bold text-slate-700">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      sampai{" "}
                      <span className="font-bold text-slate-700">
                        {Math.min(currentPage * itemsPerPage, clients.length)}
                      </span>{" "}
                      dari{" "}
                      <span className="font-bold text-slate-700">
                        {clients.length}
                      </span>{" "}
                      aplikasi
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
      </div>
    </div>
  );
}
