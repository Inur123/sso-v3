"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ClientDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen animate-pulse">
      {/* Breadcrumbs Placeholder */}
      <div className="flex items-center space-x-2">
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </div>

      {/* Header Area */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          {/* Title */}
          <div className="h-6 w-64 bg-slate-200 rounded" />
          {/* Subtitle */}
          <div className="h-3 w-80 bg-slate-200/70 rounded" />
        </div>
        {/* Back Button */}
        <div className="h-9 w-24 bg-slate-200 rounded-md" />
      </div>

      <div className="w-full space-y-6">
        {/* Main Details Card (Presisi space-y-1 & divide-y) */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
            <div className="h-4.5 w-56 bg-slate-200 rounded" />
          </CardHeader>
          <CardContent className="p-6 divide-y divide-slate-100">
            
            {/* Row 1: Nama Aplikasi & Client ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 first:pt-0">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-200/80 rounded" />
                <div className="h-4.5 w-44 bg-slate-200/60 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-16 bg-slate-200/80 rounded" />
                <div className="flex items-center space-x-2 mt-1">
                  <div className="h-9 flex-1 bg-slate-100 rounded" />
                  <div className="h-9 w-9 bg-slate-200/50 rounded-md" />
                </div>
              </div>
            </div>

            {/* Row 2: Client Secret */}
            <div className="py-4 space-y-1">
              <div className="h-3 w-20 bg-slate-200/80 rounded" />
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-9 flex-1 bg-slate-100 rounded" />
                <div className="h-9 w-9 bg-slate-200/50 rounded-md" />
                <div className="h-9 w-9 bg-slate-200/50 rounded-md" />
              </div>
            </div>

            {/* Row 3: Redirect URIs */}
            <div className="py-4 last:pb-0 space-y-1">
              <div className="h-3 w-36 bg-slate-200/80 rounded" />
              <div className="rounded-lg border border-slate-200 bg-slate-50/30 p-3 space-y-1.5 mt-1">
                <div className="h-6 w-full bg-slate-200/40 rounded" />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Danger Zone Card (Desain Baru Bersih Tanpa Header Kaku) */}
        <Card className="border border-red-200 bg-red-50/10 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="space-y-1 border-b border-red-100 pb-3">
              <div className="h-3.5 w-36 bg-red-200 rounded" />
              <div className="h-3 w-96 bg-slate-200/50 rounded" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-64 bg-slate-200/50 rounded" />
              </div>
              <div className="h-9 w-32 bg-red-200 rounded-md shrink-0 self-start sm:self-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
