// components/modules/question-report/ReportStatusFilter.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReportStatus } from "@/service/questionReport/questionReport.service";

const FILTERS: { value: ReportStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

export function ReportStatusFilter({ basePath }: { basePath: string }) {
  const searchParams = useSearchParams();
  const current = (searchParams.get("status") as ReportStatus) || "ALL";

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = current === f.value || (f.value === "ALL" && !searchParams.get("status"));
        const href =
          f.value === "ALL" ? basePath : `${basePath}?status=${f.value}`;

        return (
          <Link
            key={f.value}
            href={href}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        );
      })}
    </div>
  );
}