"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, User, History, LogOut, ChevronUp, Globe } from "lucide-react";

interface AppSidebarProps {
  serverIsAdmin?: boolean;
  serverUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export function AppSidebar({ serverIsAdmin, serverUser }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname(); // Membaca path rute aktif secara dinamis
  const { data: session } = authClient.useSession();

  // Memanfaatkan prop server-side secara langsung untuk mencegah kedipan/hydration mismatch
  const isAdmin = session ? session.user.email === "admin@gmail.com" : !!serverIsAdmin;
  const displayName = session ? session.user.name : (serverUser?.name || "");
  const displayEmail = session ? session.user.email : (serverUser?.email || "");

  const handleLogout = async () => {
    try {
      // Simpan penanda logout sukses di sessionStorage sebelum keluar
      sessionStorage.setItem("sso_logout_success", "true");
      
      // Bersihkan seluruh cache profil local
      localStorage.removeItem("sso_user_name");
      localStorage.removeItem("sso_user_email");
      localStorage.removeItem("sso_is_admin");

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      {/* Sidebar Header: Brand Logo (Selalu Tampil Statis) */}
      <SidebarHeader className="border-b border-slate-100 p-4">
        <div className="flex items-center space-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sso_logo.png"
            alt="SSO Logo"
            className="h-7 w-7 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Portal SSO
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Identity Provider
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content: Navigation Groups */}
      <SidebarContent className="p-2 space-y-4">
        {isAdmin ? (
          // MENU JIKA ADMIN
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
              Admin Console
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard" />}
                    isActive={pathname === "/dashboard"}
                  >
                    <LayoutGrid className="h-4 w-4 text-slate-500" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/clients" />}
                    isActive={pathname === "/clients" || pathname.includes("/clients/")}
                  >
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span>Aplikasi Terdaftar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          // MENU JIKA USER BIASA
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
              Menu Utama
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard" />}
                    isActive={pathname === "/dashboard"}
                  >
                    <LayoutGrid className="h-4 w-4 text-slate-500" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/profile" />}
                    isActive={pathname === "/profile"}
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    <span>Profil Saya</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/sessions" />}
                    isActive={pathname === "/sessions"}
                  >
                    <History className="h-4 w-4 text-slate-500" />
                    <span>Riwayat Sesi SSO</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sidebar Footer: User Account (Tampil langsung dari serverUser tanpa delay) */}
      <SidebarFooter className="border-t border-slate-100 p-2">
        {(displayName || displayEmail) && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton className="h-12 w-full justify-between px-2 hover:bg-slate-100/70 rounded-md cursor-pointer transition-all">
                      <div className="flex items-center space-x-3 text-left">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm">
                          {(displayName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {displayName}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {displayEmail}
                          </span>
                        </div>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="w-56 p-1 border border-slate-200 bg-white rounded-lg shadow-lg"
                >
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {displayEmail}
                    </p>
                  </div>
                  <DropdownMenuItem
                    className="flex items-center space-x-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-md cursor-pointer transition-colors"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Profil Akun</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center space-x-2 px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md cursor-pointer font-medium transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar Sesi</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
