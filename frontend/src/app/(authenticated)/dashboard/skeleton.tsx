"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          {/* Judul Halo Admin/User */}
          <div className="h-7 w-56 bg-indigo-200/60 rounded-md" />
          {/* Deskripsi Pemuatan */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-full bg-slate-200/70 rounded" />
            <div className="h-3.5 w-3/4 bg-slate-200/70 rounded" />
          </div>
        </div>
        {/* Bulatan Avatar Kanan */}
        <div className="hidden md:block h-12 w-12 bg-indigo-100/80 rounded-xl shrink-0" />
      </div>

      {/* Grid Dua Kartu Statistik Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu 1: Profil Saya Skeleton */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
              <div className="h-5 w-5 bg-indigo-100 rounded-full" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200/60 rounded" />
                <div className="h-4 w-36 bg-slate-200/70 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200/60 rounded" />
                <div className="h-4 w-44 bg-slate-200/70 rounded" />
              </div>
            </CardContent>
          </div>
          {/* Footer Area Skeleton */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
            <div className="h-4 w-32 bg-slate-200/60 rounded" />
          </div>
        </Card>

        {/* Kartu 2: Keamanan Sesi Skeleton */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
              <div className="h-5 w-5 bg-indigo-100 rounded-full" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200/60 rounded" />
                <div className="h-4 w-28 bg-slate-200/70 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-28 bg-slate-200/60 rounded" />
                <div className="h-4 w-40 bg-slate-200/70 rounded" />
              </div>
            </CardContent>
          </div>
          {/* Footer Area Skeleton */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
            <div className="h-4 w-32 bg-slate-200/60 rounded" />
          </div>
        </Card>
      </div>
    </div>
  );
}
