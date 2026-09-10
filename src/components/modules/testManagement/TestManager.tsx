"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteTest, Test } from "@/service/test/test.service";
import { Subject } from "@/service/subject/subject.service";
import { Category } from "@/service/category/category.service";
import { Question } from "@/service/question/question.service";
import { TestFormDialog } from "./TestFormDialog";
import { StatusPill } from "../subjectManagement/StatusPill";
import { ConfirmDialog } from "../subjectManagement/ConfirmDialog";


interface TestManagerProps {
  initialTests: Test[];
  subjects: Subject[];
  categories: Category[];
  questions: Question[];
}

type StatusFilter = "all" | "active" | "inactive";

export function TestManager({
  initialTests,
  subjects,
  categories,
  questions,
}: TestManagerProps) {
  const [tests, setTests] = useState(initialTests);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Test | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Test | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.slug.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? t.isActive : !t.isActive);

      const matchesSubject =
        subjectFilter === "all" || t.subjectId === subjectFilter;

      return matchesQuery && matchesStatus && matchesSubject;
    });
  }, [tests, query, statusFilter, subjectFilter]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(test: Test) {
    setEditing(test);
    setFormOpen(true);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaved() {
    setFormOpen(false);
    showToast(editing ? "টেস্ট আপডেট হয়েছে" : "টেস্ট তৈরি হয়েছে");
    window.location.reload();
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    startDeleteTransition(async () => {
      const result = await deleteTest(target.id);
      if (result.success) {
        setTests((prev) => prev.filter((t) => t.id !== target.id));
        showToast(result.message ?? "টেস্ট মুছে ফেলা হয়েছে");
      } else {
        showToast(result.message ?? "মুছতে ব্যর্থ");
      }
      setPendingDelete(null);
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
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
            placeholder="টেস্ট খুঁজুন…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-blue-500"
          >
            <option value="all">সব বিষয়</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(["all", "active", "inactive"] as StatusFilter[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  statusFilter === opt
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt === "all" ? "সব" : opt === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </button>
            ))}
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            নতুন টেস্ট
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">টাইটেল</th>
              <th className="px-6 py-4">বিষয়</th>
              <th className="px-6 py-4">প্রশ্ন</th>
              <th className="px-6 py-4">মার্কস</th>
              <th className="px-6 py-4">স্ট্যাটাস</th>
              <th className="px-6 py-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                  কোনো টেস্ট পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filtered.map((test) => (
                <tr key={test.id} className="group transition hover:bg-blue-50/30">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{test.title}</div>
                    <div className="mt-0.5 flex gap-2">
                      {test.isFree && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                          ফ্রি
                        </span>
                      )}
                      {test.isFeatured && (
                        <span className="rounded bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700">
                          ফিচার্ড
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {test.subject?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {test.totalQuestions}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {test.totalMarks}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill active={test.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(test)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        সম্পাদনা
                      </button>
                      <button
                        onClick={() => setPendingDelete(test)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        মুছুন
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TestFormDialog
        open={formOpen}
        test={editing}
        subjects={subjects}
        categories={categories}
        questions={questions}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="টেস্ট মুছে ফেলবেন?"
        description={`"${pendingDelete?.title ?? ""}" মুছে ফেলা হবে। এর সাথে যুক্ত সব অ্যাটেম্পটও হারিয়ে যেতে পারে।`}
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