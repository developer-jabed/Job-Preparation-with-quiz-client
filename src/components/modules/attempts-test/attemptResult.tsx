"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AttemptResult } from "@/service/test-attempt/testAttempt.service";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Target,
  Award,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  attempt: AttemptResult;
  /** Where to send the user when they close the modal. Defaults to /tests. */
  closeHref?: string;
}

function formatDuration(sec: number | null) {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} মিনিট ${s} সেকেন্ড`;
}

export default function ResultModal({ attempt, closeHref = "/tests" }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    // small delay lets the close animation play before navigating away
    setTimeout(() => router.push(closeHref), 150);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answers = useMemo(
    () =>
      (attempt.answers ?? []).filter((a) => a.question).map((a, i) => ({
        index: i + 1,
        ...a,
      })),
    [attempt.answers]
  );

  const totalQuestions = attempt.test?.totalQuestions ?? answers.length;
  const correctCount = attempt.correctCount ?? 0;
  const wrongCount = attempt.wrongCount ?? 0;
  const skippedCount = attempt.skippedCount ?? Math.max(0, totalQuestions - correctCount - wrongCount);
  const accuracy = attempt.accuracy ?? 0;
  const obtainedMarks = attempt.obtainedMarks ?? 0;
  const totalMarks = attempt.totalMarks ?? attempt.test?.totalMarks ?? 0;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity duration-150",
        closing ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="টেস্ট ফলাফল"
        className={cn(
          "relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#0b6e3c]/15 bg-white shadow-2xl transition-transform duration-150 dark:border-white/10 dark:bg-[#0e1611]",
          closing ? "scale-95" : "scale-100"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#0b6e3c]/10 px-6 py-5 dark:border-white/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0b6e3c] dark:text-[#2fa968]">
              {attempt.test?.testType ?? "টেস্ট"} · ফলাফল
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#14201a] dark:text-[#eaf1ec] sm:text-xl">
              {attempt.test?.title ?? "প্র্যাকটিস টেস্ট"}
            </h2>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="বন্ধ করুন"
            className="rounded-lg p-2 text-[#52685c] transition hover:bg-[#f6f8f5] dark:text-[#9db3a6] dark:hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0b6e3c] text-white">
              <span className="text-lg font-bold leading-none">
                {Math.round(accuracy)}%
              </span>
              <span className="text-[9px] uppercase leading-none opacity-80">সঠিক</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> সঠিক: {correctCount}
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <XCircle className="h-3.5 w-3.5" /> ভুল: {wrongCount}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#52685c] dark:text-[#9db3a6]">
                <MinusCircle className="h-3.5 w-3.5" /> বাদ দেওয়া: {skippedCount}
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-[#f6f8f5] p-3 text-center dark:bg-white/[0.04]">
              <Award className="mx-auto h-4 w-4 text-[#0b6e3c] dark:text-[#2fa968]" />
              <p className="mt-1.5 text-base font-bold text-[#14201a] dark:text-[#eaf1ec]">
                {obtainedMarks}/{totalMarks}
              </p>
              <p className="mt-0.5 text-[10px] text-[#52685c] dark:text-[#9db3a6]">প্রাপ্ত নম্বর</p>
            </div>
            <div className="rounded-xl bg-[#f6f8f5] p-3 text-center dark:bg-white/[0.04]">
              <Target className="mx-auto h-4 w-4 text-[#0b6e3c] dark:text-[#2fa968]" />
              <p className="mt-1.5 text-base font-bold text-[#14201a] dark:text-[#eaf1ec]">
                {accuracy.toFixed(1)}%
              </p>
              <p className="mt-0.5 text-[10px] text-[#52685c] dark:text-[#9db3a6]">নির্ভুলতা</p>
            </div>
            <div className="rounded-xl bg-[#f6f8f5] p-3 text-center dark:bg-white/[0.04]">
              <Clock className="mx-auto h-4 w-4 text-[#0b6e3c] dark:text-[#2fa968]" />
              <p className="mt-1.5 text-base font-bold text-[#14201a] dark:text-[#eaf1ec]">
                {formatDuration(attempt.timeTakenSeconds)}
              </p>
              <p className="mt-0.5 text-[10px] text-[#52685c] dark:text-[#9db3a6]">সময় নিয়েছেন</p>
            </div>
            <div className="rounded-xl bg-[#f6f8f5] p-3 text-center dark:bg-white/[0.04]">
              <CheckCircle2 className="mx-auto h-4 w-4 text-[#0b6e3c] dark:text-[#2fa968]" />
              <p className="mt-1.5 text-base font-bold text-[#14201a] dark:text-[#eaf1ec]">
                {correctCount}/{totalQuestions}
              </p>
              <p className="mt-0.5 text-[10px] text-[#52685c] dark:text-[#9db3a6]">সঠিক উত্তর</p>
            </div>
          </div>

          {/* Per-question review */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#14201a] dark:text-[#eaf1ec]">
              প্রশ্নভিত্তিক পর্যালোচনা
            </h3>

            <div className="mt-3 space-y-2.5">
              {answers.map((a) => {
                const q = a.question!;
                const isExpanded = expandedId === a.id;
                const isSkipped = !a.selectedOptions?.length;
                const isCorrect = a.isCorrect === true;

                return (
                  <div
                    key={a.id}
                    className="overflow-hidden rounded-xl border border-[#0b6e3c]/12 dark:border-white/10"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                          isSkipped
                            ? "bg-[#f6f8f5] text-[#52685c] dark:bg-white/5 dark:text-[#9db3a6]"
                            : isCorrect
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        )}
                      >
                        {isSkipped ? (
                          <MinusCircle className="h-3.5 w-3.5" />
                        ) : isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                      </span>

                      <span className="flex-1 text-sm text-[#14201a] dark:text-[#eaf1ec]">
                        <span className="mr-1.5 text-[#52685c] dark:text-[#9db3a6]">
                          {a.index}.
                        </span>
                        {q.questionText}
                      </span>

                      <ChevronDown
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 text-[#52685c] transition-transform dark:text-[#9db3a6]",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 border-t border-[#0b6e3c]/10 px-4 py-3 dark:border-white/10">
                        {q.options.map((opt) => {
                          const wasSelected = a.selectedOptions?.includes(opt.id);
                          const isRight = opt.isCorrect;

                          return (
                            <div
                              key={opt.id}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                                isRight
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : wasSelected
                                    ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                                    : "border-[#0b6e3c]/10 dark:border-white/10"
                              )}
                            >
                              {isRight ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              ) : wasSelected ? (
                                <XCircle className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <span className="h-3.5 w-3.5 shrink-0" />
                              )}
                              {opt.text}
                            </div>
                          );
                        })}

                        {q.explanation && (
                          <div className="mt-2 rounded-lg bg-[#f6f8f5] p-3 text-xs leading-relaxed text-[#52685c] dark:bg-white/5 dark:text-[#9db3a6]">
                            <span className="font-semibold text-[#14201a] dark:text-[#eaf1ec]">
                              ব্যাখ্যা:{" "}
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#0b6e3c]/10 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-xl bg-[#0b6e3c] py-2.5 text-sm font-semibold text-white transition hover:bg-[#084d2a]"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}