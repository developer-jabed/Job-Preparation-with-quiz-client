// app/(dashboardLayout)/admin/dashboard/reports/page.tsx
import { AdminReportsTable } from "@/components/modules/reportManagement/AdminReportsTable";
import { ReportStatusFilter } from "@/components/modules/reportManagement/ReportStatusFilter";
import {
  getAllReports,
  ReportStatus,
} from "@/service/questionReport/questionReport.service";

import { Flag, AlertCircle } from "lucide-react";


export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as ReportStatus | undefined;

  const res = await getAllReports(
    status && ["PENDING", "REVIEWED", "RESOLVED", "REJECTED"].includes(status)
      ? status
      : undefined
  );

  const reports = res.data || [];

  const counts = reports.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Question Reports
              </h1>
              <p className="text-sm text-muted-foreground">
                Review and resolve reports submitted by learners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1 font-medium tabular-nums">
              {reports.length} report{reports.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Error */}
        {!res.success && res.message && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{res.message}</p>
          </div>
        )}

        {/* Filter */}
        <ReportStatusFilter basePath="/admin/dashboard/reports" />

        {/* Summary chips (current page data) */}
        {reports.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(counts).map(([key, count]) => (
              <span
                key={key}
                className="rounded-full border bg-card px-2.5 py-1 font-medium text-muted-foreground"
              >
                {count} {key}
              </span>
            ))}
          </div>
        )}

        {/* Table */}
        <AdminReportsTable reports={reports} />
      </div>
    </div>
  );
}