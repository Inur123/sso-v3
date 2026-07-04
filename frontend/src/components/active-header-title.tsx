"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ActiveHeaderTitleProps {
  isAdmin: boolean;
}

export function ActiveHeaderTitle({ isAdmin }: ActiveHeaderTitleProps) {
  const pathname = usePathname();

  const renderItems = () => {
    // 1. Rute Profil Saya
    if (pathname === "/profile") {
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Portal</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profil Saya</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    // 2. Rute Riwayat Sesi
    if (pathname === "/sessions") {
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Portal</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Riwayat Sesi SSO</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    // 3. Rute Detail Aplikasi (Admin)
    if (pathname.includes("/clients/") && pathname !== "/clients") {
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Console</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/clients">Aplikasi Terdaftar</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Aplikasi</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    // 4. Rute Daftar Aplikasi (Admin)
    if (pathname === "/clients") {
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Console</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Aplikasi Terdaftar</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    // 5. Default / Dashboard Utama
    return (
      <BreadcrumbItem>
        <BreadcrumbPage>{isAdmin ? "Admin Console" : "Dashboard"}</BreadcrumbPage>
      </BreadcrumbItem>
    );
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {renderItems()}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
