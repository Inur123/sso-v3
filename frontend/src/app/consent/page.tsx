"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface ConsentData {
  clientName: string;
  scopes: string[];
  logo?: string;
}

export default function ConsentPage() {
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Memuat detail permintaan akses OIDC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = authClient as any;
    client.oauth2
      .getConsent()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        if (res.data) {
          setConsentData(res.data as unknown as ConsentData);
        } else if (res.error) {
          setError("Gagal memuat informasi persetujuan.");
        }
      })
      .catch(() => {
        setError("Koneksi gagal.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAction = async (accept: boolean) => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = authClient as any;
      await client.oauth2.consent({
        accept,
      });
      // Better Auth secara otomatis mengarahkan browser kembali ke aplikasi client setelah ini
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Gagal mengirim persetujuan.");
      setLoading(false);
    }
  };

  if (loading && !consentData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Memuat permintaan akses...</p>
      </div>
    );
  }

  if (error || !consentData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md border-red-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold text-slate-900">
              Terjadi Kesalahan
            </h2>
            <p className="text-sm text-slate-500">
              {error || "Permintaan SSO tidak valid atau sudah kedaluwarsa."}
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-slate-900 text-white"
            >
              Kembali ke Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Persetujuan Masuk (SSO)
          </CardTitle>
          <CardDescription className="text-slate-500">
            Aplikasi{" "}
            <span className="font-semibold text-slate-900">
              {consentData.clientName}
            </span>{" "}
            meminta izin untuk mengakses akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Informasi yang Diminta:
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              {consentData.scopes.map((scope) => (
                <li key={scope} className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span>
                    {scope === "openid" && "Koneksi identitas unik (OpenID)"}
                    {scope === "profile" &&
                      "Informasi profil dasar (Nama, Foto)"}
                    {scope === "email" && "Alamat email Anda"}
                    {scope !== "openid" &&
                      scope !== "profile" &&
                      scope !== "email" &&
                      `Akses scope: ${scope}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => handleAction(false)}
            disabled={loading}
          >
            Tolak
          </Button>
          <Button
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
            onClick={() => handleAction(true)}
            disabled={loading}
          >
            Setujui
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
