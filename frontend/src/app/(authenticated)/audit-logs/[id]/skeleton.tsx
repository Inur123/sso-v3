"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AuditLogDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen animate-pulse">
      {/* Header Area */}
      <div className="flex items-center space-x-2">
        <div className="h-5 w-40 bg-slate-200 rounded" />
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-2">
          {/* Title */}
          <div className="h-7 w-64 bg-slate-200 rounded" />
          {/* Subtitle */}
          <div className="h-3.5 w-80 bg-slate-200/70 rounded" />
        </div>
        {/* Back Button Placeholder */}
        <div className="h-9 w-24 bg-slate-200 rounded-md" />
      </div>

      {/* Detail Card Skeleton */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="h-4.5 w-48 bg-slate-200 rounded" />
        </CardHeader>
        <CardContent className="p-6 divide-y divide-slate-100">
          {/* Row 1: Waktu & Aksi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 first:pt-0">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-200/80 rounded" />
              <div className="h-4.5 w-44 bg-slate-200/60 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-12 bg-slate-200/80 rounded" />
              <div className="h-5 w-24 bg-slate-200/50 rounded-full" />
            </div>
          </div>

          {/* Row 2: Pelaku & IP Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-slate-200/80 rounded" />
              <div className="h-4.5 w-64 bg-slate-200/60 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200/80 rounded" />
              <div className="h-4.5 w-32 bg-slate-200/60 rounded" />
            </div>
          </div>

          {/* Row 3: User Agent */}
          <div className="py-4 space-y-2">
            <div className="h-3 w-24 bg-slate-200/80 rounded" />
            <div className="h-10 w-full bg-slate-200/40 rounded" />
          </div>

          {/* Row 4: Detail Metadata */}
          <div className="py-4 last:pb-0 space-y-2">
            <div className="h-3 w-28 bg-slate-200/80 rounded" />
            <div className="h-12 w-full bg-slate-200/40 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
