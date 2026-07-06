"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UsersSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen animate-pulse">
      {/* Title Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-56 bg-slate-200 rounded-md" />
        <div className="h-3.5 w-96 bg-slate-200/70 rounded" />
      </div>

      {/* Filter Bar skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        <div className="flex-1 h-[38px] bg-slate-200/80 rounded-lg" />
        <div className="sm:w-44 h-[38px] bg-slate-200/80 rounded-lg" />
        <div className="sm:w-40 h-[38px] bg-slate-200/80 rounded-lg" />
        <div className="h-[38px] w-[38px] shrink-0 bg-slate-200/70 rounded-lg" />
      </div>

      {/* Tabel Card Skeleton */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="h-4 w-60 bg-slate-200 rounded" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            {/* Header Tabel: No | Nama | Email | Verifikasi | Status | Detail */}
            <div className="border-b border-slate-200 bg-slate-50/70 h-10 flex items-center px-6 gap-4">
              <div className="h-3 w-8 bg-slate-200/80 rounded" />
              <div className="h-3 w-32 bg-slate-200/80 rounded" />
              <div className="h-3 flex-1 bg-slate-200/80 rounded" />
              <div className="h-3 w-28 bg-slate-200/80 rounded" />
              <div className="h-3 w-24 bg-slate-200/80 rounded" />
              {/* Kolom Detail — hanya 1 tombol eye */}
              <div className="h-3 w-12 bg-slate-200/80 rounded" />
            </div>

            {/* Rows (8 baris) */}
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-12 flex items-center px-6 gap-4">
                  <div className="h-3.5 w-8 bg-slate-200/60 rounded" />
                  <div className="h-3.5 w-32 bg-slate-200/60 rounded" />
                  <div className="h-3.5 flex-1 bg-slate-200/60 rounded" />
                  <div className="h-5 w-28 bg-slate-200/50 rounded-full" />
                  <div className="h-5 w-16 bg-slate-200/50 rounded-full" />
                  {/* 1 tombol eye saja */}
                  <div className="h-8 w-8 bg-slate-200/55 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <div className="h-4 w-56 bg-slate-200/60 rounded" />
            <div className="flex items-center space-x-1.5">
              <div className="h-8 w-24 bg-slate-200/60 rounded" />
              <div className="h-8 w-8 bg-slate-200/60 rounded" />
              <div className="h-8 w-24 bg-slate-200/60 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
