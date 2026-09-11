// app/(learner)/analytics/AnalyticsClient.tsx
"use client";

import {
  Trophy,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Medal,
  User,
} from "lucide-react";
import { LeaderboardEntry, WeakTopic, MyPerformance } from "@/service/analytics/analytics.service";
import Link from "next/link";

interface Props {
  performance: MyPerformance | null;
  weakTopics: WeakTopic[];
  leaderboard: LeaderboardEntry[];
  errors: {
    performance?: string;
    weakTopics?: string;
    leaderboard?: string;
  };
}

export default function AnalyticsClient({
  performance,
  weakTopics,
  leaderboard,
  errors,
}: Props) {
  return (
    <div className="space-y-8">
      {/* ─── Performance Summary Cards ───────────────────────── */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Performance Overview
        </h2>

        {errors.performance ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {errors.performance}
          </div>
        ) : !performance || performance.totalAttempts === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <Target className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">No completed tests yet</p>
            <Link
              href="/practice"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Total Attempts"
              value={performance.totalAttempts}
              icon={<Target className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              label="Avg. Accuracy"
              value={`${performance.averageAccuracy}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="emerald"
            />
            <StatCard
              label="Avg. Score"
              value={performance.averageScore}
              icon={<BarChart3 className="h-5 w-5" />}
              color="violet"
            />
            <StatCard
              label="Total Correct"
              value={performance.totalCorrect}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color="green"
            />
            <StatCard
              label="Total Wrong"
              value={performance.totalWrong}
              icon={<XCircle className="h-5 w-5" />}
              color="red"
            />
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ─── Weak Topics ───────────────────────────────────── */}
        <section className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Weak Topics
          </h2>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {errors.weakTopics ? (
              <div className="p-6 text-sm text-red-600">{errors.weakTopics}</div>
            ) : weakTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-400" />
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  No weak topics detected
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Keep practicing to maintain your strength!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {weakTopics.map((topic, index) => (
                  <li
                    key={topic.topicId}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {topic.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {topic.subject}
                        {topic.category ? ` • ${topic.category}` : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {topic.wrong}
                      </p>
                      <p className="text-xs text-gray-400">wrong</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ─── Leaderboard ───────────────────────────────────── */}
        <section className="lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {errors.leaderboard ? (
              <div className="p-6 text-sm text-red-600">{errors.leaderboard}</div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <Trophy className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-gray-500">No leaderboard data yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Rank</th>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 text-right font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.userId}
                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <td className="px-5 py-3.5">
                          <RankBadge rank={entry.rank} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {entry.avatar ? (
                              <img
                                src={entry.avatar}
                                alt={entry.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {entry.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                          {entry.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Small UI helpers
// ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "violet" | "green" | "red";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
        <Medal className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        <Medal className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
        <Medal className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      {rank}
    </span>
  );
}