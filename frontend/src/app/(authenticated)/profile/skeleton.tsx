"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 animate-pulse">
      {/* Grid Layout Dashboard */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card Profil Utama Skeleton */}
        <Card className="border border-slate-200 bg-white shadow-sm md:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
            <div className="h-5 w-5 bg-slate-200 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-44 bg-slate-200/70 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-52 bg-slate-200/70 rounded" />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-36 bg-slate-200/70 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Sesi Aktif Skeleton */}
        <Card className="border border-slate-200 bg-white shadow-sm col-span-1 overflow-hidden">
          <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
            <div className="h-5 w-5 bg-slate-200 rounded-full" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="h-4 w-40 bg-slate-200/70 rounded" />
            <div className="h-4 w-48 bg-slate-200/70 rounded" />
            <div className="h-4 w-32 bg-slate-200/70 rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
