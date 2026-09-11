/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(learner)/dashboard/LearnerDashboardClient.tsx
"use client";

import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  Brain,
  CheckCircle2,
  Clock,
  Flag,
  Flame,
  PlayCircle,
  Target,
  TrendingUp,
  XCircle,
  ArrowRight,
  BarChart3,
  Calendar,
} from "lucide-react";

interface Props {
  data: any; // replace with proper type from your action
  charts: any;
  error?: string;
}

export default function LearnerDashboardClient({ data, charts, error }: Props) {
  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700 dark:border-red-900 dark:bg-red-950/40">
        {error || "Failed to load dashboard"}
      </div>
    );
  }

  const { profile, kpis, bySubject, recentAttempts, upcomingReviews } = data;

  const studyHours = Math.floor((kpis.totalStudySeconds || 0) / 3600);
  const studyMinutes = Math.floor(((kpis.totalStudySeconds || 0) % 3600) / 60);

  return (
    <div className="space-y-8">
      {/* ─── Header / Welcome ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-500/20"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {profile.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back, {profile.name?.split(" ")[0] || "Learner"}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Keep the momentum going. You’re doing great!
            </p>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 dark:border-orange-900 dark:bg-orange-950/40">
          <Flame className="h-6 w-6 text-orange-500" />
          <div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {profile.streakDays ?? 0}
            </p>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
              Day Streak
            </p>
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="Avg Accuracy"
          value={`${kpis.avgAccuracy}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="emerald"
        />
        <KpiCard
          label="Completed"
          value={kpis.completedAttempts}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="blue"
        />
        <KpiCard
          label="In Progress"
          value={kpis.inProgressAttempts}
          icon={<PlayCircle className="h-5 w-5" />}
          color="violet"
        />
        <KpiCard
          label="Reviews Due"
          value={kpis.reviewsDue}
          icon={<Brain className="h-5 w-5" />}
          color="amber"
          href="/spaced-review"
        />
        <KpiCard
          label="Bookmarks"
          value={kpis.bookmarks}
          icon={<Bookmark className="h-5 w-5" />}
          color="pink"
          href="/bookmarks"
        />
        <KpiCard
          label="Study Time"
          value={studyHours > 0 ? `${studyHours}h ${studyMinutes}m` : `${studyMinutes}m`}
          icon={<Clock className="h-5 w-5" />}
          color="cyan"
        />
      </div>

      {/* ─── Quick Actions ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction
          href="/practice"
          icon={<BookOpen className="h-5 w-5" />}
          label="Practice"
          color="bg-blue-600 hover:bg-blue-700"
        />
        <QuickAction
          href="/spaced-review"
          icon={<Brain className="h-5 w-5" />}
          label="Spaced Review"
          badge={kpis.reviewsDue > 0 ? kpis.reviewsDue : undefined}
          color="bg-violet-600 hover:bg-violet-700"
        />
        <QuickAction
          href="/bookmarks"
          icon={<Bookmark className="h-5 w-5" />}
          label="Bookmarks"
          color="bg-pink-600 hover:bg-pink-700"
        />
        <QuickAction
          href="/analytics"
          icon={<BarChart3 className="h-5 w-5" />}
          label="Analytics"
          color="bg-emerald-600 hover:bg-emerald-700"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ─── Left Column ────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-3">
          {/* Subject Progress */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subject Progress
              </h2>
            </div>

            {bySubject.length === 0 ? (
              <EmptyCard message="Complete some tests to see subject progress" />
            ) : (
              <div className="space-y-3">
                {bySubject.map((subject: any) => (
                  <div
                    key={subject.subjectId}
                    className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {subject.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {subject.attempts} attempt{subject.attempts !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {subject.avgAccuracy}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${Math.min(subject.avgAccuracy, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Attempts */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Attempts
              </h2>
              <Link
                href="/attempts"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                View all
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <EmptyCard message="No attempts yet. Start practicing!" />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentAttempts.map((attempt: any) => (
                    <li key={attempt.id}>
                      <Link
                        href={`/attempts/${attempt.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 dark:text-white">
                            {attempt.test?.title || "Untitled Test"}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {attempt.test?.testType} •{" "}
                            {attempt.submittedAt
                              ? new Date(attempt.submittedAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "In progress"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {attempt.status === "COMPLETED" ? (
                            <>
                              <span className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                                {attempt.obtainedMarks}/{attempt.totalMarks}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  (attempt.accuracy ?? 0) >= 70
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                    : (attempt.accuracy ?? 0) >= 40
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                                }`}
                              >
                                {attempt.accuracy ?? 0}%
                              </span>
                            </>
                          ) : (
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              In Progress
                            </span>
                          )}
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* ─── Right Column ───────────────────────────────── */}
        <div className="space-y-8 lg:col-span-2">
          {/* Stats Summary */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Answer Stats
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950/40">
                <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {kpis.totalCorrect}
                </p>
                <p className="text-xs text-emerald-600/80">Correct</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-center dark:bg-red-950/40">
                <XCircle className="mx-auto mb-1 h-5 w-5 text-red-600" />
                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                  {kpis.totalWrong}
                </p>
                <p className="text-xs text-red-600/80">Wrong</p>
              </div>
              <div className="rounded-xl bg-gray-100 p-3 text-center dark:bg-gray-800">
                <Target className="mx-auto mb-1 h-5 w-5 text-gray-500" />
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {kpis.totalSkipped}
                </p>
                <p className="text-xs text-gray-500">Skipped</p>
              </div>
            </div>
          </section>

          {/* Upcoming Reviews */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Calendar className="h-5 w-5 text-violet-500" />
                Upcoming Reviews
              </h2>
              <Link
                href="/spaced-review"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Review now
              </Link>
            </div>

            {upcomingReviews.length === 0 ? (
              <EmptyCard message="No upcoming reviews" />
            ) : (
              <div className="space-y-2">
                {upcomingReviews.map((review: any) => {
                  const isDue = new Date(review.nextReviewAt) <= new Date();
                  return (
                    <div
                      key={review.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {review.question.subject?.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            isDue
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {isDue
                            ? "Due now"
                            : new Date(review.nextReviewAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-800 dark:text-gray-200">
                        {review.question.questionText}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Accuracy Trend (simple) */}
          {charts?.accuracyTrend?.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Accuracy Trend
              </h2>
              <div className="flex h-32 items-end gap-1">
                {charts.accuracyTrend.slice(-14).map((point: any, i: number) => (
                  <div
                    key={i}
                    className="group relative flex-1 rounded-t bg-blue-500/80 transition hover:bg-blue-600"
                    style={{
                      height: `${Math.max(point.accuracy || 0, 4)}%`,
                    }}
                    title={`${point.date}: ${point.accuracy}%`}
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                Last {Math.min(charts.accuracyTrend.length, 14)} completed tests
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Small reusable pieces
// ────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "violet" | "amber" | "pink" | "cyan";
  href?: string;
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
    cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
  };

  const content = (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickAction({
  href,
  icon,
  label,
  color,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition ${color}`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
      {message}
    </div>
  );
}