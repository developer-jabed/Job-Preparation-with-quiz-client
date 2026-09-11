// components/reports/ReportQuestionModal.tsx
"use client";

import { useState, useTransition } from "react";
import { createReport } from "@/service/questionReport/questionReport.service"; // adjust path
import { X, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Incorrect answer",
  "Wrong explanation",
  "Typo / Grammar error",
  "Outdated information",
  "Duplicate question",
  "Inappropriate content",
  "Other",
];

interface Props {
  questionId: string;
  questionText?: string;
  open: boolean;
  onClose: () => void;
}

export default function ReportQuestionModal({
  questionId,
  questionText,
  open,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    startTransition(async () => {
      const result = await createReport({
        questionId,
        reason,
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message || "Report submitted successfully");
        setReason("");
        setDescription("");
        onClose();
      } else {
        toast.error(result.message || "Failed to submit report");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Question
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-5 py-5">
          {questionText && (
            <p className="line-clamp-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {questionText}
            </p>
          )}

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explain the issue so we can fix it faster..."
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !reason}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}