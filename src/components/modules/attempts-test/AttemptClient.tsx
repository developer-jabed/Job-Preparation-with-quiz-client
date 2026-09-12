"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AttemptResult,
  saveAnswer,
  submitAttempt,
} from "@/service/test-attempt/testAttempt.service";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Loader2,
  Send,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type QuizQuestion = {
  id: string;
  order: number;
  text: string;
  marks: number;
  negativeMarks: number;
  questionType?: string;
  difficulty?: string;
  options: { id: string; text: string; order?: number }[];
  selectedOptions: string[];
};

interface Props {
  attempt: AttemptResult;
}

function normalizeQuestions(attempt: AttemptResult): QuizQuestion[] {
  const testQuestions = (attempt.test as { questions?: unknown[] } | undefined)
    ?.questions as
    | Array<{
        order?: number;
        marks?: number;
        question: {
          id: string;
          questionText: string;
          marks?: number;
          negativeMarks?: number;
          questionType?: string;
          difficulty?: string;
          options?: { id: string; text: string; order?: number }[];
        };
      }>
    | undefined;

  if (testQuestions?.length) {
    const answerMap = new Map(
      (attempt.answers ?? []).map((a) => [a.questionId, a.selectedOptions ?? []])
    );

    return testQuestions
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((tq, index) => {
        const q = tq.question;
        return {
          id: q.id,
          order: tq.order ?? index + 1,
          text: q.questionText ?? "",
          marks: tq.marks ?? q.marks ?? 1,
          negativeMarks: q.negativeMarks ?? 0,
          questionType: q.questionType,
          difficulty: q.difficulty,
          options: (q.options ?? [])
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((o) => ({ id: o.id, text: o.text, order: o.order })),
          selectedOptions: answerMap.get(q.id) ?? [],
        } satisfies QuizQuestion;
      });
  }

  return (attempt.answers ?? [])
    .filter((a) => a.question)
    .map((a, index) => ({
      id: a.question!.id,
      order: index + 1,
      text: a.question!.questionText ?? "",
      marks: a.question!.marks ?? 1,
      negativeMarks: a.question!.negativeMarks ?? 0,
      options: (a.question!.options ?? []).map((o, i) => ({
        id: o.id,
        text: o.text,
        order: i,
      })),
      selectedOptions: a.selectedOptions ?? [],
    }));
}

export default function AttemptClient({ attempt }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const questions = useMemo(() => normalizeQuestions(attempt), [attempt]);

  const [answers, setAnswers] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const q of questions) {
      if (q.selectedOptions?.length) map[q.id] = q.selectedOptions;
    }
    return map;
  });

  const total = questions.length;
  const current = questions[currentIndex];
  const durationMin = attempt.test?.durationMinutes ?? 30;
  const durationSec = durationMin * 60;
  const startedAt = useMemo(
    () => new Date(attempt.startedAt).getTime(),
    [attempt.startedAt]
  );

  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, durationSec - elapsed);
  });

  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v?.length > 0).length,
    [answers]
  );

  const unansweredCount = total - answeredCount;

  const performSubmit = useCallback(
    (auto = false) => {
      if (submitting || attempt.status !== "IN_PROGRESS") return;

      setShowSubmitModal(false);
      setSubmitting(true);

      startTransition(async () => {
        const res = await submitAttempt(attempt.id);
        setSubmitting(false);

        if (!res.success) {
          toast.error(res.message || "সাবমিট ব্যর্থ হয়েছে");
          return;
        }

        toast.success(res.message || "সাবমিট হয়েছে!");
        router.push(`/tests/${attempt.id}/result`);
      });
    },
    [attempt.id, attempt.status, submitting, router]
  );

  const handleSubmitClick = () => {
    if (submitting || attempt.status !== "IN_PROGRESS") return;
    setShowSubmitModal(true);
  };

  // Keep latest performSubmit for the interval (avoids stale closure)
  const performSubmitRef = useRef(performSubmit);
  useEffect(() => {
    performSubmitRef.current = performSubmit;
  }, [performSubmit]);

  useEffect(() => {
    if (attempt.status !== "IN_PROGRESS") return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, durationSec - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timer);
        performSubmitRef.current(true); // auto-submit, no modal
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt.status, startedAt, durationSec]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const selectOption = (optionId: string) => {
    if (attempt.status !== "IN_PROGRESS" || !current) return;

    const isMulti = current.questionType === "MULTIPLE_CORRECT";
    const prev = answers[current.id] ?? [];
    const next = isMulti
      ? prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
      : [optionId];

    setAnswers((a) => ({ ...a, [current.id]: next }));

    startTransition(async () => {
      const res = await saveAnswer(attempt.id, {
        questionId: current.id,
        selectedOptions: next,
      });
      if (!res.success) {
        toast.error(res.message || "উত্তর সেভ করতে ব্যর্থ হয়েছে");
      }
    });
  };

  const toggleFlag = () => {
    if (!current) return;
    setFlagged((prev) => {
      const n = new Set(prev);
      if (n.has(current.id)) n.delete(current.id);
      else n.add(current.id);
      return n;
    });
  };

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 pt-20">
        <p className="text-center text-sm text-[#52685c] dark:text-[#9db3a6]">
          এই অ্যাটেম্পটে কোনো প্রশ্ন পাওয়া যায়নি।
        </p>
      </div>
    );
  }

  const selected = answers[current.id] ?? [];
  const isFlagged = flagged.has(current.id);
  const isFinished = attempt.status !== "IN_PROGRESS";

  return (
    <div className="min-h-screen bg-[#f6f8f5] pt-[68px] dark:bg-[#0e1611]">
      <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-6xl flex-col">
        {/* Header */}
        <header className="sticky top-[68px] z-20 border-b border-[#0b6e3c]/12 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#0e1611]/95">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div>
              <h1 className="text-sm font-semibold text-[#14201a] dark:text-[#eaf1ec] sm:text-base">
                {attempt.test?.title ?? "প্র্যাকটিস টেস্ট"}
              </h1>
              <p className="text-xs text-[#52685c] dark:text-[#9db3a6]">
                প্রশ্ন {currentIndex + 1} / {total}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums",
                  remaining < 60
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-[#e6f3ea] text-[#0b6e3c] dark:bg-[#2fa968]/15 dark:text-[#2fa968]"
                )}
              >
                <Clock className="h-4 w-4" />
                {formatTime(remaining)}
              </div>

              <button
                type="button"
                disabled={isFinished || submitting}
                onClick={handleSubmitClick}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b6e3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#084d2a] disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                সাবমিট
              </button>
            </div>
          </div>

          <div className="h-1 bg-[#0b6e3c]/10">
            <div
              className="h-full bg-[#0b6e3c] transition-all dark:bg-[#2fa968]"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
          <main className="flex-1 rounded-2xl border border-[#0b6e3c]/12 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#e6f3ea] px-2 py-0.5 text-xs font-medium text-[#0b6e3c] dark:bg-[#2fa968]/15 dark:text-[#2fa968]">
                  প্রশ্ন {currentIndex + 1}
                </span>
                {current.difficulty && (
                  <span className="rounded-md bg-[#f6f8f5] px-2 py-0.5 text-xs text-[#52685c] dark:bg-white/5 dark:text-[#9db3a6]">
                    {current.difficulty}
                  </span>
                )}
                <span className="text-xs text-[#52685c]/70 dark:text-[#9db3a6]/70">
                  {current.marks} নম্বর
                </span>
              </div>

              <button
                type="button"
                onClick={toggleFlag}
                aria-pressed={isFlagged}
                aria-label="প্রশ্নটি চিহ্নিত করুন"
                className={cn(
                  "rounded-lg p-2 transition",
                  isFlagged
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-950"
                    : "text-[#52685c]/60 hover:bg-[#f6f8f5] dark:text-[#9db3a6]/60 dark:hover:bg-white/5"
                )}
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>

            <p className="text-base leading-relaxed text-[#14201a] dark:text-[#eaf1ec] sm:text-lg">
              {current.text}
            </p>

            <div className="mt-6 space-y-3">
              {current.options.map((opt, idx) => {
                const isSelected = selected.includes(opt.id);
                const label = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isFinished}
                    onClick={() => selectOption(opt.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                      isSelected
                        ? "border-[#0b6e3c] bg-[#e6f3ea] text-[#084d2a] dark:border-[#2fa968] dark:bg-[#2fa968]/10 dark:text-[#eaf1ec]"
                        : "border-[#0b6e3c]/15 hover:border-[#0b6e3c]/35 dark:border-white/10 dark:hover:border-white/25"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isSelected
                          ? "bg-[#0b6e3c] text-white dark:bg-[#2fa968]"
                          : "bg-[#f6f8f5] text-[#52685c] dark:bg-white/5 dark:text-[#9db3a6]"
                      )}
                    >
                      {isSelected ? <CheckCircle2 className="h-4 w-4" /> : label}
                    </span>
                    <span className="pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0b6e3c]/15 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
                পূর্ববর্তী
              </button>
              <button
                type="button"
                disabled={currentIndex >= total - 1}
                onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b6e3c] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                পরবর্তী
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>

          <aside className="w-full shrink-0 rounded-2xl border border-[#0b6e3c]/12 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:w-56">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#52685c] dark:text-[#9db3a6]">
              প্রশ্ন প্যালেট
            </p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-4">
              {questions.map((q, i) => {
                const answered = (answers[q.id]?.length ?? 0) > 0;
                const active = i === currentIndex;
                const isFl = flagged.has(q.id);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    aria-current={active}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition",
                      active &&
                        "ring-2 ring-[#0b6e3c] ring-offset-2 dark:ring-[#2fa968] dark:ring-offset-[#0e1611]",
                      answered
                        ? "bg-[#0b6e3c] text-white dark:bg-[#2fa968]"
                        : isFl
                          ? "bg-amber-100 text-amber-800"
                          : "bg-[#f6f8f5] text-[#52685c] dark:bg-white/5 dark:text-[#9db3a6]"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1 text-xs text-[#52685c] dark:text-[#9db3a6]">
              <p>
                উত্তর দেওয়া হয়েছে:{" "}
                <span className="font-semibold text-[#14201a] dark:text-[#eaf1ec]">
                  {answeredCount}/{total}
                </span>
              </p>
              {isPending && (
                <p className="flex items-center gap-1 text-[#0b6e3c] dark:text-[#2fa968]">
                  <Loader2 className="h-3 w-3 animate-spin" /> সেভ হচ্ছে…
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => !submitting && setShowSubmitModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#121a15]">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-[#eaf1ec]">
                      টেস্ট সাবমিট করবেন?
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#9db3a6]">
                      সাবমিট করার পর আর পরিবর্তন করা যাবে না।
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">
                    উত্তর দেওয়া
                  </p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-800 dark:text-emerald-300">
                    {answeredCount}
                    <span className="text-sm font-medium text-emerald-600/70">
                      /{total}
                    </span>
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    unansweredCount > 0
                      ? "border-amber-100 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/30"
                      : "border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                  )}
                >
                  <p
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-wider",
                      unansweredCount > 0
                        ? "text-amber-700/70 dark:text-amber-400/70"
                        : "text-slate-500"
                    )}
                  >
                    বাকি আছে
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xl font-bold tabular-nums",
                      unansweredCount > 0
                        ? "text-amber-800 dark:text-amber-300"
                        : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {unansweredCount}
                  </p>
                </div>
              </div>

              {unansweredCount > 0 && (
                <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                  আপনার {unansweredCount}টি প্রশ্নের উত্তর দেওয়া হয়নি।
                </p>
              )}

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-[#eaf1ec] dark:hover:bg-white/5"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => performSubmit(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b6e3c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#084d2a] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      সাবমিট হচ্ছে…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      সাবমিট করুন
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}