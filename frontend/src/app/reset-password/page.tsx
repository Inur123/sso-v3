"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError("Token atur ulang kata sandi tidak valid atau kedaluwarsa.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (resetError) {
        const errMsg = resetError.message || "Gagal mengatur ulang kata sandi";
        setError(errMsg);
        toast.error(errMsg);
      } else {
        setSuccess(true);
        toast.success("Kata sandi berhasil diubah! Silakan masuk kembali.");
        setTimeout(() => {
          router.push("/login?password_reset=true");
        }, 1500);
      }
    } catch (err) {
      const errMsg = "Terjadi kesalahan jaringan";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Atur Ulang Sandi</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan kata sandi baru Anda di bawah ini
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg text-xs font-medium border border-green-100">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 text-green-600 animate-bounce" />
            <span>Kata sandi berhasil diperbarui! Mengalihkan...</span>
          </div>
        )}

        {!token && (
          <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-700 border border-amber-100">
            Peringatan: Token atur ulang kata sandi tidak terdeteksi di URL. Pastikan Anda membuka tautan yang dikirimkan ke email Anda.
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="password">Kata Sandi Baru</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
              disabled={loading || success || !token}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10 text-slate-400 hover:text-slate-600 hover:bg-transparent cursor-pointer flex items-center justify-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
              required
              disabled={loading || success || !token}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10 text-slate-400 hover:text-slate-600 hover:bg-transparent cursor-pointer flex items-center justify-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full cursor-pointer flex items-center justify-center"
            disabled={loading || success || !token}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Perbarui Kata Sandi"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            <Suspense fallback={null}>
              <ResetPasswordForm />
            </Suspense>
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
