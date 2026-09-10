/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface TestOption {
  id: string;
  text: string;
  textHi?: string | null;
  order: number;
  // Only present when fetched with hideAnswers=false (admin view)
  isCorrect?: boolean;
}

export interface TestQuestionEntry {
  questionId: string;
  order: number;
  marks: number;
  question: {
    id: string;
    text: string;
    textHi?: string | null;
    marks: number;
    options: TestOption[];
  };
}

export interface Test {
  id: string;
  subjectId: string;
  categoryId: string | null;
  title: string;
  slug: string;
  isFree: boolean;
  isActive: boolean;
  isFeatured: boolean;
  durationMinutes?: number;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string; slug: string };
  category?: { id: string; name: string } | null;
  questions?: TestQuestionEntry[];
  _count?: { attempts: number; questions: number };
}

// Mirrors ICreateTest — questionIds get expanded into TestQuestion rows
// server-side, marks/totalQuestions/totalMarks are computed there too.
export interface TestPayload {
  subjectId: string;
  categoryId?: string | null;
  title: string;
  slug?: string;
  durationMinutes: number;   // ← required
  isFree?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  questionIds: string[];
}

export type TestUpdatePayload = Partial<TestPayload>;

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const TESTS_LIST_TAG = "tests-list";

// ────────────────────────────────────────────────
// Create — admin only
// ────────────────────────────────────────────────
export async function createTest(
  payload: TestPayload
): Promise<ActionResult<Test>> {
  try {
    if (!payload.subjectId || !payload.title) {
      return {
        success: false,
        message: "Subject এবং Title আবশ্যক",
      };
    }

    if (!payload.durationMinutes || payload.durationMinutes < 1) {
      return {
        success: false,
        message: "সময়সীমা (durationMinutes) আবশ্যক এবং ১ মিনিটের বেশি হতে হবে",
      };
    }

    if (!payload.questionIds || payload.questionIds.length === 0) {
      return {
        success: false,
        message: "কমপক্ষে ১টি প্রশ্ন নির্বাচন করুন",
      };
    }

    const cleanPayload = {
      subjectId: payload.subjectId,
      categoryId: payload.categoryId || null,
      title: payload.title.trim(),
      slug: payload.slug?.trim() || undefined,
      durationMinutes: Number(payload.durationMinutes), // ← important
      isFree: payload.isFree ?? true,
      isActive: payload.isActive ?? true,
      isFeatured: payload.isFeatured ?? false,
      questionIds: payload.questionIds,
    };

    console.log("=== SENDING TEST PAYLOAD ===");
    console.log(JSON.stringify(cleanPayload, null, 2));

    const response = await serverFetch.post("/tests", {
      body: JSON.stringify(cleanPayload),
      headers: { "Content-Type": "application/json" },
    });

    console.log("=== BACKEND STATUS ===", response.status);

    const result = await response.json();
    console.log("=== BACKEND RESPONSE ===");
    console.log(JSON.stringify(result, null, 2));

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || result.error || "টেস্ট তৈরি করতে ব্যর্থ হয়েছে",
        errors: result.errors || result.error || [],
      };
    }

    revalidateTag(TESTS_LIST_TAG, REVALIDATE_MAX);
    revalidateTag(`subject-${payload.subjectId}`, REVALIDATE_MAX);
    if (payload.categoryId) {
      revalidateTag(`category-${payload.categoryId}`, REVALIDATE_MAX);
    }

    return {
      success: true,
      message: "টেস্ট সফলভাবে তৈরি হয়েছে!",
      data: result.data,
    };
  } catch (error: any) {
    console.error("=== CREATE TEST CATCH ERROR ===", error);
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
// Read (list) — requires auth (route uses auth() with no role restriction)
// ────────────────────────────────────────────────

export async function getAllTests(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  subjectId?: string;
  categoryId?: string;
  isFree?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  success: boolean;
  message?: string;
  data: Test[];
  meta?: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params?.subjectId) query.set("subjectId", params.subjectId);
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.isFree !== undefined) query.set("isFree", String(params.isFree));
    if (params?.isActive !== undefined)
      query.set("isActive", String(params.isActive));
    if (params?.isFeatured !== undefined)
      query.set("isFeatured", String(params.isFeatured));
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();

    const response = await serverFetch.get(`/tests${qs ? `?${qs}` : ""}`, {
      next: { tags: [TESTS_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "টেস্ট লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    console.error("Get all tests error:", error);
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
// Read (single, by id or slug) — requires auth
// Options hide correct answers unless the caller is an admin viewing the
// answer key (matches the backend's hideAnswers flag on the service layer;
// the route itself doesn't expose that param, so it's controller-decided —
// pass hideAnswers through only if your backend route actually accepts it).
// ────────────────────────────────────────────────

export async function getTestByIdOrSlug(idOrSlug: string): Promise<{
  success: boolean;
  message?: string;
  data: Test | null;
}> {
  try {
    const response = await serverFetch.get(`/tests/${idOrSlug}`, {
      next: { tags: [TESTS_LIST_TAG, `test-${idOrSlug}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "টেস্ট পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get test by id/slug error:", error);
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
// Update — admin only
// ────────────────────────────────────────────────

export async function updateTest(
  id: string,
  payload: TestUpdatePayload
): Promise<ActionResult<Test>> {
  try {
    if (payload.questionIds && payload.questionIds.length === 0) {
      return {
        success: false,
        message: "কমপক্ষে ১টি প্রশ্ন নির্বাচন করুন",
      };
    }

    const response = await serverFetch.patch(`/tests/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(TESTS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`test-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "টেস্ট সফলভাবে আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টেস্ট আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update test error:", error);
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
// Delete — admin only (hard delete; backend has no soft-delete/dependent
// guard for tests the way Subject/Category/Topic/Question do)
// ────────────────────────────────────────────────

export async function deleteTest(id: string): Promise<ActionResult<Test>> {
  try {
    const response = await serverFetch.delete(`/tests/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(TESTS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`test-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "টেস্ট সফলভাবে মুছে ফেলা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টেস্ট মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Delete test error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}