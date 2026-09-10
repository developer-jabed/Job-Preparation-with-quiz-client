/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  createQuestion,
  updateQuestion,
  Question,
  QuestionPayload,
} from "@/service/question/question.service";
import { Subject } from "@/service/subject/subject.service";
import { Category } from "@/service/category/category.service";
import { Topic } from "@/service/topics/topic.service";
import { Tag } from "@/service/tags/tags.service";


interface OptionRow {
  text: string;
  isCorrect: boolean;
}

interface QuestionFormDialogProps {
  open: boolean;
  question: Question | null;
  subjects: Subject[];
  categories: Category[];
  topics: Topic[];
  tags: Tag[]; // ← add this
  onClose: () => void;
  onSaved: () => void;
}

export function QuestionFormDialog({
  open,
  question,
  subjects,
  categories,
  topics,
  tags,
  onClose,
  onSaved,
}: QuestionFormDialogProps) {
  if (!open) return null;

  return (
    <QuestionFormContent
      key={question?.id ?? "create"}
      question={question}
      subjects={subjects}
      categories={categories}
      topics={topics}
      tags={tags}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

// ────────────────────────────────────────────────
// Inner component
// ────────────────────────────────────────────────

function QuestionFormContent({
  question,
  subjects,
  categories,
  topics,
  tags,
  onClose,
  onSaved,
}: Omit<QuestionFormDialogProps, "open">) {
  const isEdit = Boolean(question);

  const [subjectId, setSubjectId] = useState(question?.subjectId ?? "");
  const [categoryId, setCategoryId] = useState(question?.categoryId ?? "");
  const [topicId, setTopicId] = useState(question?.topicId ?? "");
  const [text, setText] = useState(question?.questionText ?? "");
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [isPreviousYear, setIsPreviousYear] = useState(question?.isPreviousYear ?? false);
  const [year, setYear] = useState<number | "">(question?.year ?? "");
  const [isActive, setIsActive] = useState(question?.isActive ?? true);

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    question?.tags?.map((t) => t.tag.id) ?? []
  );

  const [options, setOptions] = useState<OptionRow[]>(
    question?.options && question.options.length >= 2
      ? question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
      : [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ]
  );

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cascading filters
  const filteredCategories = categories.filter((c) => c.subjectId === subjectId);
  const filteredTopics = topics.filter((t) => t.categoryId === categoryId);

  function updateOption(index: number, field: keyof OptionRow, value: string | boolean) {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addOption() {
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!subjectId || !text.trim()) {
      setError("বিষয় এবং প্রশ্নের টেক্সট আবশ্যক");
      return;
    }

    const validOptions = options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      setError("কমপক্ষে ২টি Option আবশ্যক");
      return;
    }
    if (!validOptions.some((o) => o.isCorrect)) {
      setError("কমপক্ষে একটি সঠিক Option নির্বাচন করুন");
      return;
    }

    const payload: QuestionPayload = {
      subjectId,
      categoryId: categoryId || null,
      topicId: topicId || null,
      questionText: text.trim(),
      explanation: explanation.trim() || undefined,
      isPreviousYear,
      year: year === "" ? undefined : Number(year),
      isActive,
      options: validOptions.map((o, idx) => ({
        text: o.text.trim(),
        isCorrect: o.isCorrect,
        order: idx,
      })),
      tagIds: selectedTagIds, // ← important
    };

    setPending(true);
    try {
      const result = isEdit
        ? await updateQuestion(question!.id, payload)
        : await createQuestion(payload);

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

      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? "প্রশ্ন সম্পাদনা করুন" : "নতুন প্রশ্ন যোগ করুন"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "প্রশ্নের তথ্য ও অপশন পরিবর্তন করুন।"
              : "মাল্টিপল চয়েস প্রশ্ন তৈরি করুন।"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-6 px-6 py-6">
            {/* Taxonomy */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  বিষয় <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setCategoryId("");
                    setTopicId("");
                  }}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
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
                    setTopicId("");
                  }}
                  disabled={!subjectId}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
                >
                  <option value="">কোনোটি নয়</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  টপিক
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={!categoryId}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
                >
                  <option value="">কোনোটি নয়</option>
                  {filteredTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                প্রশ্নের টেক্সট <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                required
                placeholder="প্রশ্নটি লিখুন..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Options */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  অপশনসমূহ <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  + অপশন যোগ করুন
                </button>
              </div>

              <div className="space-y-2.5">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOptions((prev) =>
                          prev.map((o, i) => ({
                            ...o,
                            isCorrect: i === idx ? !o.isCorrect : false,
                          }))
                        )
                      }
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition ${
                        opt.isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                      }`}
                      title="সঠিক উত্তর চিহ্নিত করুন"
                    >
                      {String.fromCharCode(65 + idx)}
                    </button>

                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(idx, "text", e.target.value)}
                      placeholder={`অপশন ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                সবুজ বোতামে ক্লিক করে সঠিক উত্তর চিহ্নিত করুন
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                ট্যাগসমূহ
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-slate-400">কোনো ট্যাগ পাওয়া যায়নি</p>
                ) : (
                  tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                          isSelected
                            ? "bg-rose-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })
                )}
              </div>
              {selectedTagIds.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {selectedTagIds.length} টি ট্যাগ নির্বাচিত
                </p>
              )}
            </div>

            {/* Explanation */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                ব্যাখ্যা (ঐচ্ছিক)
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
                placeholder="সঠিক উত্তরের ব্যাখ্যা..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isPreviousYear}
                  onChange={(e) => setIsPreviousYear(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                পূর্ববর্তী বছরের প্রশ্ন
              </label>

              {isPreviousYear && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-700">বছর:</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) =>
                      setYear(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="2024"
                    className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {isEdit && (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  সক্রিয়
                </label>
              )}
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
              className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
            >
              {pending
                ? "সংরক্ষণ হচ্ছে…"
                : isEdit
                ? "পরিবর্তন সংরক্ষণ করুন"
                : "প্রশ্ন তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}