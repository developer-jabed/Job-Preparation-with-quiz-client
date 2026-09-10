// components/modules/question-report/AdminReportsTable.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AdminQuestionReport,
  ReportStatus,
  updateReportStatus,
} from "@/service/questionReport/questionReport.service";
import { ReportStatusBadge } from "./ReportStatusBadge";
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Flag,
  User,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_OPTIONS: {
  value: ReportStatus;
  label: string;
  icon: React.ElementType;
  className?: string;
}[] = [
  { value: "PENDING", label: "Mark Pending", icon: Clock },
  { value: "REVIEWED", label: "Mark Reviewed", icon: Eye },
  { value: "RESOLVED", label: "Mark Resolved", icon: CheckCircle2 },
  {
    value: "REJECTED",
    label: "Reject",
    icon: XCircle,
    className: "text-red-600 focus:text-red-600",
  },
];

function ReportRow({ report }: { report: AdminQuestionReport }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatus = (status: ReportStatus) => {
    startTransition(async () => {
      const res = await updateReportStatus(report.id, status);
      if (res.success) {
        toast.success(res.message || "Status updated");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update");
      }
    });
  };

  return (
    <TableRow className="group hover:bg-muted/40">
      <TableCell className="max-w-[280px]">
        <p className="line-clamp-2 text-sm font-medium leading-relaxed">
          {report.question.questionText}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {report.question.subject.name}
          </span>
          <span>•</span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
            {report.question.difficulty}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{report.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {report.user.email}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
            <Flag className="h-3 w-3 text-orange-500" />
            {report.reason}
          </span>
          {report.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground max-w-[200px]">
              {report.description}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <ReportStatusBadge status={report.status} />
      </TableCell>

      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(report.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </TableCell>

      <TableCell className="text-right pr-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isPending}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/dashboard/questions/${report.questionId}`}
                className="gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                View question
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = report.status === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  disabled={isCurrent || isPending}
                  onClick={() => handleStatus(opt.value)}
                  className={cn("gap-2", opt.className)}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                  {isCurrent && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      current
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function AdminReportsTable({
  reports,
}: {
  reports: AdminQuestionReport[];
}) {
  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Flag className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium">No reports found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Question reports from learners will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Question</TableHead>
            <TableHead className="w-[180px]">Reporter</TableHead>
            <TableHead className="w-[200px]">Reason</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[110px]">Date</TableHead>
            <TableHead className="w-12 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((r) => (
            <ReportRow key={r.id} report={r} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}