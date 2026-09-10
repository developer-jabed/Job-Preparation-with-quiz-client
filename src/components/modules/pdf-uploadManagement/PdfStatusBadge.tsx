// components/modules/pdf-uploadManagement/PdfStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { PdfStatus } from "@/service/pdf-upload/pdfUpload.service";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  PdfStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  UPLOADED: {
    label: "Uploaded",
    icon: Upload,
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  PROCESSING: {
    label: "Processing…",
    icon: Loader2,
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  EXTRACTED: {
    label: "Extracted",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  },
};

export function PdfStatusBadge({
  status,
  className,
}: {
  status: PdfStatus;
  className?: string;
}) {
  const config = statusConfig[status] || statusConfig.UPLOADED;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium px-2.5 py-0.5 border",
        config.className,
        className
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          status === "PROCESSING" && "animate-spin"
        )}
      />
      {config.label}
    </Badge>
  );
}