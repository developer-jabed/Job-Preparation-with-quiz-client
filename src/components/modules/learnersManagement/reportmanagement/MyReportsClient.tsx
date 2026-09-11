/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(learner)/reports/MyReportsClient.tsx
"use client";

import { MyQuestionReport, ReportStatus } from "@/service/questionReport/questionReport.service";
import { Flag, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  initialReports: MyQuestionReport[];
  initialError?: string;
}

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  REVIEWED: {
    label: "Reviewed",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    icon: <Flag className="h-3.5 w-3.5" />,
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export default function MyReportsClient({ initialReports, initialError }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    return initialReports.filter((r) => {
      const matchesSearch =
        search === "" ||
        r.question.questionText.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialReports, search, statusFilter]);

  if (initialError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {initialError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <Flag className="mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-600 dark:text-gray-300">
            {initialReports.length === 0 ? "No reports yet" : "No matching reports"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const status = STATUS_CONFIG[report.status];

            return (
              <div
                key={report.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {report.question.subject.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                      {report.question.questionText}
                    </p>

                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <span className="text-gray-500">Reason:</span>{" "}
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {report.reason}
                        </span>
                      </p>
                      {report.description && (
                        <p className="text-gray-500">{report.description}</p>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      Submitted on{" "}
                      {new Date(report.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}