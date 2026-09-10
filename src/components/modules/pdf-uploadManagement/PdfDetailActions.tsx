// components/modules/pdf-uploadManagement/PdfDetailActions.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  startAIExtraction,
  deletePdf,
  PdfStatus,
} from "@/service/pdf-upload/pdfUpload.service";
import {
  Sparkles,
  Trash2,
  ExternalLink,
  MoreVertical,
  RefreshCw,
  Loader2,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  pdfId: string;
  status: PdfStatus;
  fileUrl: string;
  questionCount: number;
}

export function PdfDetailActions({
  pdfId,
  status,
  fileUrl,
  questionCount,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isProcessing = status === "PROCESSING";
  const canExtract =
    status === "UPLOADED" || status === "FAILED" || status === "EXTRACTED";

  const handleExtract = () => {
    startTransition(async () => {
      toast.loading("Starting AI extraction…", { id: "extract" });
      const res = await startAIExtraction(pdfId);
      if (res.success) {
        toast.success(res.message || "Extraction completed", { id: "extract" });
        router.refresh();
      } else {
        toast.error(res.message || "Extraction failed", { id: "extract" });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deletePdf(pdfId);
      if (res.success) {
        toast.success(res.message || "PDF deleted");
        router.push("/admin/dashboard/pdf-uploads");
      } else {
        toast.error(res.message || "Delete failed");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Processing state */}
      {isProcessing && (
        <Button disabled className="gap-2 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing…
        </Button>
      )}

      {/* Extract / Re-run */}
      {canExtract && (
        <Button
          onClick={handleExtract}
          disabled={isPending}
          className="gap-2 shadow-sm"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {status === "EXTRACTED" ? "Re-run Extraction" : "Start AI Extraction"}
        </Button>
      )}

      {/* View PDF */}
      <Button variant="outline" className="gap-2" asChild>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
          View PDF
        </a>
      </Button>

      {/* More menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={isPending}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => router.refresh()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh status
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={fileUrl}
              download
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete PDF
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this PDF?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the file and all{" "}
                  {questionCount > 0
                    ? `${questionCount} extracted question${
                        questionCount > 1 ? "s" : ""
                      }`
                    : "associated data"}
                  . This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}