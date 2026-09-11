"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Eye,
  Trophy,
  Target,
  Timer,
  BookOpen,
  Search,
  Ban,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils"; // adjust if you use a different cn helper
import { TestAttempt } from "@/service/test-attempt/testAttempt.service";

interface Props {
  initialAttempts: TestAttempt[];
  initialError: string | null;
}

const statusConfig = {
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Play,
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  TIMED_OUT: {
    label: "Timed Out",
    icon: AlertCircle,
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  ABANDONED: {
    label: "Abandoned",
    icon: Ban,
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
} as const;

type StatusFilter = "ALL" | keyof typeof statusConfig;

export function MyAttemptsClient({ initialAttempts, initialError }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filtered = useMemo(() => {
    return initialAttempts.filter((a) => {
      const matchesSearch =
        !search ||
        a.test?.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialAttempts, search, statusFilter]);

  const stats = useMemo(() => {
    const completed = initialAttempts.filter((a) => a.status === "COMPLETED");
    const totalMarks = completed.reduce((sum, a) => sum + (a.obtainedMarks ?? 0), 0);
    const totalPossible = completed.reduce((sum, a) => sum + (a.totalMarks ?? 0), 0);
    const avgAccuracy =
      completed.length > 0
        ? completed.reduce((sum, a) => sum + (a.accuracy ?? 0), 0) / completed.length
        : 0;

    return {
      total: initialAttempts.length,
      completed: completed.length,
      inProgress: initialAttempts.filter((a) => a.status === "IN_PROGRESS").length,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      overallScore: totalPossible > 0 ? Math.round((totalMarks / totalPossible) * 100) : 0,
    };
  }, [initialAttempts]);

  if (initialError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
          <XCircle className="h-8 w-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Couldn’t load attempts</h2>
        <p className="mt-2 max-w-md text-slate-500">{initialError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700">
            <BarChart3 className="h-3.5 w-3.5" />
            My Progress
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Attempts
          </h1>
          <p className="mt-1 text-slate-500">
            Review your past tests, scores and continue where you left off.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Attempts"
          value={stats.total}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Play}
          color="amber"
        />
        <StatCard
          label="Avg Accuracy"
          value={`${stats.avgAccuracy}%`}
          icon={Target}
          color="violet"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(["ALL", "COMPLETED", "IN_PROGRESS", "TIMED_OUT", "ABANDONED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                statusFilter === s
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {s === "ALL" ? "All" : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Attempts List */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={!!search || statusFilter !== "ALL"} />
      ) : (
        <div className="grid gap-4">
          {filtered.map((attempt) => (
            <AttemptCard key={attempt.id} attempt={attempt} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: "indigo" | "emerald" | "amber" | "violet";
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    violet: "bg-violet-500/10 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AttemptCard({ attempt }: { attempt: TestAttempt }) {
  const config = statusConfig[attempt.status];
  const StatusIcon = config.icon;

  const accuracy = attempt.accuracy != null ? Math.round(attempt.accuracy) : null;
  const scoreText =
    attempt.obtainedMarks != null && attempt.totalMarks != null
      ? `${attempt.obtainedMarks}/${attempt.totalMarks}`
      : "—";

  const timeTaken =
    attempt.timeTakenSeconds != null
      ? formatDuration(attempt.timeTakenSeconds)
      : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      {/* left accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          attempt.status === "COMPLETED" && "bg-emerald-500",
          attempt.status === "IN_PROGRESS" && "bg-amber-500",
          attempt.status === "TIMED_OUT" && "bg-rose-500",
          attempt.status === "ABANDONED" && "bg-slate-400"
        )}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: title + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {attempt.test?.title ?? "Untitled Test"}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                config.bg,
                config.text,
                config.border
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
              {config.label}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Started {format(new Date(attempt.startedAt), "dd MMM yyyy, HH:mm")}
            </span>
            {attempt.submittedAt && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Submitted {format(new Date(attempt.submittedAt), "dd MMM yyyy, HH:mm")}
              </span>
            )}
            {timeTaken && (
              <span className="inline-flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                {timeTaken}
              </span>
            )}
          </div>
        </div>

        {/* Right: scores + actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {attempt.status !== "IN_PROGRESS" && (
            <div className="hidden text-right sm:block">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Score
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{scoreText}</p>
                </div>
                {accuracy != null && (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Accuracy
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        accuracy >= 70
                          ? "text-emerald-600"
                          : accuracy >= 40
                          ? "text-amber-600"
                          : "text-rose-600"
                      )}
                    >
                      {accuracy}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {attempt.status === "IN_PROGRESS" ? (
              <Link
                href={`/dashboard/learner/tests/${attempt.testId}/take?attemptId=${attempt.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
              >
                <Play className="h-4 w-4" />
                Continue
              </Link>
            ) : (
              <Link
                href={`/dashboard/learner/attempts/${attempt.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Eye className="h-4 w-4" />
                View Result
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile score row */}
      {attempt.status !== "IN_PROGRESS" && (
        <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-4 sm:hidden">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Score
            </p>
            <p className="text-sm font-semibold text-slate-800">{scoreText}</p>
          </div>
          {accuracy != null && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Accuracy
              </p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  accuracy >= 70
                    ? "text-emerald-600"
                    : accuracy >= 40
                    ? "text-amber-600"
                    : "text-rose-600"
                )}
              >
                {accuracy}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
        <Trophy className="h-8 w-8 text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">
        {hasFilters ? "No matching attempts" : "No attempts yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? "Try changing the search or filter to see more results."
          : "Start a test from the Tests section and your attempts will appear here."}
      </p>
      {!hasFilters && (
        <Link
          href="/tests"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <BookOpen className="h-4 w-4" />
          Browse Tests
        </Link>
      )}
    </div>
  );
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}