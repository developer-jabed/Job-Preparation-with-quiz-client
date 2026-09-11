/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/dashboard/test-templates/TestTemplatesAdminClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import {
  TestTemplateItem,
  TemplateSection,
  createMasteryTemplate,
  updateMasteryTemplate,
  archiveMasteryTemplate,
} from "@/service/mastery/mastery.service";
import {
  Plus,
  Trash2,
  Loader2,
  LayoutTemplate,
  Archive,
  X,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SubjectOption = { id: string; name: string };

interface Props {
  initialTemplates: TestTemplateItem[];
  subjects: SubjectOption[];
  error?: string;
}

type SectionRow = {
  localId: string;
  subjectId: string;
  count: number;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TestTemplatesAdminClient({
  initialTemplates,
  subjects,
  error,
}: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [isPending, startTransition] = useTransition();
  const [openForm, setOpenForm] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(40);
  const [examTag, setExamTag] = useState("Computer Operator");
  const [isFeatured, setIsFeatured] = useState(true);
  const [sections, setSections] = useState<SectionRow[]>([
    { localId: crypto.randomUUID(), subjectId: "", count: 10 },
  ]);

  const totalQuestions = useMemo(
    () => sections.reduce((s, r) => s + (Number(r.count) || 0), 0),
    [sections]
  );

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setDurationMinutes(40);
    setExamTag("Computer Operator");
    setIsFeatured(true);
    setSections([{ localId: crypto.randomUUID(), subjectId: "", count: 10 }]);
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { localId: crypto.randomUUID(), subjectId: "", count: 10 },
    ]);
  };

  const removeSection = (localId: string) => {
    setSections((prev) =>
      prev.length <= 1 ? prev : prev.filter((s) => s.localId !== localId)
    );
  };

  const updateSection = (
    localId: string,
    patch: Partial<Pick<SectionRow, "subjectId" | "count">>
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, ...patch } : s))
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const finalSlug = slug.trim() || slugify(name);
    if (!finalSlug) {
      toast.error("Slug is required");
      return;
    }
    if (durationMinutes < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }

    const payloadSections: TemplateSection[] = [];
    for (const row of sections) {
      if (!row.subjectId) {
        toast.error("Select a subject for every row");
        return;
      }
      if (!row.count || row.count < 1) {
        toast.error("Each section needs at least 1 question");
        return;
      }
      const sub = subjects.find((s) => s.id === row.subjectId);
      payloadSections.push({
        subjectId: row.subjectId,
        subjectName: sub?.name,
        count: Number(row.count),
      });
    }

    // duplicate subject guard (optional)
    const ids = payloadSections.map((s) => s.subjectId);
    if (new Set(ids).size !== ids.length) {
      toast.error("Duplicate subjects in sections — merge or remove");
      return;
    }

    startTransition(async () => {
      const res = await createMasteryTemplate({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || undefined,
        durationMinutes,
        examTag: examTag.trim() || undefined,
        isFeatured,
        status: "ACTIVE",
        sections: payloadSections,
        selectionMode: "SMART",
      });

      if (res.success && res.data) {
        toast.success(res.message || "Template created");
        setTemplates((prev) => [res.data!, ...prev]);
        setOpenForm(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(res.message || "Failed to create");
      }
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const res = await archiveMasteryTemplate(id);
      if (res.success) {
        toast.success(res.message || "Archived");
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: "ARCHIVED" } : t
          )
        );
        router.refresh();
      } else {
        toast.error(res.message || "Archive failed");
      }
    });
  };

  const handleToggleFeatured = (t: TestTemplateItem) => {
    startTransition(async () => {
      const res = await updateMasteryTemplate(t.id, {
        isFeatured: !t.isFeatured,
      });
      if (res.success && res.data) {
        setTemplates((prev) =>
          prev.map((x) => (x.id === t.id ? { ...x, ...res.data } : x))
        );
        toast.success("Updated");
        router.refresh();
      } else {
        toast.error(res.message || "Update failed");
      }
    });
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {templates.filter((t) => t.status !== "ARCHIVED").length} active
          templates · Total questions auto-summed from sections
        </p>
        <button
          type="button"
          onClick={() => {
            setOpenForm((v) => !v);
            if (openForm) resetForm();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          {openForm ? (
            <>
              <X className="h-4 w-4" />
              Close
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              New template
            </>
          )}
        </button>
      </div>

      {/* Create form */}
      {openForm && (
        <div className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm dark:border-violet-900 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Create test template
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Name *
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug || slug === slugify(name)) {
                    setSlug(slugify(e.target.value));
                  }
                }}
                placeholder="Computer Operator Mock"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Slug *
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="computer-operator-mock"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Exam tag
              </label>
              <input
                value={examTag}
                onChange={(e) => setExamTag(e.target.value)}
                placeholder="Computer Operator"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300"
              />
              Featured on Practice page
            </label>
          </div>

          {/* Sections */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Subjects & question counts
              </h3>
              <span className="text-xs text-gray-500">
                Total: <strong>{totalQuestions}</strong> questions
              </span>
            </div>

            {subjects.length === 0 && (
              <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                No subjects found. Create subjects under Content Management
                first.
              </p>
            )}

            <div className="space-y-2">
              {sections.map((row, index) => (
                <div
                  key={row.localId}
                  className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40 sm:flex-row sm:items-center"
                >
                  <span className="hidden text-gray-400 sm:block">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <span className="w-6 text-xs font-medium text-gray-400">
                    {index + 1}
                  </span>
                  <select
                    value={row.subjectId}
                    onChange={(e) =>
                      updateSection(row.localId, {
                        subjectId: e.target.value,
                      })
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select subject…</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={row.count}
                      onChange={(e) =>
                        updateSection(row.localId, {
                          count: Number(e.target.value),
                        })
                      }
                      className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <span className="text-xs text-gray-500">Qs</span>
                    <button
                      type="button"
                      onClick={() => removeSection(row.localId)}
                      disabled={sections.length <= 1}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSection}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              <Plus className="h-4 w-4" />
              Add subject
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpenForm(false);
                resetForm();
              }}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending || subjects.length === 0}
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LayoutTemplate className="h-4 w-4" />
              )}
              Save template
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {templates.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            No templates yet. Create one with subjects & question counts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">Questions</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {templates.map((t) => {
                  const cfg = t.config as any;
                  const sectionCount = cfg?.sections?.length ?? "—";
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {t.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.slug}
                          {t.examTag ? ` · ${t.examTag}` : ""}
                          {typeof sectionCount === "number"
                            ? ` · ${sectionCount} subjects`
                            : ""}
                        </p>
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {t.totalQuestions}
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {t.durationMinutes}m
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleFeatured(t)}
                          className={`text-xs font-medium ${
                            t.isFeatured
                              ? "text-amber-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {t.isFeatured ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleArchive(t.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Archive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Saving a template does not create a test. Each learner “Start practice”
        generates a new test from this blueprint.
      </p>
    </div>
  );
}