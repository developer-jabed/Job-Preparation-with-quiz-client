// app/(learner)/spaced-review/history/SpacedReviewsHistoryClient.tsx
"use client";

import { useMemo, useState } from "react";
import { MySpacedReview } from "@/service/spaced-reviews/spaced-reviews.service";
import { Search, Calendar, Brain } from "lucide-react";
import Link from "next/link";

interface Props {
  initialReviews: MySpacedReview[];
  initialError?: string;
}

export default function SpacedReviewsHistoryClient({
  initialReviews,
  initialError,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "upcoming">("all");

  const now = new Date();

  const filtered = useMemo(() => {
    return initialReviews
      .filter((r) => {
        const matchesSearch =
          search === "" ||
          r.question.questionText.toLowerCase().includes(search.toLowerCase()) ||
          r.question.subject.name.toLowerCase().includes(search.toLowerCase());

        const nextReview = new Date(r.nextReviewAt);
        const isDue = nextReview <= now;

        if (filter === "due") return matchesSearch && isDue;
        if (filter === "upcoming") return matchesSearch && !isDue;
        return matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
      );
  }, [initialReviews, search, filter, now]);

  if (initialError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {initialError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "due", "upcoming"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialReviews.length}
          </p>
          <p className="text-sm text-gray-500">Total in system</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-2xl font-bold text-amber-600">
            {initialReviews.filter((r) => new Date(r.nextReviewAt) <= now).length}
          </p>
          <p className="text-sm text-gray-500">Due now</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-2xl font-bold text-blue-600">
            {initialReviews.filter((r) => new Date(r.nextReviewAt) > now).length}
          </p>
          <p className="text-sm text-gray-500">Upcoming</p>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <Brain className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => {
            const isDue = new Date(review.nextReviewAt) <= now;
            const daysUntil = Math.ceil(
              (new Date(review.nextReviewAt).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={review.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {review.question.subject.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isDue
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {isDue ? "Due now" : `In ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                      {review.question.questionText}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Next:{" "}
                        {new Date(review.nextReviewAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span>Interval: {review.intervalDays}d</span>
                      <span>Reps: {review.repetitions}</span>
                      <span>EF: {review.easeFactor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}