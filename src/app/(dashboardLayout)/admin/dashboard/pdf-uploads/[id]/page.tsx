// app/admin/dashboard/pdf-uploads/[id]/page.tsx  (or your route)
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPdfById,
} from "@/service/pdf-upload/pdfUpload.service";
import { PdfStatusBadge } from "@/components/modules/pdf-uploadManagement/PdfStatusBadge";
import { ExtractedQuestionsTable } from "@/components/modules/pdf-uploadManagement/ExtractedQuestionsTable";
import { PdfDetailActions } from "@/components/modules/pdf-uploadManagement/PdfDetailActions";
import {
  ArrowLeft,
  FileText,
  HardDrive,
  Layers,
  User,
  Calendar,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // optional, or use toLocaleDateString

export const dynamic = "force-dynamic";


function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default async function PdfDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPdfById(id);
  if (!res.success || !res.data) notFound();

  const pdf = res.data;
  const questionCount = pdf.extractedQuestions?.length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0 rounded-full"
              asChild
            >
              <Link href="/admin/dashboard/pdf-uploads">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {pdf.originalName}
                </h1>
                <PdfStatusBadge status={pdf.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {pdf.subject.name}
                </span>
                {pdf.examName && (
                  <>
                    <span className="text-border">•</span>
                    <span>
                      {pdf.examName}
                      {pdf.year ? ` · ${pdf.year}` : ""}
                    </span>
                  </>
                )}
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(pdf.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions (client component) */}
          <PdfDetailActions
            pdfId={pdf.id}
            status={pdf.status}
            fileUrl={pdf.fileUrl}
            questionCount={questionCount}
          />
        </div>

        {/* ── Error banner ── */}
        {pdf.errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-medium">Extraction failed</p>
              <p className="mt-0.5 opacity-90">{pdf.errorMessage}</p>
            </div>
          </div>
        )}

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={HardDrive}
            label="File size"
            value={formatBytes(pdf.fileSize)}
            accent="slate"
          />
          <StatCard
            icon={Layers}
            label="Pages"
            value={pdf.pageCount != null ? String(pdf.pageCount) : "—"}
            accent="blue"
          />
          <StatCard
            icon={FileText}
            label="Questions"
            value={String(questionCount)}
            accent="violet"
            highlight={questionCount > 0}
          />
          <StatCard
            icon={User}
            label="Uploaded by"
            value={pdf.uploadedBy.name}
            accent="emerald"
          />
        </div>

        {/* ── Questions section ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Extracted Questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Review, approve, or reject questions pulled by AI
              </p>
            </div>
            {questionCount > 0 && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {questionCount} total
              </span>
            )}
          </div>

          <ExtractedQuestionsTable questions={pdf.extractedQuestions} />
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "slate",
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: "slate" | "blue" | "violet" | "emerald";
  highlight?: boolean;
}) {
  const accents = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        highlight && "ring-1 ring-violet-200 dark:ring-violet-800"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            accents[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}