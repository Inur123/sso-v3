"use client";

import { use, useCallback, useEffect, useState } from "react";
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
  ChevronLeft,
  Trash,
  Clipboard,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { toast } from "sonner";
import { ClientDetailSkeleton } from "./skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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
        router.push("/dashboard");
      }
    } catch {
      toast.error("Gagal terhubung ke backend API.");
      router.push("/dashboard");
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
        router.push("/dashboard");
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
  const showDetailCard = !showContentLoading && client && isAdmin;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {showContentLoading ? (
        <ClientDetailSkeleton />
      ) : showDetailCard ? (
        <div className="w-full space-y-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="bg-slate-900 hover:bg-slate-900 text-white hover:text-white cursor-pointer text-xs rounded-full border-0 shadow-sm px-4 py-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar
            </Button>
          </div>
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-lg font-bold text-slate-900">
                {client.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Gunakan kredensial berikut untuk mengintegrasikan aplikasi luar
                dengan portal SSO ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Client ID Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Client ID
                </label>
                <div className="flex items-center space-x-2">
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

              {/* Client Secret Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Client Secret
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-xs font-mono text-slate-800 break-all select-all">
                    {showSecret
                      ? client.clientSecret
                      : "••••••••••••••••••••••••••••••••••••••••••••••••"}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-300 hover:bg-slate-100 text-slate-500 h-9 w-9 cursor-pointer"
                    onClick={() => setShowSecret(!showSecret)}
                    title={
                      showSecret ? "Sembunyikan Secret" : "Tampilkan Secret"
                    }
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

              {/* Redirect URIs Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Authorized Redirect URIs
                </label>
                <div className="rounded-lg border border-slate-200 bg-slate-50/30 p-3 space-y-1.5">
                  {client.redirectUris.map((uri, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-xs font-mono text-slate-600"
                    >
                      <span>{uri}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border border-red-200 bg-red-50/10 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-red-100 bg-red-50/20 py-3">
              <CardTitle className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Danger Zone (Zona Bahaya)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Hapus Aplikasi Klien Ini
                </p>
                <p className="text-[11px] text-slate-500">
                  Tindakan ini akan mencabut seluruh token aktif dan menghapus
                  kredensial aplikasi dari portal SSO secara permanen.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Trash className="h-4 w-4 mr-1.5" /> Hapus Aplikasi
                    </Button>
                  }
                />
                <AlertDialogContent className="bg-white border border-slate-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 font-bold">
                      Apakah Anda benar-benar yakin?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500">
                      Tindakan ini tidak dapat dibatalkan. Aplikasi &quot;
                      {client.name}&quot; beserta seluruh kredensialnya akan
                      dihapus secara permanen dari sistem portal SSO.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                      onClick={handleDeleteClient}
                    >
                      Hapus Permanen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-slate-500 text-sm py-12">
          Aplikasi tidak ditemukan atau Anda tidak memiliki akses.
        </div>
      )}
    </div>
  );
}
