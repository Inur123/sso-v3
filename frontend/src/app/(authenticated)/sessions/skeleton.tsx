"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SessionsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 animate-pulse">
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Card Header Skeleton */}
        <CardHeader className="flex flex-row items-center space-x-3 border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="h-5 w-5 bg-indigo-100 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-80 bg-slate-200/70 rounded" />
          </div>
        </CardHeader>

        {/* Table Body Skeleton */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/70">
                <TableHead className="w-16 text-center">
                  <div className="h-3 w-6 bg-slate-200 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-48">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                </TableHead>
                <TableHead>
                  <div className="h-3 w-32 bg-slate-200 rounded" />
                </TableHead>
                <TableHead className="w-28 text-center">
                  <div className="h-3 w-16 bg-slate-200 rounded mx-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx} className="border-b border-slate-100">
                  <TableCell className="text-center">
                    <div className="h-3.5 w-4 bg-slate-200/75 rounded mx-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3.5 w-32 bg-slate-200/75 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3.5 w-72 bg-slate-200/60 rounded" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-7 w-20 bg-slate-200/70 rounded mx-auto" />
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
