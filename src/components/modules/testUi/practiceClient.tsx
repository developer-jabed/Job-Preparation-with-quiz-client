/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useTransition } from "react";
import {
  MasterySetupStatus,
  TestTemplateItem,
  generateTestFromTemplate,
} from "@/service/mastery/mastery.service";
import {
  BookOpen,
  Clock,
  Layers,
  Play,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Target,
  Zap,
  Star,
  StarOff,
  Search,
  Flag,
  History,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  templates: TestTemplateItem[];
  status: MasterySetupStatus | null;
  error?: string;
  dueReviewCount?: number;
}

type FilterKey = "all" | "featured" | "favorites";

export default function PracticeClient({
  templates,
  status,
  error,
  dueReviewCount = 0,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [startingSlug, setStartingSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [reportTemplate, setReportTemplate] = useState<TestTemplateItem | null>(
    null
  );

  // Local-only favorites for templates
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("practice-template-favorites");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
        toast.success("Removed from favorites");
      } else {
        next.add(slug);
        toast.success("Added to favorites");
      }
      localStorage.setItem(
        "practice-template-favorites",
        JSON.stringify([...next])
      );
      return next;
    });
  };

  const mapsSummary = useMemo(() => {
    if (!status?.maps) return null;
    return {
      total: status.maps.total,
      linked: status.maps.linked,
      unlinked: status.maps.unlinked,
      readyRatio:
        status.maps.total === 0
          ? 0
          : Math.round((status.maps.linked / status.maps.total) * 100),
    };
  }, [status]);

  const filteredTemplates = useMemo(() => {
    let list = templates;

    if (activeFilter === "featured") {
      list = list.filter((t) => t.isFeatured);
    } else if (activeFilter === "favorites") {
      list = list.filter((t) => favorites.has(t.slug));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.examTag?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.testType?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [templates, activeFilter, favorites, search]);

  const handleStart = (template: TestTemplateItem) => {
    setStartingSlug(template.slug);

    startTransition(async () => {
      try {
        const res = await generateTestFromTemplate(template.slug);

        if (!res.success || !res.data) {
          toast.error(res.message || "টেস্ট তৈরি করতে ব্যর্থ");
          setStartingSlug(null);
          return;
        }

        toast.success("টেস্ট প্রস্তুত!");
        router.push(`/tests/${res.data.attemptId}`);
      } catch (e: any) {
        toast.error(e?.message || "Something went wrong");
        setStartingSlug(null);
      }
    });
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/40">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="font-medium text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-6 text-white shadow-xl dark:border-violet-900/50 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              SMART selection
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Less repeat. More real exam feel.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-violet-100/90">
              Questions are picked with cooldown, never-seen priority, and your
              wrong-answer history — so every mock stays fresh.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <StatPill
              icon={<Target className="h-4 w-4" />}
              label="Templates"
              value={templates.length}
            />
            {mapsSummary && (
              <StatPill
                icon={<Layers className="h-4 w-4" />}
                label="Topics linked"
                value={`${mapsSummary.linked}/${mapsSummary.total}`}
              />
            )}
            <StatPill
              icon={<Star className="h-4 w-4" />}
              label="Favorites"
              value={favorites.size}
            />
          </div>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Readiness banners */}
      {status && mapsSummary && mapsSummary.unlinked > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">
              {mapsSummary.unlinked} topic map(s) not linked yet
            </p>
            <p className="mt-0.5 text-amber-800/80 dark:text-amber-200/70">
              Mocks can still start in partial mode.
            </p>
          </div>
        </div>
      )}

      {status?.ready && mapsSummary?.unlinked === 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          All taxonomy maps linked — full SMART mocks available.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search mocks, exam tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none ring-violet-500/20 transition focus:border-violet-400 focus:ring-4 dark:border-gray-700 dark:bg-gray-900"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "featured", "favorites"] as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                activeFilter === key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              )}
            >
              {key === "favorites" && <Star className="h-3.5 w-3.5" />}
              {key === "featured" && <Sparkles className="h-3.5 w-3.5" />}
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}

          <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />

          <Link
            href="/spaced-review"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/50"
          >
            <History className="h-3.5 w-3.5" />
            Spaced review
            {dueReviewCount > 0 && (
              <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {dueReviewCount}
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Available mocks
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredTemplates.length})
            </span>
          </h3>
        </div>

        {filteredTemplates.length === 0 ? (
          <EmptyState
            search={search}
            activeFilter={activeFilter}
            onClear={() => {
              setSearch("");
              setActiveFilter("all");
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((t) => {
              const loading = isPending && startingSlug === t.slug;
              const isFavorite = favorites.has(t.slug);

              return (
                <article
                  key={t.id}
                  className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-violet-700/60"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/80 dark:text-violet-300">
                      <Zap className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      {t.isFeatured && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          Featured
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(t.slug)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-amber-500 dark:hover:bg-gray-800"
                        aria-label={
                          isFavorite ? "Remove favorite" : "Add to favorites"
                        }
                        title="Favorite (local)"
                      >
                        {isFavorite ? (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-semibold leading-snug text-gray-900 dark:text-white">
                    {t.name}
                  </h4>
                  {t.examTag && (
                    <p className="mt-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                      {t.examTag}
                    </p>
                  )}
                  {t.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {t.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {t.totalQuestions} Qs
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {t.durationMinutes} min
                    </span>
                    {t.testType && (
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                        {t.testType}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStart(t)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing…
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start practice
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportTemplate(t)}
                      className="rounded-xl border border-gray-200 p-2.5 text-gray-400 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:hover:bg-gray-800"
                      title="How to report a question"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
          How practice works
        </h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <Step
            n={1}
            title="Pick a mock"
            text="Choose Computer Operator or any active template."
          />
          <Step
            n={2}
            title="SMART pick"
            text="System avoids recent questions and boosts weak areas."
          />
          <Step
            n={3}
            title="Review & improve"
            text="Finish → score → wrong items feed spaced review."
          />
        </div>
      </section>

      {/* Report info modal */}
      {reportTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold">Report a question</h3>
              <button
                onClick={() => setReportTemplate(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Reporting is available for individual questions while you are
              taking a test or reviewing an attempt.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Start <strong>{reportTemplate.name}</strong>, then use the report
              button on any question that has an issue.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setReportTemplate(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setReportTemplate(null);
                  handleStart(reportTemplate);
                }}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Start this mock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-xs text-violet-100">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
        {n}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{text}</p>
      </div>
    </div>
  );
}

function EmptyState({
  search,
  activeFilter,
  onClear,
}: {
  search: string;
  activeFilter: FilterKey;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <BookOpen className="mb-3 h-11 w-11 text-gray-300 dark:text-gray-600" />
      <p className="font-medium text-gray-700 dark:text-gray-300">
        {search || activeFilter !== "all"
          ? "No mocks match your filters"
          : "No active templates yet"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {search || activeFilter !== "all"
          ? "Try clearing search or switching filters."
          : "Run Mastery Setup defaults from admin, then activate a template."}
      </p>
      {(search || activeFilter !== "all") && (
        <button
          onClick={onClear}
          className="mt-4 text-sm font-medium text-violet-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}