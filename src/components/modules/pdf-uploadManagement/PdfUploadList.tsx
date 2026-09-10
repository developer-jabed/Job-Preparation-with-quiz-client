"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PdfStatusBadge } from "./PdfStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { deletePdf, PdfUpload, startAIExtraction } from "@/service/pdf-upload/pdfUpload.service";

export function PdfUploadList({ initialData }: { initialData: PdfUpload[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleExtract = (id: string) => {
    startTransition(async () => {
      const result = await startAIExtraction(id);
      if (result.success) {
        toast.success(result.message || "Extraction started");
        router.refresh();
      } else {
        toast.error(result.message || "Extraction failed");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this PDF and all extracted questions?")) return;
    startTransition(async () => {
      const result = await deletePdf(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  if (initialData.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        No PDFs uploaded yet. Upload a question paper to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Exam / Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialData.map((pdf) => (
            <TableRow key={pdf.id}>
              <TableCell className="font-medium max-w-[220px] truncate">
                {pdf.originalName}
              </TableCell>
              <TableCell>{pdf.subject?.name || "—"}</TableCell>
              <TableCell>
                {pdf.examName || "—"}
                {pdf.year ? ` (${pdf.year})` : ""}
              </TableCell>
              <TableCell>
                <PdfStatusBadge status={pdf.status} />
              </TableCell>
              <TableCell>
                {pdf._count?.extractedQuestions ?? 0}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(pdf.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/dashboard/pdf-uploads/${pdf.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </Link>
                    </DropdownMenuItem>

                    {(pdf.status === "UPLOADED" || pdf.status === "FAILED") && (
                      <DropdownMenuItem onClick={() => handleExtract(pdf.id)}>
                        <Play className="mr-2 h-4 w-4" />
                        Start AI Extraction
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(pdf.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}