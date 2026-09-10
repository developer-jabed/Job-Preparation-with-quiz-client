/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface QuestionOption {
  id?: string;
  text: string;
  textHi?: string;
  isCorrect: boolean;
  order?: number;
}

export interface QuestionTag {
  tag: { id: string; name: string };
}

export interface Question {
  id: string;
  subjectId: string;
  categoryId: string | null;
  topicId: string | null;
  questionText: string;
  questionTextHi?: string | null;
  explanation?: string | null;
  explanationHi?: string | null;
  isActive: boolean;
  isPreviousYear: boolean;
  year: number | null;
  marks?: number;
  negativeMarks?: number;
  difficulty?: string;
  questionType?: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
  subject?: { id: string; name: string; slug: string };
  category?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
  tags?: QuestionTag[];
  createdBy?: { id: string; name: string };
  reviewedBy?: { id: string; name: string } | null;
  _count?: { testQuestions: number; bookmarks: number };
}

export interface QuestionPayload {
  subjectId: string;
  categoryId?: string | null;
  topicId?: string | null;
  questionText: string;
  questionTextHi?: string;
  explanation?: string;
  isActive?: boolean;
  isPreviousYear?: boolean;
  year?: number;
  options: { text: string; textHi?: string; isCorrect: boolean; order?: number }[];
  tagIds?: string[];
}

export type QuestionUpdatePayload = Partial<QuestionPayload>;

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
const QUESTIONS_LIST_TAG = "questions-list";

// ────────────────────────────────────────────────
// Create
// ────────────────────────────────────────────────

export async function createQuestion(
  payload: QuestionPayload
): Promise<ActionResult<Question>> {
  try {
    if (!payload.subjectId || !payload.questionText?.trim()) {
      return {
        success: false,
        message: "Subject এবং Question Text আবশ্যক",
      };
    }

    if (!payload.options || payload.options.length < 2) {
      return {
        success: false,
        message: "কমপক্ষে ২টি Option আবশ্যক",
      };
    }

    if (!payload.options.some((o) => o.isCorrect)) {
      return {
        success: false,
        message: "কমপক্ষে একটি সঠিক Option নির্বাচন করুন",
      };
    }

    const cleanPayload = {
      subjectId: payload.subjectId,
      categoryId: payload.categoryId || null,
      topicId: payload.topicId || null,
      questionText: payload.questionText.trim(),
      questionTextHi: payload.questionTextHi?.trim() || undefined,
      explanation: payload.explanation?.trim() || undefined,
      isActive: payload.isActive ?? true,
      isPreviousYear: payload.isPreviousYear ?? false,
      year: payload.year || undefined,
      options: payload.options
        .filter((o) => o.text.trim())
        .map((o, idx) => ({
          text: o.text.trim(),
          textHi: o.textHi?.trim() || undefined,
          isCorrect: o.isCorrect,
          order: o.order ?? idx,
        })),
      tagIds: payload.tagIds || undefined,
    };

    console.log("=== SENDING PAYLOAD ===");
    console.log(JSON.stringify(cleanPayload, null, 2));

    const response = await serverFetch.post("/questions", {
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
        message: result.message || result.error || "প্রশ্ন তৈরি করতে ব্যর্থ হয়েছে",
        errors: result.errors || [],
      };
    }

    revalidateTag(QUESTIONS_LIST_TAG, REVALIDATE_MAX);
    if (cleanPayload.topicId) {
      revalidateTag(`topic-${cleanPayload.topicId}`, REVALIDATE_MAX);
    }
    if (cleanPayload.categoryId) {
      revalidateTag(`category-${cleanPayload.categoryId}`, REVALIDATE_MAX);
    }
    revalidateTag(`subject-${cleanPayload.subjectId}`, REVALIDATE_MAX);

    return {
      success: true,
      message: "প্রশ্ন সফলভাবে তৈরি হয়েছে!",
      data: result.data,
    };
  } catch (error: any) {
    console.error("=== CREATE QUESTION CATCH ERROR ===", error);
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
// Read (list)
// ────────────────────────────────────────────────

export async function getAllQuestions(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  subjectId?: string;
  categoryId?: string;
  topicId?: string;
  isActive?: boolean;
  isPreviousYear?: boolean;
  year?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  success: boolean;
  message?: string;
  data: Question[];
  meta?: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params?.subjectId) query.set("subjectId", params.subjectId);
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.topicId) query.set("topicId", params.topicId);
    if (params?.isActive !== undefined)
      query.set("isActive", String(params.isActive));
    if (params?.isPreviousYear !== undefined)
      query.set("isPreviousYear", String(params.isPreviousYear));
    if (params?.year) query.set("year", String(params.year));
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();

    const response = await serverFetch.get(`/questions${qs ? `?${qs}` : ""}`, {
      next: { tags: [QUESTIONS_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "প্রশ্ন লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    console.error("Get all questions error:", error);
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
// Read (single)
// ────────────────────────────────────────────────

export async function getQuestionById(id: string): Promise<{
  success: boolean;
  message?: string;
  data: Question | null;
}> {
  try {
    const response = await serverFetch.get(`/questions/${id}`, {
      next: { tags: [QUESTIONS_LIST_TAG, `question-${id}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "প্রশ্ন পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get question by id error:", error);
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
// Update
// ────────────────────────────────────────────────

export async function updateQuestion(
  id: string,
  payload: QuestionUpdatePayload
): Promise<ActionResult<Question>> {
  try {
    if (payload.options && payload.options.length > 0) {
      if (payload.options.length < 2) {
        return {
          success: false,
          message: "কমপক্ষে ২টি Option আবশ্যক",
        };
      }
      if (!payload.options.some((o) => o.isCorrect)) {
        return {
          success: false,
          message: "কমপক্ষে একটি সঠিক Option নির্বাচন করুন",
        };
      }
    }

    // Clean the payload for update as well
    const cleanPayload: any = { ...payload };
    if (payload.questionText) {
      cleanPayload.questionText = payload.questionText.trim();
    }
    if (payload.categoryId === "") cleanPayload.categoryId = null;
    if (payload.topicId === "") cleanPayload.topicId = null;

    const response = await serverFetch.patch(`/questions/${id}`, {
      body: JSON.stringify(cleanPayload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(QUESTIONS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`question-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "প্রশ্ন সফলভাবে আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "প্রশ্ন আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update question error:", error);
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
// Soft delete
// ────────────────────────────────────────────────

export async function softDeleteQuestion(
  id: string
): Promise<ActionResult<Question>> {
  try {
    const response = await serverFetch.delete(`/questions/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(QUESTIONS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`question-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "প্রশ্ন মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Soft delete question error:", error);
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
// Restore
// ────────────────────────────────────────────────

export async function restoreQuestion(
  id: string
): Promise<ActionResult<Question>> {
  try {
    const response = await serverFetch.patch(`/questions/${id}/restore`, {});

    const result = await response.json();

    if (result.success) {
      revalidateTag(QUESTIONS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`question-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "প্রশ্ন সফলভাবে পুনরুদ্ধার হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "প্রশ্ন পুনরুদ্ধার করতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Restore question error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}