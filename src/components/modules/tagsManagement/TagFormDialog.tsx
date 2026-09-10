"use client";

import { createTag, updateTag, Tag } from "@/service/tags/tags.service";
import { useActionState, useEffect, useRef } from "react";

interface TagFormDialogProps {
  open: boolean;
  tag: Tag | null;
  onClose: () => void;
  onSaved: () => void;
}

const initialState = {
  success: false,
  message: undefined as string | undefined,
  errors: [] as { field: PropertyKey; message: string }[],
};

export function TagFormDialog({
  open,
  tag,
  onClose,
  onSaved,
}: TagFormDialogProps) {
  const isEdit = Boolean(tag);
  const action = isEdit ? updateTag.bind(null, tag!.id) : createTag;
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
      <button
        aria-label="বন্ধ করুন"
        className="absolute inset-0"
        onClick={onClose}
        tabIndex={-1}
      />

      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-fuchsia-50 to-white px-6 py-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? "ট্যাগ সম্পাদনা করুন" : "নতুন ট্যাগ যোগ করুন"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "ট্যাগের নাম পরিবর্তন করুন।"
              : "প্রশ্নগুলোকে গ্রুপ করার জন্য নতুন ট্যাগ তৈরি করুন।"}
          </p>
        </div>

        <form action={formAction} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-6 px-6 py-6">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                নাম <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nameRef}
                id="name"
                name="name"
                type="text"
                defaultValue={tag?.name}
                placeholder="যেমন: গুরুত্বপূর্ণ, বোর্ড প্রশ্ন, সহজ"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
              />
              {fieldError("name") && (
                <p className="mt-1.5 text-xs text-rose-600">{fieldError("name")}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-400">
                স্লাগ স্বয়ংক্রিয়ভাবে তৈরি হবে।
              </p>
            </div>

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
              className="flex-1 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-fuchsia-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2"
            >
              {pending
                ? "সংরক্ষণ হচ্ছে…"
                : isEdit
                ? "পরিবর্তন সংরক্ষণ করুন"
                : "ট্যাগ তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}