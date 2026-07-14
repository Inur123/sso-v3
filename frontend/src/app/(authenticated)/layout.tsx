import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ActiveHeaderTitle } from "@/components/active-header-title";
import { ScrollResetContainer } from "@/components/scroll-reset-container";

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
  console.log("=== FE DEBUG: Cookies received from browser ===", allCookies);

  let sessionUser: UserProfile | null = null;
  let isAdmin = false;

  try {
    const targetUrl = `${API_URL}/api/auth/get-session`;
    console.log("=== FE DEBUG: Fetching session from backend ===", targetUrl);
    
    // Verifikasi sesi langsung ke backend API menggunakan cookie yang dibawa browser
    const response = await fetch(targetUrl, {
      headers: {
        Cookie: allCookies,
      },
      cache: "no-store",
    });

    console.log("=== FE DEBUG: Backend Response Status ===", response.status);

    if (response.ok) {
      const sessionData = await response.json();
      console.log("=== FE DEBUG: Session data received ===", sessionData);
      if (sessionData?.user) {
        sessionUser = sessionData.user;
        isAdmin =
          sessionData.user.role === "admin" ||
          sessionData.user.email === "admin@gmail.com";
      }
    } else {
      const errorText = await response.text();
      console.log("=== FE DEBUG: Session fetch failed body ===", errorText);
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
      <SidebarInset className="bg-slate-50 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar Persisten (Sticky & Glassmorphism) */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden cursor-pointer" />
            <div className="h-4 w-px bg-slate-200 md:hidden" />
            <ActiveHeaderTitle isAdmin={isAdmin} />
          </div>
        </header>

        {/* Area Konten Dinamis yang scrollable secara mandiri */}
        <ScrollResetContainer>
          {children}
        </ScrollResetContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
