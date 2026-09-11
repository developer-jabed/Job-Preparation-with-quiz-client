// app/(learner)/bookmarks/BookmarksClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, BookmarkX, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner"; // or your toast library
import Link from "next/link";
import { Bookmark, removeBookmark } from "@/service/bookmarks/bookmarks.service";

interface Props {
  initialBookmarks: Bookmark[];
  initialError?: string;
}

const DIFFICULTY_OPTIONS = ["ALL", "EASY", "MEDIUM", "HARD"];
const TYPE_OPTIONS = ["ALL", "MCQ", "WRITTEN", "TRUE_FALSE"]; // adjust to your actual types

export default function BookmarksClient({ initialBookmarks, initialError }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  // Unique subjects from data
  const subjects = useMemo(() => {
    const set = new Set(bookmarks.map((b) => b.question.subject.name));
    return ["ALL", ...Array.from(set).sort()];
  }, [bookmarks]);

  // Filtered + searched data
  const filtered = useMemo(() => {
    return bookmarks.filter((b) => {
      const q = b.question;
      const matchesSearch =
        search === "" ||
        q.questionText.toLowerCase().includes(search.toLowerCase()) ||
        q.subject.name.toLowerCase().includes(search.toLowerCase());

      const matchesSubject = subjectFilter === "ALL" || q.subject.name === subjectFilter;
      const matchesDifficulty =
        difficultyFilter === "ALL" || q.difficulty.toUpperCase() === difficultyFilter;
      const matchesType =
        typeFilter === "ALL" || q.questionType.toUpperCase() === typeFilter;

      return matchesSearch && matchesSubject && matchesDifficulty && matchesType;
    });
  }, [bookmarks, search, subjectFilter, difficultyFilter, typeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const handleRemove = (questionId: string) => {
    setRemovingId(questionId);

    startTransition(async () => {
      const result = await removeBookmark(questionId);

      if (result.success) {
        setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
        toast.success(result.message || "Bookmark removed");
      } else {
        toast.error(result.message || "Failed to remove bookmark");
      }
      setRemovingId(null);
    });
  };

  if (initialError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
        {initialError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions or subjects..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => handleFilterChange(setSubjectFilter, e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Subjects" : s}
                </option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => handleFilterChange(setDifficultyFilter, e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d === "ALL" ? "All Difficulty" : d}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => handleFilterChange(setTypeFilter, e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Types" : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters summary */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong>{filtered.length}</strong> of {bookmarks.length} bookmarks
          </span>
          {(search || subjectFilter !== "ALL" || difficultyFilter !== "ALL" || typeFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setSubjectFilter("ALL");
                setDifficultyFilter("ALL");
                setTypeFilter("ALL");
                setPage(1);
              }}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
          <BookmarkX className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {bookmarks.length === 0 ? "No bookmarks yet" : "No matching bookmarks"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {bookmarks.length === 0
              ? "Start saving questions while practicing to see them here."
              : "Try adjusting your search or filters."}
          </p>
          {bookmarks.length === 0 && (
            <Link
              href="/practice" // adjust to your practice route
              className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Practice
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Bookmark Cards */}
          <div className="space-y-3">
            {paginated.map((bookmark) => {
              const q = bookmark.question;
              const isRemoving = removingId === bookmark.questionId;

              return (
                <div
                  key={bookmark.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Meta badges */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {q.subject.name}
                        </span>
                        {q.category && (
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {q.category.name}
                          </span>
                        )}
                        {q.topic && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {q.topic.name}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            q.difficulty.toUpperCase() === "EASY"
                              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : q.difficulty.toUpperCase() === "MEDIUM"
                              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {q.questionType}
                        </span>
                      </div>

                      {/* Question text */}
                      <Link
                        href={`/questions/${q.id}`} // adjust to your question detail route
                        className="block text-base font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 line-clamp-2"
                      >
                        {q.questionText}
                      </Link>

                      <p className="mt-2 text-xs text-gray-400">
                        Saved on {new Date(bookmark.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(bookmark.questionId)}
                      disabled={isRemoving || isPending}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-gray-700 dark:hover:border-red-800 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      title="Remove bookmark"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BookmarkX className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
              <p className="text-sm text-gray-500">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}