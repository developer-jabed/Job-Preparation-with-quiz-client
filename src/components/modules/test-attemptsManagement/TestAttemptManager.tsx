"use client";

import { useMemo, useState } from "react";
import { TestAttempt } from "@/service/test-attempt/testAttempt.service";
import { Test } from "@/service/test/test.service";

interface TestAttemptManagerProps {
  initialAttempts: TestAttempt[];
  tests: Test[];
}

type StatusFilter = "all" | "COMPLETED" | "IN_PROGRESS" | "TIMED_OUT";

export function TestAttemptManager({
  initialAttempts,
  tests,
}: TestAttemptManagerProps) {
  const [attempts] = useState(initialAttempts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [testFilter, setTestFilter] = useState("all");

  const filtered = useMemo(() => {
    return attempts.filter((a) => {
      const matchesQuery =
        !query ||
        a.test?.title?.toLowerCase().includes(query.toLowerCase()) ||
        a.user?.name?.toLowerCase().includes(query.toLowerCase()) ||
        a.user?.email?.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || a.status === statusFilter;

      const matchesTest = testFilter === "all" || a.testId === testFilter;

      return matchesQuery && matchesStatus && matchesTest;
    });
  }, [attempts, query, statusFilter, testFilter]);

  function formatDuration(seconds?: number | null) {
    if (seconds == null) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}ম ${s}সে`;
  }

  function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
      TIMED_OUT: "bg-rose-50 text-rose-700 border-rose-200",
    };

    const labels: Record<string, string> = {
      COMPLETED: "সম্পন্ন",
      IN_PROGRESS: "চলমান",
      TIMED_OUT: "সময় শেষ",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
          styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="টেস্ট বা ইউজার খুঁজুন…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-indigo-500"
          >
            <option value="all">সব টেস্ট</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(
              ["all", "COMPLETED", "IN_PROGRESS", "TIMED_OUT"] as StatusFilter[]
            ).map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  statusFilter === opt
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt === "all"
                  ? "সব"
                  : opt === "COMPLETED"
                  ? "সম্পন্ন"
                  : opt === "IN_PROGRESS"
                  ? "চলমান"
                  : "সময় শেষ"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">ইউজার</th>
              <th className="px-6 py-4">টেস্ট</th>
              <th className="px-6 py-4">স্ট্যাটাস</th>
              <th className="px-6 py-4">স্কোর</th>
              <th className="px-6 py-4">সঠিকতা</th>
              <th className="px-6 py-4">সময়</th>
              <th className="px-6 py-4">তারিখ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                  কোনো অ্যাটেম্পট পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filtered.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="group transition hover:bg-indigo-50/30"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {attempt.user?.name ?? "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {attempt.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[220px] truncate font-medium text-slate-800">
                      {attempt.test?.title ?? "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={attempt.status} />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {attempt.obtainedMarks != null
                      ? `${attempt.obtainedMarks} / ${attempt.totalMarks}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {attempt.accuracy != null ? (
                      <span
                        className={`font-medium ${
                          attempt.accuracy >= 70
                            ? "text-emerald-600"
                            : attempt.accuracy >= 40
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {attempt.accuracy}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDuration(attempt.timeTakenSeconds)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(attempt.createdAt).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}