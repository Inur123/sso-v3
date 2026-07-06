"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";

export function SessionsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/40 min-h-screen animate-pulse">
      
      {/* Breadcrumbs Placeholder */}
      <div className="flex items-center space-x-2 text-xs text-slate-200">
        <div className="h-3 w-10 bg-slate-200 rounded" />
        <span>/</span>
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>

      {/* Page Header Skeleton */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <History className="h-5.5 w-5.5 text-slate-200" />
            <div className="h-5 w-48 bg-slate-200 rounded" />
          </div>
          <div className="h-3 w-96 bg-slate-200/50 rounded" />
        </div>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/50">
                <TableHead className="w-12 text-center py-4">
                  <div className="h-3 w-6 bg-slate-200 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-48 py-4">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                </TableHead>
                <TableHead className="py-4">
                  <div className="h-3 w-36 bg-slate-200 rounded" />
                </TableHead>
                <TableHead className="w-40 py-4">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                </TableHead>
                <TableHead className="w-28 py-4">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </TableHead>
                <TableHead className="w-28 text-right py-4 pr-6">
                  <div className="h-3 w-12 bg-slate-200 rounded ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx} className="border-b border-slate-100">
                  <TableCell className="text-center py-4">
                    <div className="h-3.5 w-4 bg-slate-200/75 rounded mx-auto" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-3.5 w-32 bg-slate-200/75 rounded" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-7 w-64 bg-slate-200/50 rounded-md" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-3.5 w-36 bg-slate-200/75 rounded" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-6 w-20 bg-slate-200/70 rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <div className="h-8 w-24 bg-slate-200/60 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
