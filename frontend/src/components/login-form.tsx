/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { Loader2, Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Silakan masukkan alamat email Anda terlebih dahulu.");
      setError("Silakan masukkan alamat email Anda terlebih dahulu.");
      return;
    }
    setResendingVerification(true);
    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/login?verified=true`,
      });
      if (resendError) {
        toast.error(resendError.message || "Gagal mengirim ulang email verifikasi.");
      } else {
        toast.success("Email verifikasi baru berhasil dikirim! Silakan periksa kotak masuk Anda.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setResendingVerification(false);
    }
  };

  // Efek untuk memantau notifikasi register sukses, logout sukses, reset password, dan error Oauth dari URL params / sessionStorage
  useEffect(() => {
    const registered = searchParams.get("registered");
    const verified = searchParams.get("verified");
    const passwordReset = searchParams.get("password_reset");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);

      // Akun Google belum terdaftar → tampilkan sonner saja, tetap di login
      if (decodedError === "google_not_registered") {
        window.history.replaceState(null, "", "/login");
        toast.error("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
        return;
      }

      if (decodedError === "EmailNotVerified" || decodedError === "email_not_verified") {
        const msg = "Email Anda belum diverifikasi. Silakan periksa kotak masuk email Anda.";
        setError(msg);
        toast.error(msg);
      } else {
        toast.error(decodedError);
        if (
          decodedError !== "Akun Anda telah dinonaktifkan oleh administrator."
        ) {
          setError(decodedError);
        }
      }
      window.history.replaceState(null, "", "/login"); // Bersihkan query params senyap
    }

    if (registered === "true") {
      toast.info(
        "Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk melakukan verifikasi akun sebelum masuk.",
      );
      setError("Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi akun.");
      window.history.replaceState(null, "", "/login"); // Bersihkan query params senyap
    }

    if (verified === "true") {
      toast.success(
        "Email Anda berhasil terverifikasi! Silakan masuk dengan akun Anda.",
      );
      window.history.replaceState(null, "", "/login"); // Bersihkan query params senyap
    }

    if (passwordReset === "true") {
      toast.success(
        "Kata sandi Anda berhasil diatur ulang! Silakan masuk menggunakan kata sandi baru Anda.",
      );
      window.history.replaceState(null, "", "/login"); // Bersihkan query params senyap
    }

    // Baca penanda logout sukses dari sessionStorage
    const isLogout = sessionStorage.getItem("sso_logout_success");
    if (isLogout === "true") {
      toast.success("Anda telah berhasil keluar dari sesi SSO.");
      sessionStorage.removeItem("sso_logout_success"); // Hapus segera agar tidak berulang
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } = await authClient.signIn.email({
        email,
        password,
      });

      if (loginError) {
        let errMsg = loginError.message || "Gagal masuk ke akun";
        if (errMsg === "Invalid email or password") {
          errMsg = "Email atau password tidak sesuai";
        } else if (errMsg === "Email not verified") {
          errMsg =
            "Email belum diverifikasi. Silakan periksa kotak masuk email Anda.";
        }

        toast.error(errMsg); // Tampilkan error di sonner toast
        if (errMsg !== "Akun Anda telah dinonaktifkan oleh administrator.") {
          setError(errMsg);
        }
      } else {
        // Simpan cache profil user ke localStorage untuk rendering sidebar instan bebas kedipan
        if (data?.user) {
          localStorage.setItem("sso_user_name", data.user.name);
          localStorage.setItem("sso_user_email", data.user.email);
          localStorage.setItem(
            "sso_is_admin",
            data.user.email === "admin@gmail.com" ? "true" : "false",
          );
        }

        // Redirection dilakukan hanya setelah promise sign-in selesai ter-resolve dengan sukses
        router.push("/dashboard?login=true");
      }
    } catch {
      const errMsg = "Terjadi kesalahan jaringan";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard?login=true`,
        errorCallbackURL: `${window.location.origin}/login`,
      });
    } catch {
      toast.error("Gagal terhubung dengan layanan Google");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Masuk ke Akun Anda</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan email Anda di bawah ini untuk masuk ke akun
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100 flex flex-col gap-2">
            <span>{error}</span>
            {(error.includes("belum") || error.toLowerCase().includes("verify") || error.toLowerCase().includes("verified") || error.includes("daftar")) && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="text-left font-semibold underline text-red-700 hover:text-red-900 cursor-pointer disabled:opacity-50 w-fit"
              >
                {resendingVerification ? "Mengirim ulang..." : "Kirim ulang email verifikasi"}
              </button>
            )}
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
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
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
          <Button
            type="submit"
            className="w-full cursor-pointer flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </Field>

        <FieldSeparator>Atau lanjutkan dengan</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="w-full cursor-pointer flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Masuk dengan Google
          </Button>
          <FieldDescription className="text-center mt-4">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 font-semibold text-slate-900"
            >
              Daftar
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
