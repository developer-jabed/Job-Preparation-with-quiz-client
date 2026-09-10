"use client";

import { createTopic, updateTopic, Topic } from "@/service/topics/topic.service";
import { Category } from "@/service/category/category.service";
import { useActionState, useEffect, useRef } from "react";

interface TopicFormDialogProps {
  open: boolean;
  topic: Topic | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

const initialState = {
  success: false,
  message: undefined,
  errors: [] as { field: PropertyKey; message: string }[],
};

export function TopicFormDialog({
  open,
  topic,
  categories,
  onClose,
  onSaved,
}: TopicFormDialogProps) {
  const isEdit = Boolean(topic);
  const action = isEdit ? updateTopic.bind(null, topic!.id) : createTopic;
  const [state, formAction, pending] = useActionState(action, initialState);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (state.success) onSaved();
  }, [state.success, onSaved]);

  if (!open) return null;

  const fieldError = (field: string) =>
    state.errors?.find((e) => e.field === field)?.message;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <button aria-label="বন্ধ করুন" className="absolute inset-0" onClick={onClose} tabIndex={-1} />

      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white px-6 py-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? "টপিক সম্পাদনা করুন" : "নতুন টপিক যোগ করুন"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "এই টপিকের তথ্য পরিবর্তন করুন।"
              : "একটি ক্যাটাগরির অধীনে নতুন টপিক তৈরি করুন।"}
          </p>
        </div>

        <form action={formAction} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-6 px-6 py-6">
            {/* Category (only on create) */}
            {!isEdit && (
              <div>
                <label htmlFor="categoryId" className="mb-1.5 block text-sm font-medium text-slate-700">
                  ক্যাটাগরি <span className="text-rose-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="" disabled>
                    ক্যাটাগরি নির্বাচন করুন
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.subject ? `(${c.subject.name})` : ""}
                    </option>
                  ))}
                </select>
                {fieldError("categoryId") && (
                  <p className="mt-1.5 text-xs text-rose-600">{fieldError("categoryId")}</p>
                )}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                নাম <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nameRef}
                id="name"
                name="name"
                type="text"
                defaultValue={topic?.name}
                placeholder="যেমন: বাইনারি সার্চ"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              {fieldError("name") && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldError("name")}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-slate-700">
                স্লাগ <span className="text-rose-500">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={topic?.slug}
                placeholder="binary-search"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                URL-এ ব্যবহৃত হবে। শুধু ছোট হাতের অক্ষর ও হাইফেন।
              </p>
              {fieldError("slug") && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldError("slug")}</p>
              )}
            </div>

            {/* Order */}
            <div>
              <label htmlFor="order" className="mb-1.5 block text-sm font-medium text-slate-700">
                ক্রম
              </label>
              <input
                id="order"
                name="order"
                type="number"
                defaultValue={topic?.order ?? 0}
                className="w-28 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Active toggle (edit only) */}
            {isEdit && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">সক্রিয়</p>
                  <p className="text-xs text-slate-500">
                    নিষ্ক্রিয় করলে এটি প্রকাশ্যে দেখা যাবে না।
                  </p>
                </div>
                <input
                  type="hidden"
                  name="isActive"
                  value={topic?.isActive ? "true" : "false"}
                  id="isActive-hidden"
                />
                <button
                  type="button"
                  role="switch"
                  aria-checked={topic?.isActive}
                  onClick={(e) => {
                    const hidden = document.getElementById("isActive-hidden") as HTMLInputElement;
                    const next = hidden.value !== "true";
                    hidden.value = String(next);
                    e.currentTarget.dataset.on = String(next);
                  }}
                  data-on={topic?.isActive ? "true" : "false"}
                  className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition data-[on=true]:bg-cyan-600"
                >
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition data-[on=true]:translate-x-5" />
                </button>
              </div>
            )}

            {state.message && !state.success && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {state.message}
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
              className="flex-1 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              {pending
                ? "সংরক্ষণ হচ্ছে…"
                : isEdit
                ? "পরিবর্তন সংরক্ষণ করুন"
                : "টপিক তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}