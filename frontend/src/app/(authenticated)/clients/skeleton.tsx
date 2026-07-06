"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ClientsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen animate-pulse">
      {/* Header Area Skeleton */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-2 flex-1">
          {/* Title */}
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          {/* Subtitle */}
          <div className="h-3.5 w-96 bg-slate-200/70 rounded" />
        </div>
        {/* Tambah Aplikasi Button */}
        <div className="h-9 w-36 bg-slate-200 rounded-lg self-start md:self-auto" />
      </div>

      {/* Tabel Card Skeleton */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="h-4.5 w-44 bg-slate-200 rounded" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            {/* Header Columns Mock */}
            <div className="border-b border-slate-200 bg-slate-50/70 h-10 flex items-center px-6 gap-6">
              <div className="h-3 w-12 bg-slate-200/80 rounded" />
              <div className="h-3 w-32 bg-slate-200/80 rounded" />
              <div className="h-3 w-64 bg-slate-200/80 rounded" />
              <div className="h-3 w-16 bg-slate-200/80 rounded ml-auto" />
            </div>

            {/* Rows Mock (5 rows placeholder) */}
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-12 flex items-center px-6 gap-6">
                  <div className="h-3.5 w-12 bg-slate-200/60 rounded" />
                  <div className="h-3.5 w-32 bg-slate-200/60 rounded" />
                  <div className="h-3.5 w-64 bg-slate-200/40 rounded" />
                  <div className="h-8 w-8 bg-slate-200/55 rounded-md ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Footer Mock */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <div className="h-4.5 w-48 bg-slate-200/60 rounded" />
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
