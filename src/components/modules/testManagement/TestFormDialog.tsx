/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
  createTest,
  updateTest,
  Test,
  TestPayload,
} from "@/service/test/test.service";
import { Subject } from "@/service/subject/subject.service";
import { Category } from "@/service/category/category.service";
import { Question } from "@/service/question/question.service";

interface TestFormDialogProps {
  open: boolean;
  test: Test | null;
  subjects: Subject[];
  categories: Category[];
  questions: Question[];
  onClose: () => void;
  onSaved: () => void;
}

export function TestFormDialog({
  open,
  test,
  subjects,
  categories,
  questions,
  onClose,
  onSaved,
}: TestFormDialogProps) {
  if (!open) return null;

  return (
    <TestFormContent
      key={test?.id ?? "create"}
      test={test}
      subjects={subjects}
      categories={categories}
      questions={questions}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function TestFormContent({
  test,
  subjects,
  categories,
  questions,
  onClose,
  onSaved,
}: Omit<TestFormDialogProps, "open">) {
  const isEdit = Boolean(test);

  const [subjectId, setSubjectId] = useState(test?.subjectId ?? "");
  const [categoryId, setCategoryId] = useState(test?.categoryId ?? "");
  const [title, setTitle] = useState(test?.title ?? "");
  const [slug, setSlug] = useState(test?.slug ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    (test as any)?.durationMinutes ?? 30
  );
  const [isFree, setIsFree] = useState(test?.isFree ?? true);
  const [isActive, setIsActive] = useState(test?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(test?.isFeatured ?? false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    test?.questions?.map((q) => q.questionId) ?? []
  );
  const [questionSearch, setQuestionSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter(
    (c) => c.subjectId === subjectId
  );

  const availableQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSubject = !subjectId || q.subjectId === subjectId;
      const matchesCategory = !categoryId || q.categoryId === categoryId;
      const matchesSearch =
        !questionSearch ||
        q.questionText?.toLowerCase().includes(questionSearch.toLowerCase());
      return matchesSubject && matchesCategory && matchesSearch && q.isActive;
    });
  }, [questions, subjectId, categoryId, questionSearch]);

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!subjectId || !title.trim()) {
      setError("বিষয় এবং টাইটেল আবশ্যক");
      return;
    }
    if (!durationMinutes || durationMinutes < 1) {
      setError("সময়সীমা কমপক্ষে ১ মিনিট হতে হবে");
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setError("কমপক্ষে ১টি প্রশ্ন নির্বাচন করুন");
      return;
    }

    const payload: TestPayload = {
      subjectId,
      categoryId: categoryId || null,
      title: title.trim(),
      slug: slug.trim() || undefined,
      durationMinutes: Number(durationMinutes),
      isFree,
      isActive,
      isFeatured,
      questionIds: selectedQuestionIds,
    };

    setPending(true);
    try {
      const result = isEdit
        ? await updateTest(test!.id, payload)
        : await createTest(payload);

      if (result.success) {
        onSaved();
      } else {
        setError(result.message || "কিছু একটা ভুল হয়েছে");
      }
    } catch (err: any) {
      setError(err.message || "কিছু একটা ভুল হয়েছে");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <button
        aria-label="বন্ধ করুন"
        className="absolute inset-0"
        onClick={onClose}
        tabIndex={-1}
      />

      <div className="relative flex h-full w-full max-w-3xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? "টেস্ট সম্পাদনা করুন" : "নতুন টেস্ট তৈরি করুন"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "টেস্টের তথ্য ও প্রশ্ন পরিবর্তন করুন।"
              : "বিষয় নির্বাচন করে প্রশ্ন যোগ করে নতুন টেস্ট তৈরি করুন।"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  বিষয় <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setCategoryId("");
                    setSelectedQuestionIds([]);
                  }}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">নির্বাচন করুন</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ক্যাটাগরি
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSelectedQuestionIds([]);
                  }}
                  disabled={!subjectId}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  <option value="">কোনোটি নয়</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                টাইটেল <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: অ্যারে ও লিঙ্কড লিস্ট - মডেল টেস্ট ০১"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  স্লাগ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated if empty"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  সময়সীমা (মিনিট) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                ফ্রি টেস্ট
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                সক্রিয়
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                ফিচার্ড
              </label>
            </div>

            {/* Question Selector */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  প্রশ্ন নির্বাচন করুন <span className="text-rose-500">*</span>
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    ({selectedQuestionIds.length} টি নির্বাচিত)
                  </span>
                </label>
              </div>

              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="প্রশ্ন খুঁজুন..."
                className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                {availableQuestions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    কোনো প্রশ্ন পাওয়া যায়নি
                  </p>
                ) : (
                  availableQuestions.map((q) => {
                    const selected = selectedQuestionIds.includes(q.id);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => toggleQuestion(q.id)}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          selected
                            ? "border border-blue-200 bg-blue-50"
                            : "border border-transparent hover:bg-white"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="line-clamp-2 text-slate-700">
                          {q.questionText}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {pending
                ? "সংরক্ষণ হচ্ছে…"
                : isEdit
                ? "পরিবর্তন সংরক্ষণ করুন"
                : "টেস্ট তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}