"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  ShieldCheck,
  Laptop,
  Edit2,
  KeyRound,
  Loader2,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileSkeleton } from "./skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.email === "admin@gmail.com";

  // Form states untuk Ubah Profil
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Form states untuk Ganti Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // States untuk visibilitas Eye Password
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditName(session.user.name);
      setEditEmail(session.user.email);
    }
  }, [session, isPending, router]);

  // Efek untuk memunculkan notifikasi welcome toast
  useEffect(() => {
    if (!isPending && session) {
      const loginParam = searchParams.get("login");
      if (loginParam === "true") {
        const welcomeRole = isAdmin ? "Administrator" : "Pengguna Portal";
        toast.success(
          `Selamat datang kembali, ${session.user.name}! Anda masuk sebagai ${welcomeRole}.`,
        );
        router.replace("/profile");
      }
    }
  }, [session, isPending, isAdmin, searchParams, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      setProfileError("Semua kolom nama dan email wajib diisi.");
      return;
    }
    setProfileLoading(true);
    setProfileError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.token}`,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
        }),
      });

      if (response.ok) {
        toast.success("Profil berhasil diperbarui!");
        setIsProfileOpen(false);
        // Refresh local cache name & email
        localStorage.setItem("sso_user_name", editName);
        localStorage.setItem("sso_user_email", editEmail);

        // Paksa reload halaman sesaat agar session terupdate mutlak
        window.location.reload();
      } else {
        const data = await response.json();
        setProfileError(data.error || "Gagal memperbarui profil.");
      }
    } catch {
      setProfileError("Gagal menghubungkan ke backend API.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Semua kolom sandi wajib diisi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi sandi baru tidak cocok.");
      return;
    }
    setPasswordLoading(true);
    setPasswordError(null);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        setPasswordError(error.message || "Gagal mengubah kata sandi.");
      } else {
        toast.success("Kata sandi berhasil diubah!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordOpen(false);
      }
    } catch {
      setPasswordError("Gagal menghubungi API autentikasi.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isPending) {
    return <ProfileSkeleton />;
  }

  if (!session) {
    return (
      <div className="text-center text-slate-500 py-12">
        Mengalihkan ke halaman login...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Kartu Detail Profil */}
        <Card className="border border-slate-200 bg-white shadow-sm md:col-span-2 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 py-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-sm font-semibold">
                  Profil Saya
                </CardTitle>
              </div>

              <div className="flex items-center space-x-2">
                {/* Dialog 1: Ubah Informasi Profil */}
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DialogTrigger
                    render={
                      <Button className="h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 text-xs font-semibold px-3 rounded-lg cursor-pointer flex items-center shadow-none border-none">
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Ubah Profil
                      </Button>
                    }
                  />
                  <DialogContent className="bg-white border border-slate-200 shadow-xl max-w-md p-6 rounded-xl">
                    <DialogHeader className="space-y-1.5">
                      <DialogTitle className="text-base font-bold text-slate-900">
                        Perbarui Informasi Profil
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-400">
                        Ubah detail nama lengkap dan alamat email akun SSO Anda
                        di bawah ini.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={handleUpdateProfile}
                      className="space-y-4 pt-3"
                    >
                      {profileError && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2.5 rounded-lg text-xs font-medium border border-red-100">
                          <ShieldAlert className="h-4 w-4 shrink-0" />
                          <span>{profileError}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Email SSO
                        </label>
                        <input
                          type="email"
                          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      </div>

                      <DialogFooter className="pt-2 flex items-center justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
                          onClick={() => setIsProfileOpen(false)}
                          disabled={profileLoading}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer text-xs flex items-center"
                          disabled={profileLoading}
                        >
                          {profileLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />{" "}
                              Loading...
                            </>
                          ) : (
                            "Simpan"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Dialog 2: Ganti Password */}
                <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                  <DialogTrigger
                    render={
                      <Button className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 rounded-lg cursor-pointer flex items-center shadow-sm">
                        <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Ganti
                        Password
                      </Button>
                    }
                  />
                  <DialogContent className="bg-white border border-slate-200 shadow-xl max-w-md p-6 rounded-xl">
                    <DialogHeader className="space-y-1.5">
                      <DialogTitle className="text-base font-bold text-slate-900">
                        Ubah Kata Sandi Akun
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-400">
                        Demi keamanan, masukkan sandi lama Anda sebelum menyetel
                        sandi baru yang kuat.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={handleUpdatePassword}
                      className="space-y-4 pt-3"
                    >
                      {passwordError && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2.5 rounded-lg text-xs font-medium border border-red-100">
                          <ShieldAlert className="h-4 w-4 shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Kata Sandi Saat Ini
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Kata Sandi Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Konfirmasi Kata Sandi Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <DialogFooter className="pt-2 flex items-center justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
                          onClick={() => setIsPasswordOpen(false)}
                          disabled={passwordLoading}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer text-xs flex items-center"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />{" "}
                              Loading...
                            </>
                          ) : (
                            "Perbarui Sandi"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <p className="font-medium text-slate-900 text-base mt-0.5">
                    {session.user.name}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email SSO
                  </label>
                  <p className="font-medium text-slate-900 text-base mt-0.5">
                    {session.user.email}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status Akun
                  </label>
                  <div className="flex items-center mt-1 text-sm text-green-700 font-semibold">
                    <ShieldCheck className="h-4.5 w-4.5 mr-1.5 text-green-600" />{" "}
                    Aktif & Terverifikasi
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Kartu Informasi Sesi Aktif */}
        <Card className="border border-slate-200 bg-white shadow-sm col-span-1">
          <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
            <Laptop className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-semibold">
              Sesi Aktif Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-2 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Browser:</span>{" "}
              Chrome (macOS)
            </p>
            <p>
              <span className="font-semibold text-slate-800">Alamat IP:</span>{" "}
              127.0.0.1 (Localhost)
            </p>
            <p>
              <span className="font-semibold text-slate-800">Lokasi:</span>{" "}
              Indonesia
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
