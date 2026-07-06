"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AuditLogsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen animate-pulse">
      {/* Title Header area skeleton */}
      <div className="space-y-2">
        {/* Judul Halaman */}
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        {/* Deskripsi */}
        <div className="h-3.5 w-96 bg-slate-200/70 rounded" />
      </div>

      {/* Filter Bar skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        <div className="flex-1 h-[38px] bg-slate-200/80 rounded-lg" />
        <div className="flex-1 h-[38px] bg-slate-200/80 rounded-lg" />
        <div className="h-[38px] w-[38px] shrink-0 bg-slate-200/70 rounded-lg" />
      </div>

      {/* Tabel Card Skeleton */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          {/* Judul Tabel Card */}
          <div className="h-4.5 w-56 bg-slate-200 rounded" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            {/* Mock Header Table (5 Kolom Baru) */}
            <div className="border-b border-slate-200 bg-slate-50/70 h-10 flex items-center px-6 gap-6">
              <div className="h-3 w-12 bg-slate-200/80 rounded" />
              <div className="h-3 w-32 bg-slate-200/80 rounded" />
              <div className="h-3.5 w-24 bg-slate-200/80 rounded" />
              <div className="h-3 w-48 bg-slate-200/80 rounded" />
              <div className="h-3 w-16 bg-slate-200/80 rounded ml-auto" />
            </div>

            {/* Mock Rows (10 rows) */}
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="h-12 flex items-center px-6 gap-6">
                  <div className="h-3.5 w-12 bg-slate-200/60 rounded" />
                  <div className="h-3.5 w-32 bg-slate-200/60 rounded" />
                  <div className="h-5 w-24 bg-slate-200/50 rounded-full" />
                  <div className="h-3.5 w-48 bg-slate-200/60 rounded" />
                  <div className="h-8 w-8 bg-slate-200/55 rounded-md ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Mock Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            {/* Teks Ringkasan */}
            <div className="h-4.5 w-56 bg-slate-200/60 rounded" />
            {/* Tombol-tombol Pagination */}
            <div className="flex items-center space-x-1.5">
              <div className="h-8 w-20 bg-slate-200/60 rounded" />
              <div className="h-8 w-8 bg-slate-200/60 rounded" />
              <div className="h-8 w-20 bg-slate-200/60 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
