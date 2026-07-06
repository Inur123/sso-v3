"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UserDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen animate-pulse">
      {/* Breadcrumbs placeholder */}
      <div className="flex items-center space-x-1">
        <div className="h-3 w-12 bg-slate-200 rounded" />
        <span className="text-slate-300 text-xs">/</span>
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <span className="text-slate-300 text-xs">/</span>
        <div className="h-3 w-20 bg-slate-200 rounded" />
      </div>

      {/* Title + Kembali button */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-80 bg-slate-200/70 rounded" />
        </div>
        <div className="h-9 w-24 bg-slate-200/80 rounded-md" />
      </div>

      {/* Main Detail Card — full width */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        {/* Card Header: Avatar + Nama + tombol aksi */}
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-5 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar shimmer */}
            <div className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4.5 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-52 bg-slate-200/70 rounded" />
            </div>
          </div>
          {/* Tombol aksi shimmer */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-slate-200/80 rounded-md" />
            <div className="h-9 w-20 bg-slate-200/80 rounded-md" />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-b border-slate-100">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200/60 rounded" />
              <div className="h-4 w-64 bg-slate-200/80 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-28 bg-slate-200/60 rounded" />
              <div className="h-5 w-16 bg-slate-200/70 rounded-full" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-b border-slate-100">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-slate-200/60 rounded" />
              <div className="h-5 w-14 bg-slate-200/70 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200/60 rounded" />
              <div className="h-4 w-40 bg-slate-200/80 rounded" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <div className="h-3 w-36 bg-slate-200/60 rounded" />
              <div className="h-5 w-24 bg-slate-200/70 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
