/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    ensureMasteryDefaults,
    // If you want to trigger template actions from here you can import them
} from "@/service/mastery/mastery.service"; // or "@/actions/mastery" depending on your structure
import type {
    MasterySetupStatus,
    TestTemplateItem,
} from "@/service/mastery/mastery.service"; // adjust import path

type SubjectOption = { id: string; name: string };

interface MasteryAdminClientProps {
    initialStatus: MasterySetupStatus | null;
    initialTemplates: TestTemplateItem[];
    subjects: SubjectOption[];
    error?: string;
}

export default function MasteryAdminClient({
    initialStatus,
    initialTemplates,
    subjects,
    error,
}: MasteryAdminClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(initialStatus);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(
        null
    );

    const handleEnsureDefaults = () => {
        startTransition(async () => {
            setMessage(null);
            const res = await ensureMasteryDefaults();
            if (res.success) {
                setMessage(res.message || "Default policy ready");
                setMessageType("success");
                // Refresh the page so server data is up-to-date
                router.refresh();
            } else {
                setMessage(res.message || "Failed to set defaults");
                setMessageType("error");
            }
        });
    };

    const policy = status?.policy;
    const content = status?.content;
    const ready = status?.ready ?? false;

    return (
        <div className="space-y-8">
            {/* Error banner from server */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Toast / feedback */}
            {message && (
                <div
                    className={`rounded-lg border px-4 py-3 text-sm ${messageType === "success"
                            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300"
                            : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                        }`}
                >
                    {message}
                </div>
            )}

            {/* ── Status Cards ─────────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Ready status */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Setup Status
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                        {ready ? (
                            <span className="text-green-600 dark:text-green-400">Ready</span>
                        ) : (
                            <span className="text-amber-600 dark:text-amber-400">
                                Needs setup
                            </span>
                        )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Default generation policy
                    </p>
                </div>

                {/* Policy info */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Policy
                    </p>
                    <p className="mt-2 text-lg font-semibold truncate">
                        {policy?.name ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Cooldown: {policy?.cooldownDays ?? "—"} days
                        {policy?.maxShowInWindow != null &&
                            ` · Max ${policy.maxShowInWindow}/${policy.windowDays ?? "?"}d`}
                    </p>
                </div>

                {/* Content stats */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Content
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                        {content?.subjects ?? 0}{" "}
                        <span className="text-base font-normal text-gray-500">
                            subjects
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        {content?.questions?.toLocaleString() ?? 0} active questions
                    </p>
                </div>

                {/* Can create? */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Templates
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                        {initialTemplates.length}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        {content?.canCreateTemplate
                            ? "You can create new templates"
                            : "Add subjects first"}
                    </p>
                </div>
            </div>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={handleEnsureDefaults}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
                >
                    {isPending ? "Setting up…" : "Ensure Default Policy"}
                </button>

                <a
                    href="/admin/test-templates" // adjust to your real route
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    Manage Test Templates →
                </a>
            </div>

            {/* ── Policy details ───────────────────────────────────────────── */}
            {policy && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Generation Policy
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Controls how questions are selected for adaptive / mastery tests
                        (SMART mode).
                    </p>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-gray-500">Name</dt>
                            <dd className="mt-1 font-medium">{policy.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500">
                                Cooldown Days
                            </dt>
                            <dd className="mt-1 font-medium">{policy.cooldownDays}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500">
                                Max Show in Window
                            </dt>
                            <dd className="mt-1 font-medium">
                                {policy.maxShowInWindow ?? "—"} / {policy.windowDays ?? "—"} days
                            </dd>
                        </div>
                    </dl>
                </div>
            )}

            {/* ── Templates overview ───────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Test Templates
                        </h2>
                        <p className="text-sm text-gray-500">
                            Subject-based templates used for mastery / practice generation
                        </p>
                    </div>
                    <a
                        href="/admin/test-templates"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        View all
                    </a>
                </div>

                {initialTemplates.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                        No templates yet. Create one from the Test Templates page after
                        ensuring the default policy is ready.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Questions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Mode
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {initialTemplates.map((t) => {
                                    const config = t.config as any;
                                    const mode = config?.selectionMode ?? "—";
                                    return (
                                        <tr
                                            key={t.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {t.name}
                                                </div>
                                                <div className="text-xs text-gray-500">{t.slug}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {t.totalQuestions}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {t.durationMinutes} min
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {mode}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Subjects quick view ──────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Available Subjects ({subjects.length})
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    These can be used when creating subject-based templates.
                </p>
                {subjects.length === 0 ? (
                    <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                        No active subjects. Create subjects first before making templates.
                    </p>
                ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {subjects.map((s) => (
                            <span
                                key={s.id}
                                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                {s.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}