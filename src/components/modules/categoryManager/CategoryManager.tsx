"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteCategory, Category } from "@/service/category/category.service";
import { Subject } from "@/service/subject/subject.service";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { StatusPill } from "../subjectManagement/StatusPill";
import { ConfirmDialog } from "../subjectManagement/ConfirmDialog";


interface CategoryManagerProps {
  initialCategories: Category[];
  subjects: Subject[];
}

type StatusFilter = "all" | "active" | "inactive";

export function CategoryManager({ initialCategories, subjects }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.slug.toLowerCase().includes(query.toLowerCase()) ||
        c.subject?.name.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? c.isActive : !c.isActive);

      const matchesSubject =
        subjectFilter === "all" || c.subjectId === subjectFilter;

      return matchesQuery && matchesStatus && matchesSubject;
    });
  }, [categories, query, statusFilter, subjectFilter]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaved() {
    setFormOpen(false);
    showToast(editing ? "ক্যাটাগরি আপডেট হয়েছে" : "ক্যাটাগরি তৈরি হয়েছে");
    window.location.reload();
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    startDeleteTransition(async () => {
      const result = await deleteCategory(target.id);
      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== target.id));
        showToast(result.message ?? "ক্যাটাগরি মুছে ফেলা হয়েছে");
      } else {
        showToast(result.message ?? "মুছতে ব্যর্থ হয়েছে");
      }
      setPendingDelete(null);
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ক্যাটাগরি বা বিষয় খুঁজুন…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Subject filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="all">সব বিষয়</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(["all", "active", "inactive"] as StatusFilter[]).map((option) => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  statusFilter === option
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {option === "all" ? "সব" : option === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </button>
            ))}
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            নতুন ক্যাটাগরি
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">নাম</th>
              <th className="px-6 py-4">বিষয়</th>
              <th className="px-6 py-4">স্লাগ</th>
              <th className="px-6 py-4">টপিক</th>
              <th className="px-6 py-4">প্রশ্ন</th>
              <th className="px-6 py-4">স্ট্যাটাস</th>
              <th className="px-6 py-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500">
                      {categories.length === 0
                        ? "এখনও কোনো ক্যাটাগরি যোগ করা হয়নি — শুরু করতে “নতুন ক্যাটাগরি” চাপুন।"
                        : "কোনো ক্যাটাগরি খুঁজে পাওয়া যায়নি।"}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {filtered.map((category) => (
              <tr key={category.id} className="group transition hover:bg-violet-50/40">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {category.subject?.name ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                    {category.slug}
                  </code>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {category._count?.topics ?? 0}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {category._count?.questions ?? 0}
                </td>
                <td className="px-6 py-4">
                  <StatusPill active={category.isActive} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(category)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-violet-600 transition hover:bg-violet-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      সম্পাদনা
                    </button>
                    <button
                      onClick={() => setPendingDelete(category)}
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

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        subjects={subjects}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="ক্যাটাগরি মুছে ফেলবেন?"
        description={`"${pendingDelete?.name ?? ""}" মুছে ফেলা হলে এর সাথে যুক্ত টপিক ও প্রশ্নের উপর প্রভাব পড়তে পারে। প্রশ্ন থাকলে এটি শুধু নিষ্ক্রিয় করা হবে।`}
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