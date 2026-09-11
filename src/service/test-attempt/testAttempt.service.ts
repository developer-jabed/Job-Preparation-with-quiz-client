/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

// Matches the Prisma `AttemptStatus` enum exactly (was missing ABANDONED)
export type AttemptStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABANDONED"
  | "TIMED_OUT";

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  timeTakenSeconds: number | null;
  correctCount: number | null;
  wrongCount: number | null;
  skippedCount: number | null;
  obtainedMarks: number | null;
  totalMarks: number | null;
  accuracy: number | null;
  createdAt: string;
  test?: {
    id: string;
    title: string;
    titleHi?: string | null;
    testType?: string;
    durationMinutes?: number;
    totalQuestions?: number;
    totalMarks?: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptions: string[];
  timeSpentSeconds: number | null;
  isCorrect: boolean | null;
  marksObtained: number | null;
  question?: {
    id: string;
    // The backend returns `questionText` / `questionTextHi`, not `text` —
    // this was a real mismatch with the Prisma model and the service response.
    questionText: string;
    questionTextHi?: string | null;
    marks: number;
    negativeMarks: number;
    explanation?: string | null;
    explanationHi?: string | null;
    options: { id: string; text: string; textHi?: string | null; isCorrect: boolean }[];
  };
}

export interface AttemptResult extends TestAttempt {
  answers: UserAnswer[];
}

// Mirrors IStartAttempt
export interface StartAttemptPayload {
  testId: string;
}

// Mirrors ISaveAnswer
export interface SaveAnswerPayload {
  questionId: string;
  selectedOptions: string[];
  timeSpentSeconds?: number;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const MY_ATTEMPTS_TAG = "my-attempts";

// ────────────────────────────────────────────────
// Start (or resume) an attempt — POST /attempts/start
// ────────────────────────────────────────────────

export async function startAttempt(
  payload: StartAttemptPayload
): Promise<ActionResult<TestAttempt>> {
  try {
    if (!payload.testId) {
      return {
        success: false,
        message: "Test ID আবশ্যক",
      };
    }

    const response = await serverFetch.post("/attempts/start", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(MY_ATTEMPTS_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "টেস্ট শুরু হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টেস্ট শুরু করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Start attempt error:", error);
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
// Save / update a single answer — PATCH /attempts/:attemptId/answer
// Fires repeatedly while taking a test, so no revalidation here; nothing
// user-facing depends on cached data mid-attempt.
// ────────────────────────────────────────────────

export async function saveAnswer(
  attemptId: string,
  payload: SaveAnswerPayload
): Promise<ActionResult<UserAnswer>> {
  try {
    if (!payload.questionId) {
      return {
        success: false,
        message: "Question ID আবশ্যক",
      };
    }

    const response = await serverFetch.patch(`/attempts/${attemptId}/answer`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "উত্তর সেভ করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Save answer error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
    };
  }
}

// ────────────────────────────────────────────────
// Submit an attempt — POST /attempts/:attemptId/submit
// Scores server-side and updates the Redis leaderboard.
// ────────────────────────────────────────────────

export async function submitAttempt(
  attemptId: string
): Promise<ActionResult<AttemptResult>> {
  try {
    const response = await serverFetch.post(`/attempts/${attemptId}/submit`, {});

    const result = await response.json();

    if (result.success) {
      revalidateTag(MY_ATTEMPTS_TAG, REVALIDATE_MAX);
      revalidateTag(`attempt-${attemptId}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "টেস্ট সফলভাবে জমা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টেস্ট জমা দিতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Submit attempt error:", error);
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
// Get my attempts — GET /attempts/my
// ────────────────────────────────────────────────

export async function getMyAttempts(): Promise<{
  success: boolean;
  message?: string;
  data: TestAttempt[];
}> {
  try {
    const response = await serverFetch.get("/attempts/my", {
      next: { tags: [MY_ATTEMPTS_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "আপনার টেস্ট লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get my attempts error:", error);
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
// Get detailed result of one attempt — GET /attempts/:attemptId/result
// Own attempt only, and only once it's COMPLETED or TIMED_OUT
// (backend rejects IN_PROGRESS attempts here).
// ────────────────────────────────────────────────

export async function getAttemptResult(attemptId: string): Promise<{
  success: boolean;
  message?: string;
  data: AttemptResult | null;
}> {
  try {
    const response = await serverFetch.get(`/attempts/${attemptId}/result`, {
      next: { tags: [`attempt-${attemptId}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ফলাফল পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get attempt result error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: null,
    };
  }
}

// ────────────────────────────────────────────────
// Get single attempt by id — GET /attempts/:attemptId
// NOTE: this is NOT admin-only on the backend — the route only requires
// `auth()`, with no role check, and the service scopes the query to
// `{ id: attemptId, userId }`. It's meant for resuming/taking a test
// (options are returned without `isCorrect`), not an admin detail view.
// Renamed usage accordingly — call this for "resume test", not "admin view".
// ────────────────────────────────────────────────

export async function getAttemptById(id: string): Promise<{
  success: boolean;
  message?: string;
  data: AttemptResult | null;
}> {
  try {
    const response = await serverFetch.get(`/attempts/${id}`, {
      next: { tags: [`attempt-${id}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "অ্যাটেম্পট পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get attempt by id error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: null,
    };
  }
}


export async function getAllTestAttempts(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  testId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  success: boolean;
  message?: string;
  data: TestAttempt[];
  meta?: { page: number; limit: number; total: number };
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params?.testId) query.set("testId", params.testId);
    if (params?.status) query.set("status", params.status);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();

    const response = await serverFetch.get(
      `/attempts${qs ? `?${qs}` : ""}`,
      { next: { tags: ["test-attempts-list"] } }
    );

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "অ্যাটেম্পট লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    console.error("Get all test attempts error:", error);
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