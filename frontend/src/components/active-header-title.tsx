"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface ActiveHeaderTitleProps {
  isAdmin: boolean;
}

export function ActiveHeaderTitle({ isAdmin }: ActiveHeaderTitleProps) {
  const renderItems = () => {
    // Default / Dashboard Utama
    return (
      <BreadcrumbItem>
        <BreadcrumbPage>
          {isAdmin ? "Admin Console" : "Dashboard"}
        </BreadcrumbPage>
      </BreadcrumbItem>
    );
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>{renderItems()}</BreadcrumbList>
    </Breadcrumb>
  );
}
