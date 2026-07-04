"use client";

import { usePathname } from "next/navigation";

interface ActiveHeaderTitleProps {
  isAdmin: boolean;
}

export function ActiveHeaderTitle({ isAdmin }: ActiveHeaderTitleProps) {
  const pathname = usePathname();

  if (pathname === "/profile") {
    return <span>Profil Saya</span>;
  }
  if (pathname === "/sessions") {
    return <span>Riwayat Sesi SSO</span>;
  }
  if (pathname.includes("/dashboard/clients/")) {
    return <span>Admin Console - Detail Aplikasi</span>;
  }
  
  return <span>{isAdmin ? "Admin Console" : "User Portal - Profil"}</span>;
}
