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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: registerError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: `${window.location.origin}/login?verified=true`,
      });

      if (registerError) {
        const errMsg = registerError.message || "Pendaftaran gagal";
        setError(errMsg);
        toast.error(errMsg); // Tampilkan error di sonner toast
      } else {
        // Arahkan ke login dengan menyematkan query param registered=true
        router.push("/login?registered=true");
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
    <form
      onSubmit={handleRegister}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Daftar Akun Baru</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Lengkapi data Anda di bawah ini untuk membuat akun SSO
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
              "Daftar"
            )}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center mt-2">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 font-semibold text-slate-900"
            >
              Masuk
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
