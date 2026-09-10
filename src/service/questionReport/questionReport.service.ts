/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";

export interface QuestionReport {
  id: string;
  userId: string;
  questionId: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MyQuestionReport extends QuestionReport {
  question: {
    id: string;
    questionText: string;
    subject: { id: string; name: string };
  };
}

export interface AdminQuestionReport extends QuestionReport {
  user: { id: string; name: string; email: string };
  question: {
    id: string;
    questionText: string;
    difficulty: string;
    subject: { id: string; name: string };
  };
}

// Mirrors ICreateReport
export interface CreateReportPayload {
  questionId: string;
  reason: string;
  description?: string;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const MY_REPORTS_TAG = "my-reports";
const ALL_REPORTS_TAG = "all-reports";

// ────────────────────────────────────────────────
// Create — any authenticated learner
// ────────────────────────────────────────────────

export async function createReport(
  payload: CreateReportPayload
): Promise<ActionResult<QuestionReport>> {
  try {
    if (!payload.questionId || !payload.reason) {
      return {
        success: false,
        message: "Question এবং Reason আবশ্যক",
      };
    }

    const response = await serverFetch.post("/reports", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(MY_REPORTS_TAG, REVALIDATE_MAX);
      revalidateTag(ALL_REPORTS_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "রিপোর্ট সফলভাবে জমা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "রিপোর্ট জমা দিতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create report error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ────────────────────────────────────────────────
// Get my reports — any authenticated user, own reports only
// ────────────────────────────────────────────────

export async function getMyReports(): Promise<{
  success: boolean;
  message?: string;
  data: MyQuestionReport[];
}> {
  try {
    const response = await serverFetch.get("/reports/my", {
      next: { tags: [MY_REPORTS_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "আপনার রিপোর্ট লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get my reports error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: [],
    };
  }
}

// ────────────────────────────────────────────────
// Get all reports — admin only, optionally filtered by status
// ────────────────────────────────────────────────

export async function getAllReports(status?: ReportStatus): Promise<{
  success: boolean;
  message?: string;
  data: AdminQuestionReport[];
}> {
  try {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";

    const response = await serverFetch.get(`/reports${qs}`, {
      next: { tags: [ALL_REPORTS_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "রিপোর্ট লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get all reports error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: [],
    };
  }
}

// ────────────────────────────────────────────────
// Update report status — admin only
// ────────────────────────────────────────────────

export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<ActionResult<QuestionReport>> {
  try {
    const response = await serverFetch.patch(`/reports/${id}/status`, {
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(ALL_REPORTS_TAG, REVALIDATE_MAX);
      revalidateTag(MY_REPORTS_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "রিপোর্ট স্ট্যাটাস আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update report status error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}