// components/modules/analytics/LeaderboardClient.tsx
"use client";

import { Trophy, Medal, Award, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/service/analytics/analytics.service";

interface Props {
  entries: LeaderboardEntry[];
  error?: string;
}

const RANK_STYLES = {
  1: {
    badge: "bg-amber-400 text-amber-950 shadow-amber-400/40",
    border: "border-amber-300/80",
    side: "bg-amber-400",
    icon: Trophy,
    label: "1st",
  },
  2: {
    badge: "bg-slate-300 text-slate-800 shadow-slate-400/30",
    border: "border-slate-300/80",
    side: "bg-slate-400",
    icon: Medal,
    label: "2nd",
  },
  3: {
    badge: "bg-orange-300 text-orange-950 shadow-orange-400/30",
    border: "border-orange-300/70",
    side: "bg-orange-400",
    icon: Award,
    label: "3rd",
  },
} as const;

export default function LeaderboardClient({ entries, error }: Props) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <TrendingUp className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">
          No rankings yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Complete a few practice tests to appear on the leaderboard.
        </p>
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8">
      {/* ── Podium (Top 3) ── */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {top3.map((entry) => {
            const style =
              RANK_STYLES[entry.rank as 1 | 2 | 3] ?? RANK_STYLES[3];
            const Icon = style.icon;

            return (
              <div
                key={entry.userId}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
                  style.border,
                  entry.rank === 1 && "sm:order-2 sm:-translate-y-2",
                  entry.rank === 2 && "sm:order-1",
                  entry.rank === 3 && "sm:order-3"
                )}
              >
                {/* Side accent */}
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 w-1.5 rounded-l-2xl",
                    style.side
                  )}
                />

                <div className="flex items-start justify-between pl-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {entry.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.avatar}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-2 ring-white">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow",
                          style.badge
                        )}
                      >
                        {entry.rank}
                      </div>
                    </div>

                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">
                        {entry.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Icon className="h-3.5 w-3.5" />
                        {style.label} place
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between pl-2">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Score
                    </p>
                    <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                      {entry.score.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rest of the list ── */}
      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Rankings
            </p>
          </div>

          <ul className="divide-y divide-slate-100">
            {rest.map((entry) => (
              <li
                key={entry.userId}
                className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/80"
              >
                {/* Rank */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-600">
                  {entry.rank}
                </div>

                {/* Avatar */}
                {entry.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.avatar}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                    <User className="h-4 w-4" />
                  </div>
                )}

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-slate-800">
                    {entry.name}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-[15px] font-semibold tabular-nums text-slate-900">
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">pts</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}