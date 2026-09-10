"use client";

import { useMemo, useState, useTransition } from "react";
import { TagFormDialog } from "./TagFormDialog";
import { deleteTag, Tag } from "@/service/tags/tags.service";
import { ConfirmDialog } from "../subjectManagement/ConfirmDialog";


interface TagManagerProps {
  initialTags: Tag[];
}

export function TagManager({ initialTags }: TagManagerProps) {
  const [tags, setTags] = useState(initialTags);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tags.filter((t) => {
      if (!query) return true;
      return (
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.slug.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [tags, query]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(tag: Tag) {
    setEditing(tag);
    setFormOpen(true);
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaved() {
    setFormOpen(false);
    showToast(editing ? "ট্যাগ আপডেট হয়েছে" : "ট্যাগ তৈরি হয়েছে");
    window.location.reload();
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    startDeleteTransition(async () => {
      const result = await deleteTag(target.id);
      if (result.success) {
        setTags((prev) => prev.filter((t) => t.id !== target.id));
        showToast(result.message ?? "ট্যাগ মুছে ফেলা হয়েছে");
      } else {
        showToast(result.message ?? "মুছতে ব্যর্থ হয়েছে");
      }
      setPendingDelete(null);
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
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
            placeholder="ট্যাগ খুঁজুন…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          নতুন ট্যাগ
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">নাম</th>
              <th className="px-6 py-4">স্লাগ</th>
              <th className="px-6 py-4">প্রশ্ন সংখ্যা</th>
              <th className="px-6 py-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500">
                      {tags.length === 0
                        ? "এখনও কোনো ট্যাগ যোগ করা হয়নি — শুরু করতে “নতুন ট্যাগ” চাপুন।"
                        : "কোনো ট্যাগ খুঁজে পাওয়া যায়নি।"}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {filtered.map((tag) => (
              <tr key={tag.id} className="group transition hover:bg-fuchsia-50/40">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{tag.name}</div>
                </td>
                <td className="px-6 py-4">
                  <code className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                    {tag.slug}
                  </code>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {tag._count?.questions ?? 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(tag)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-fuchsia-600 transition hover:bg-fuchsia-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      সম্পাদনা
                    </button>
                    <button
                      onClick={() => setPendingDelete(tag)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      মুছুন
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TagFormDialog
        open={formOpen}
        tag={editing}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="ট্যাগ মুছে ফেলবেন?"
        description={`"${pendingDelete?.name ?? ""}" মুছে ফেলা হলে এর সাথে যুক্ত প্রশ্নগুলো থেকে ট্যাগটি সরিয়ে ফেলা হবে।`}
        pending={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}