"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        const errMsg =
          resetError.message || "Gagal mengirim permintaan atur ulang password";
        setError(errMsg);
        toast.error(errMsg);
      } else {
        setSuccess(true);
        toast.success(
          "Tautan atur ulang kata sandi berhasil dikirim! Silakan periksa inbox email Anda.",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const errMsg = "Terjadi kesalahan jaringan";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/login"
            className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sso_logo.png"
              alt="Logo Portal SSO"
              className="size-8 object-contain rounded-lg shadow-sm"
            />
            Portal SSO Perusahaan
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form
              onSubmit={handleForgotPassword}
              className="flex flex-col gap-6"
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Lupa Password</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Masukkan alamat email Anda untuk menerima tautan atur ulang
                    kata sandi
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-xs text-green-700 border border-green-100">
                    Email instruksi atur ulang kata sandi telah dikirim. Harap
                    periksa email Anda (termasuk folder spam).
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || success}
                  />
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="w-full cursor-pointer flex items-center justify-center"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Tautan Reset"
                    )}
                  </Button>
                </Field>

                <Field>
                  <div className="text-center mt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Kembali ke Login</span>
                    </Link>
                  </div>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-slate-100 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sso_login_bg.png"
          alt="SSO Secure Gateway Illustration"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
