import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ActiveHeaderTitle } from "@/components/active-header-title";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  
  // Membaca cookie secara sinkron di sisi server Next.js
  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();

  let sessionUser: UserProfile | null = null;
  let isAdmin = false;

  try {
    // Verifikasi sesi langsung ke backend API menggunakan cookie yang dibawa browser
    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: {
        Cookie: allCookies,
      },
      cache: "no-store",
    });

    if (response.ok) {
      const sessionData = await response.json();
      if (sessionData?.user) {
        sessionUser = sessionData.user;
        isAdmin = sessionData.user.email === "admin@gmail.com";
      }
    }
  } catch (err) {
    console.error("Gagal melakukan verifikasi sesi server-side:", err);
  }

  // Jika tidak memiliki sesi aktif, langsung arahkan ke halaman login di sisi server (aman & instan)
  if (!sessionUser) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar serverIsAdmin={isAdmin} serverUser={sessionUser} />
      <SidebarInset className="bg-slate-50">
        {/* Top Navbar Persisten */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="cursor-pointer" />
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <ActiveHeaderTitle isAdmin={isAdmin} />
            </span>
          </div>
        </header>

        {/* Area Konten Dinamis yang akan dimuat ulang (hanya ini yang refresh) */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
