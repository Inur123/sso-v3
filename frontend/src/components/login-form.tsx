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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Efek untuk memantau notifikasi register sukses, logout sukses, dan reset password dari URL params / sessionStorage
  useEffect(() => {
    const registered = searchParams.get("registered");
    const verified = searchParams.get("verified");
    const passwordReset = searchParams.get("password_reset");

    if (registered === "true") {
      toast.info("Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk melakukan verifikasi akun sebelum masuk.");
      window.history.replaceState(null, "", "/login"); // Bersihkan query params senyap
    }

    if (verified === "true") {
      toast.success("Email Anda berhasil terverifikasi! Silakan masuk dengan akun Anda.");
      window.history.replaceState(null, "", "/login"); // Bersihkan query params senyap
    }

    if (passwordReset === "true") {
      toast.success("Kata sandi Anda berhasil diatur ulang! Silakan masuk menggunakan kata sandi baru Anda.");
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
          errMsg = "Email belum diverifikasi. Silakan periksa kotak masuk email Anda.";
        }
        setError(errMsg);
        toast.error(errMsg); // Tampilkan error di sonner toast
      } else {
        // Simpan cache profil user ke localStorage untuk rendering sidebar instan bebas kedipan
        if (data?.user) {
          localStorage.setItem("sso_user_name", data.user.name);
          localStorage.setItem("sso_user_email", data.user.email);
          localStorage.setItem("sso_is_admin", data.user.email === "admin@gmail.com" ? "true" : "false");
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
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100">
            {error}
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
            className="w-full cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Masuk dengan GitHub
          </Button>
          <FieldDescription className="text-center">
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
