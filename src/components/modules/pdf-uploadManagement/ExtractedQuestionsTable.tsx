// components/modules/pdf-uploadManagement/ExtractedQuestionsTable.tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExtractedQuestion,
  ReviewStatus,
  updateExtractedQuestionStatus,
  approveAndCreateQuestion,
} from "@/service/pdf-upload/pdfUpload.service";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Clock,
  Check,
  Ban,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const reviewStatusConfig: Record<
  ReviewStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    icon: Clock,
  },
  NEEDS_EDIT: {
    label: "Needs Edit",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300",
    icon: Edit3,
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300",
    icon: XCircle,
  },
};

const difficultyConfig: Record<string, { className: string }> = {
  EASY: {
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300",
  },
  MEDIUM: {
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300",
  },
  HARD: {
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300",
  },
};

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex min-w-[90px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-xs font-medium tabular-nums text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}

function QuestionRow({
  question,
  index,
  selected,
  onToggle,
}: {
  question: ExtractedQuestion;
  index: number;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const statusCfg =
    reviewStatusConfig[question.status] || reviewStatusConfig.PENDING;
  const StatusIcon = statusCfg.icon;
  const diffCfg =
    difficultyConfig[question.difficulty] || difficultyConfig.MEDIUM;

  const handleStatusUpdate = (status: ReviewStatus, reviewNote?: string) => {
    startTransition(async () => {
      const res = await updateExtractedQuestionStatus(
        question.id,
        status,
        reviewNote
      );
      if (res.success) {
        toast.success(res.message || "Status updated");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update");
      }
    });
  };

  const handleApproveAndCreate = () => {
    startTransition(async () => {
      const res = await approveAndCreateQuestion(question.id);
      if (res.success) {
        toast.success(res.message || "Added to Question Bank");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to approve");
      }
    });
  };

  return (
    <>
      <TableRow
        className={cn(
          "group cursor-pointer transition-colors hover:bg-muted/40",
          open && "bg-muted/30",
          selected && "bg-blue-50/50 dark:bg-blue-950/20"
        )}
      >
        {/* Checkbox */}
        <TableCell className="w-10 pl-4" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle(question.id)}
            aria-label={`Select question ${index + 1}`}
          />
        </TableCell>

        {/* Expand */}
        <TableCell className="w-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>

        <TableCell className="w-12 font-medium tabular-nums text-muted-foreground">
          {index + 1}
        </TableCell>

        <TableCell className="max-w-lg" onClick={() => setOpen((v) => !v)}>
          <p className="line-clamp-2 text-sm leading-relaxed">
            {question.questionText}
          </p>
          {question.questionType && (
            <span className="mt-1 inline-block text-[11px] uppercase tracking-wide text-muted-foreground">
              {question.questionType}
            </span>
          )}
        </TableCell>

        <TableCell>
          <Badge
            variant="outline"
            className={cn("border font-medium", diffCfg.className)}
          >
            {question.difficulty}
          </Badge>
        </TableCell>

        <TableCell>
          <ConfidenceBar score={question.confidenceScore} />
        </TableCell>

        <TableCell>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              statusCfg.className
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusCfg.label}
          </span>
        </TableCell>

        <TableCell className="pr-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={isPending}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("APPROVED")}
                className="gap-2"
              >
                <Check className="h-4 w-4 text-emerald-600" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleApproveAndCreate()}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4 text-violet-600" />
                Approve & Create
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("NEEDS_EDIT")}
                className="gap-2"
              >
                <Edit3 className="h-4 w-4 text-orange-600" />
                Needs Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("REJECTED")}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <Ban className="h-4 w-4" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("PENDING")}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Reset to Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Expanded detail */}
      {open && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={8} className="p-0">
            <div className="space-y-4 border-t border-border/50 px-6 py-4">
              {question.options?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Options
                  </h4>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {question.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={cn(
                          "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm",
                          opt.isCorrect
                            ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30"
                            : "border-border bg-background"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                            opt.isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {opt.key}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                        {opt.isCorrect && (
                          <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.explanation && (
                <div>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Explanation
                  </h4>
                  <p className="rounded-lg border bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground/90">
                    {question.explanation}
                  </p>
                </div>
              )}

              {question.reviewNote && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/30">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-medium text-amber-800 dark:text-amber-300">
                      Review note:{" "}
                    </span>
                    <span className="text-amber-900/90 dark:text-amber-200">
                      {question.reviewNote}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Correct:{" "}
                  <strong className="text-foreground">
                    {question.correctAnswers?.join(", ") || "—"}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  ID:{" "}
                  <code className="font-mono text-[11px]">
                    {question.id.slice(0, 8)}…
                  </code>
                </span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function ExtractedQuestionsTable({
  questions,
}: {
  questions: ExtractedQuestion[];
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const allIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const allSelected =
    questions.length > 0 && selectedIds.size === questions.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Bulk actions ──────────────────────────────────────
  const runBulk = (
    action: (id: string) => Promise<{ success: boolean; message?: string }>,
    successMsg: string
  ) => {
    if (selectedIds.size === 0) return;

    startTransition(async () => {
      const ids = Array.from(selectedIds);
      let successCount = 0;
      let failCount = 0;

      // Sequential to avoid overwhelming the server (you can switch to Promise.allSettled if preferred)
      for (const id of ids) {
        const res = await action(id);
        if (res.success) successCount++;
        else failCount++;
      }

      if (successCount > 0) {
        toast.success(`${successCount} question(s) ${successMsg}`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} question(s) failed`);
      }

      clearSelection();
      router.refresh();
    });
  };

  const bulkApprove = () =>
    runBulk(
      (id) => updateExtractedQuestionStatus(id, "APPROVED"),
      "approved"
    );

  const bulkApproveAndCreate = () =>
    runBulk((id) => approveAndCreateQuestion(id), "approved & created");

  const bulkNeedsEdit = () =>
    runBulk(
      (id) => updateExtractedQuestionStatus(id, "NEEDS_EDIT"),
      "marked as Needs Edit"
    );

  const bulkReject = () =>
    runBulk(
      (id) => updateExtractedQuestionStatus(id, "REJECTED"),
      "rejected"
    );

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium">No questions extracted yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Run AI extraction to pull questions from this PDF.
        </p>
      </div>
    );
  }

  const counts = questions.reduce(
    (acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-3">
      {/* Status summary chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {Object.entries(reviewStatusConfig).map(([key, cfg]) => {
          const count = counts[key] || 0;
          if (count === 0) return null;
          const Icon = cfg.icon;
          return (
            <span
              key={key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
                cfg.className
              )}
            >
              <Icon className="h-3 w-3" />
              {count} {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-3 shadow-sm backdrop-blur dark:border-blue-900 dark:bg-blue-950/60">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {selectedIds.size} selected
          </span>

          <div className="mx-1 h-4 w-px bg-blue-200 dark:bg-blue-800" />

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            disabled={isPending}
            onClick={bulkApprove}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Approve
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
            disabled={isPending}
            onClick={bulkApproveAndCreate}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Approve & Create
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-orange-300 bg-white text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300"
            disabled={isPending}
            onClick={bulkNeedsEdit}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Needs Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            disabled={isPending}
            onClick={bulkReject}
          >
            <Ban className="h-3.5 w-3.5" />
            Reject
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-8 gap-1.5 text-muted-foreground"
            onClick={clearSelection}
            disabled={isPending}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-10" />
              <TableHead className="w-12">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-[100px]">Difficulty</TableHead>
              <TableHead className="w-[120px]">Confidence</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-12 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                question={q}
                index={idx}
                selected={selectedIds.has(q.id)}
                onToggle={toggleOne}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}