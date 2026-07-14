"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  Trash,
  Clipboard,
  Check,
  Eye,
  EyeOff,
  Globe,
  ShieldAlert,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { ClientDetailSkeleton } from "./skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface ClientApp {
  id: string;
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUris: string[];
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Membaca session aktif dari Better Auth Client
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.email === "admin@gmail.com";

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const ADMIN_TOKEN = "admin-super-secret-token"; // Token khusus API admin

  const fetchClientDetail = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      } else {
        toast.error("Gagal memuat detail aplikasi.");
        router.push("/clients");
      }
    } catch {
      toast.error("Gagal terhubung ke backend API.");
      router.push("/clients");
    } finally {
      setLoading(false);
    }
  }, [API_URL, ADMIN_TOKEN, id, router]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session) {
      if (!isAdmin) {
        router.push("/dashboard");
      } else {
        const timer = setTimeout(() => {
          fetchClientDetail();
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [session, isPending, isAdmin, fetchClientDetail, router]);

  const handleDeleteClient = async () => {
    if (!client) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/clients/${client.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        },
      );

      if (response.ok) {
        toast.success("Aplikasi berhasil dihapus.");
        router.push("/clients");
      } else {
        toast.error("Gagal menghapus aplikasi.");
      }
    } catch {
      toast.error("Gagal menghubungi API backend.");
    }
  };

  const handleCopy = (text: string, type: "id" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 200);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 200);
    }
    toast.success("Kredensial berhasil disalin!");
  };

  // Kita me-render SidebarProvider secara langsung untuk mencegah efek flicker / kedit kedip saat navigasi SPA
  const showContentLoading = isPending || loading;

  if (showContentLoading) {
    return <ClientDetailSkeleton />;
  }

  if (!client || !isAdmin) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-slate-500 text-sm py-12 bg-white rounded-xl border border-slate-200">
          Aplikasi tidak ditemukan atau Anda tidak memiliki akses.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen">
      <div className="w-full space-y-6">
        {/* Breadcrumbs / Back navigation */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span
            className="hover:text-slate-900 cursor-pointer"
            onClick={() => router.push("/clients")}
          >
            Aplikasi Terdaftar
          </span>
          <span>/</span>
          <span className="text-slate-900 font-medium">Detail Aplikasi</span>
        </div>

        <div className="flex items-center justify-between gap-4 w-full">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
              <Globe className="h-5.5 w-5.5 text-indigo-600" />
              <span>Detail Aplikasi Klien</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 hidden sm:block">
              Kelola kredensial dan konfigurasi redirect URI untuk aplikasi{" "}
              {client.name}
            </p>
          </div>
 
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/clients")}
            className="h-9 text-xs font-semibold cursor-pointer flex items-center space-x-1.5 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
        </div>

        {/* Main Details Card (Sama Persis seperti desain Audit Logs Detail) */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Informasi Kredensial & Pengaturan Client
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 divide-y divide-slate-100">
            {/* Row 1: Nama Aplikasi & Client ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 first:pt-0">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Nama Aplikasi
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {client.name}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Client ID
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-xs font-mono text-slate-800 break-all select-all">
                    {client.clientId}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-300 hover:bg-slate-100 text-slate-500 h-9 w-9 cursor-pointer"
                    onClick={() => handleCopy(client.clientId, "id")}
                    title="Salin Client ID"
                  >
                    {copiedId ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Row 2: Client Secret */}
            <div className="py-4 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Client Secret
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-xs font-mono text-slate-800 break-all select-all">
                  {showSecret ? client.clientSecret : "••••••••••••••••"}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-300 hover:bg-slate-100 text-slate-500 h-9 w-9 cursor-pointer"
                  onClick={() => setShowSecret(!showSecret)}
                  title={showSecret ? "Sembunyikan Secret" : "Tampilkan Secret"}
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-300 hover:bg-slate-100 text-slate-500 h-9 w-9 cursor-pointer"
                  onClick={() => handleCopy(client.clientSecret, "secret")}
                  title="Salin Client Secret"
                >
                  {copiedSecret ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Row 3: Redirect URIs */}
            <div className="py-4 last:pb-0 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Authorized Redirect URIs
              </span>
              <div className="rounded-lg border border-slate-200 bg-slate-50/30 p-3 space-y-1.5 mt-1">
                {client.redirectUris.map((uri, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-mono text-slate-700 bg-white border border-slate-100 rounded px-2.5 py-1.5"
                  >
                    {uri}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card (Desain Baru Bersih Tanpa Header Kaku) */}
        <Card className="border border-red-200 bg-red-50/10 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="space-y-1 border-b border-red-100 pb-3">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Danger Zone (Zona Bahaya)
              </h4>
              <p className="text-[11px] text-slate-500">
                Tindakan di bawah ini bersifat sensitif dan permanen. Pastikan
                Anda yakin sebelum melanjutkan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Hapus Aplikasi Klien Ini
                </p>
                <p className="text-[11px] text-slate-500">
                  Mencabut seluruh token aktif dan menghapus kredensial aplikasi
                  dari portal SSO.
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Trash className="h-4 w-4 mr-1.5" /> Hapus Aplikasi
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="bg-white border border-slate-200 max-w-[400px] rounded-xl p-6 shadow-xl"
                >
                  <DialogHeader className="flex flex-col items-center text-center sm:items-center sm:text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <DialogTitle className="text-sm font-bold text-slate-900">
                      Hapus Aplikasi Secara Permanen?
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 leading-relaxed mt-2">
                      Tindakan ini bersifat destruktif dan tidak dapat dibatalkan. Aplikasi <strong className="text-slate-700">&quot;{client.name}&quot;</strong> beserta seluruh kredensialnya akan dihapus secara permanen dari sistem portal SSO.
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
                      onClick={handleDeleteClient}
                    >
                      Hapus Permanen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
