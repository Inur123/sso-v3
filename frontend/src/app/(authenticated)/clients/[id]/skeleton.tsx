"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ClientDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 animate-pulse">
      {/* Tombol Kembali Skeleton (Presisi h-8 w-[124px] sesuai tombol fisik) */}
      <div className="flex items-center">
        <div className="h-8 w-[124px] bg-slate-200 rounded-full" />
      </div>

      <div className="w-full space-y-6">
        {/* Card Detail Utama */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 space-y-2">
            {/* Judul Aplikasi */}
            <div className="h-6 w-40 bg-slate-200 rounded-md" />
            {/* Deskripsi */}
            <div className="h-3 w-80 bg-slate-200/70 rounded" />
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Client ID Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="flex items-center space-x-2">
                <div className="h-9 flex-1 bg-slate-100 rounded" />
                <div className="h-9 w-9 bg-slate-200 rounded-md" />
              </div>
            </div>

            {/* Client Secret Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="flex items-center space-x-2">
                <div className="h-9 flex-1 bg-slate-100 rounded" />
                <div className="h-9 w-9 bg-slate-200 rounded-md" />
                <div className="h-9 w-9 bg-slate-200 rounded-md" />
              </div>
            </div>

            {/* Redirect URIs Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-36 bg-slate-200 rounded" />
              <div className="rounded-lg border border-slate-200 bg-slate-50/30 p-3">
                <div className="h-3 w-64 bg-slate-200/70 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card Skeleton */}
        <Card className="border border-red-200 bg-red-50/10 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-red-100 bg-red-50/20 py-3">
            <div className="h-3 w-36 bg-red-200 rounded" />
          </CardHeader>
          <CardContent className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-96 bg-slate-200/70 rounded" />
            </div>
            <div className="h-9 w-32 bg-red-200 rounded-md shrink-0" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
