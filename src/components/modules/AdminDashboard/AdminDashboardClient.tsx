// components/modules/dashboard/AdminDashboardClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Flag,
  TrendingUp,
  Activity,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ───────── types (match backend response) ───────── */
type AdminDashboardData = {
  kpis: {
    learners: { total: number; active: number; newThisWeek: number };
    questions: {
      total: number;
      active: number;
      byDifficulty: Record<string, number>;
    };
    extraction: {
      pendingReview: number;
      needsEdit: number;
      queueTotal: number;
    };
    pdfs: { total: number; byStatus: Record<string, number> };
    tests: { total: number; active: number };
    attempts: {
      total: number;
      completed: number;
      today: number;
      thisWeek: number;
      completionRate: number;
    };
    reports: { pending: number };
  };
  recent: {
    learners: Array<{
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      createdAt: string;
      isActive: boolean;
    }>;
    attempts: Array<{
      id: string;
      obtainedMarks: number | null;
      totalMarks: number | null;
      accuracy: number | null;
      submittedAt: string | null;
      user: { id: string; name: string; avatar: string | null };
      test: { id: string; title: string; testType: string };
    }>;
    reports: Array<{
      id: string;
      reason: string;
      createdAt: string;
      user: { id: string; name: string };
      question: {
        id: string;
        questionText: string;
        subject: { name: string };
      };
    }>;
    pdfs: Array<{
      id: string;
      originalName: string;
      status: string;
      createdAt: string;
      uploadedBy: { id: string; name: string };
      subject: { id: string; name: string } | null;
      _count: { extractedQuestions: number };
    }>;
  };
};

type ChartsData = {
  attemptsOverTime: Array<{
    date: string;
    total: number;
    completed: number;
  }>;
  newLearnersOverTime: Array<{ date: string; count: number }>;
} | null;

/* ───────── helpers ───────── */
function fmtDate(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ───────── KPI card ───────── */
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  href,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  accent: string;
  href?: string;
  delay?: number;
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
        "hover:shadow-md transition-shadow"
      )}
    >
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          accent
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm",
            accent
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

/* ───────── Mini bar chart (CSS + motion) ───────── */
function MiniBars({
  data,
  color = "bg-violet-500",
}: {
  data: Array<{ date: string; total: number; completed: number }>;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-1 h-28 w-full">
      {data.map((d, i) => (
        <motion.div
          key={d.date}
          className="flex-1 flex flex-col items-center gap-1 group"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
        >
          <div className="relative w-full flex-1 flex items-end">
            <motion.div
              className={cn("w-full rounded-t-sm", color)}
              initial={{ height: 0 }}
              animate={{ height: `${(d.total / max) * 100}%` }}
              transition={{
                delay: 0.2 + i * 0.025,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              title={`${d.date}: ${d.total} attempts`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────── Difficulty pills ───────── */
function DifficultyBars({
  byDifficulty,
}: {
  byDifficulty: Record<string, number>;
}) {
  const total =
    (byDifficulty.EASY || 0) +
    (byDifficulty.MEDIUM || 0) +
    (byDifficulty.HARD || 0) || 1;

  const items = [
    { key: "EASY", label: "Easy", color: "bg-emerald-500", count: byDifficulty.EASY || 0 },
    { key: "MEDIUM", label: "Medium", color: "bg-amber-500", count: byDifficulty.MEDIUM || 0 },
    { key: "HARD", label: "Hard", color: "bg-red-500", count: byDifficulty.HARD || 0 },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-muted-foreground">{item.label}</span>
            <span className="tabular-nums font-semibold">{item.count}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", item.color)}
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / total) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── Main component ───────── */
export function AdminDashboardClient({
  data,
  charts,
  error,
}: {
  data: AdminDashboardData | null;
  charts: ChartsData;
  error?: string | null;
}) {
  const heroRef = useRef<HTMLDivElement>(null);

  // Subtle GSAP entrance on hero
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".gsap-hero-line", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-5 text-center dark:border-red-900 dark:bg-red-950/40">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-3 font-medium text-red-800 dark:text-red-200">
            {error || "Failed to load dashboard"}
          </p>
        </div>
      </div>
    );
  }

  const { kpis, recent } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* ── Hero ── */}
        <div ref={heroRef} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="gsap-hero-line text-sm font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Overview
            </p>
            <h1 className="gsap-hero-line mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="gsap-hero-line mt-1 text-sm text-muted-foreground">
              Platform health, content pipeline, and learner activity
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            Live · updated just now
          </motion.div>
        </div>

        {/* ── KPI grid ── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            title="Learners"
            value={kpis.learners.total}
            subtitle={`${kpis.learners.active} active · +${kpis.learners.newThisWeek} this week`}
            icon={Users}
            accent="bg-violet-500"
            href="/admin/dashboard/learners"
            delay={0.05}
          />
          <KpiCard
            title="Questions"
            value={kpis.questions.total}
            subtitle={`${kpis.questions.active} live in bank`}
            icon={BookOpen}
            accent="bg-blue-500"
            delay={0.1}
          />
          <KpiCard
            title="Review queue"
            value={kpis.extraction.queueTotal}
            subtitle={`${kpis.extraction.pendingReview} pending · ${kpis.extraction.needsEdit} needs edit`}
            icon={Sparkles}
            accent="bg-amber-500"
            href="/admin/dashboard/pdf-uploads"
            delay={0.15}
          />
          <KpiCard
            title="Reports"
            value={kpis.reports.pending}
            subtitle="Awaiting moderation"
            icon={Flag}
            accent="bg-rose-500"
            href="/admin/dashboard/reports"
            delay={0.2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            title="PDF uploads"
            value={kpis.pdfs.total}
            subtitle={`${kpis.pdfs.byStatus?.EXTRACTED || 0} extracted`}
            icon={FileText}
            accent="bg-indigo-500"
            href="/admin/dashboard/pdf-uploads"
            delay={0.22}
          />
          <KpiCard
            title="Tests"
            value={kpis.tests.total}
            subtitle={`${kpis.tests.active} active`}
            icon={ClipboardList}
            accent="bg-cyan-500"
            delay={0.25}
          />
          <KpiCard
            title="Attempts"
            value={kpis.attempts.total}
            subtitle={`${kpis.attempts.today} today · ${kpis.attempts.thisWeek} this week`}
            icon={TrendingUp}
            accent="bg-emerald-500"
            delay={0.28}
          />
          <KpiCard
            title="Completion"
            value={`${kpis.attempts.completionRate}%`}
            subtitle={`${kpis.attempts.completed} completed`}
            icon={CheckCircle2}
            accent="bg-teal-500"
            delay={0.31}
          />
        </div>

        {/* ── Charts + difficulty ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-violet-500" />
                  Attempts (14 days)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily test attempts across the platform
                </p>
              </div>
            </div>
            {charts?.attemptsOverTime?.length ? (
              <MiniBars data={charts.attemptsOverTime} />
            ) : (
              <div className="h-28 flex items-center justify-center text-sm text-muted-foreground">
                No attempt data yet
              </div>
            )}
            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
              <span>{charts?.attemptsOverTime?.[0]?.date}</span>
              <span>
                {charts?.attemptsOverTime?.[charts.attemptsOverTime.length - 1]
                  ?.date}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-blue-500" />
              Difficulty mix
            </h2>
            <DifficultyBars byDifficulty={kpis.questions.byDifficulty} />
          </motion.div>
        </div>

        {/* ── Activity columns ── */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {/* Recent learners */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl border bg-card shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-500" />
                New learners
              </h2>
              <Link
                href="/admin/dashboard/learners"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="divide-y">
              {recent.learners.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No learners yet
                </li>
              )}
              {recent.learners.map((u, i) => (
                <motion.li
                  key={u.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    {u.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.avatar}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      initials(u.name)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {fmtDate(u.createdAt)}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          {/* Recent attempts */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border bg-card shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Recent attempts
              </h2>
            </div>
            <ul className="divide-y">
              {recent.attempts.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No completed attempts
                </li>
              )}
              {recent.attempts.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.04 }}
                  className="px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {a.user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.test.title}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-emerald-600">
                        {a.accuracy != null ? `${Math.round(a.accuracy)}%` : "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {fmtDate(a.submittedAt)}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          {/* Reports + PDFs stacked on xl */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="rounded-2xl border bg-card shadow-sm overflow-hidden xl:row-span-1"
          >
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Flag className="h-4 w-4 text-rose-500" />
                Open reports
              </h2>
              <Link
                href="/admin/dashboard/reports"
                className="text-xs font-medium text-primary hover:underline"
              >
                Manage
              </Link>
            </div>
            <ul className="divide-y">
              {recent.reports.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  All clear — no pending reports
                </li>
              )}
              {recent.reports.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                  className="px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <p className="text-sm font-medium line-clamp-1">
                    {r.question.questionText}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md border bg-background px-1.5 py-0.5 font-medium text-foreground">
                      {r.reason}
                    </span>
                    <span>{r.user.name}</span>
                    <span>·</span>
                    <span>{fmtDate(r.createdAt)}</span>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* Recent PDFs footer */}
            <div className="border-t bg-muted/20 px-5 py-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Latest PDFs
              </p>
              <div className="space-y-2">
                {recent.pdfs.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/dashboard/pdf-uploads/${p.id}`}
                    className="flex items-center justify-between gap-2 text-xs hover:text-primary transition-colors"
                  >
                    <span className="truncate font-medium">
                      {p.originalName}
                    </span>
                    <span className="shrink-0 inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {p.status}
                    </span>
                  </Link>
                ))}
                {recent.pdfs.length === 0 && (
                  <p className="text-xs text-muted-foreground">No uploads yet</p>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}