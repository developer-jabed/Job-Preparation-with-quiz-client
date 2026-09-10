// components/modules/learner/LearnerStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

export function LearnerStatusBadge({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium border px-2.5 py-0.5",
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
        className
      )}
    >
      {isActive ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <Ban className="h-3.5 w-3.5" />
      )}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}