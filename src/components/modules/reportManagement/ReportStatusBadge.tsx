// components/modules/question-report/ReportStatusBadge.tsx
import { Badge } from "@/components/ui/badge";

import { Clock, Eye, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportStatus } from "@/service/questionReport/questionReport.service";

const config: Record<
  ReportStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  REVIEWED: {
    label: "Reviewed",
    icon: Eye,
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300",
  },
};

export function ReportStatusBadge({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  const cfg = config[status] || config.PENDING;
  const Icon = cfg.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium border px-2.5 py-0.5",
        cfg.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </Badge>
  );
}