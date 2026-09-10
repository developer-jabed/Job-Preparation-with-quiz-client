/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
  question: {
    id: string;
    questionText: string;
    difficulty: string;
    questionType: string;
    subject: { id: string; name: string; slug: string };
    category: { id: string; name: string } | null;
    topic: { id: string; name: string } | null;
  };
}

// Mirrors ICreateBookmark
export interface CreateBookmarkPayload {
  questionId: string;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const MY_BOOKMARKS_TAG = "my-bookmarks";

// ────────────────────────────────────────────────
// Add — any authenticated user
// ────────────────────────────────────────────────

export async function addBookmark(
  payload: CreateBookmarkPayload
): Promise<ActionResult<Bookmark>> {
  try {
    if (!payload.questionId) {
      return {
        success: false,
        message: "Question ID আবশ্যক",
      };
    }

    const response = await serverFetch.post("/bookmarks", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      // Backend invalidates its own Redis cache on write; this just busts
      // the Next.js fetch cache for this user's bookmark list/check views.
      revalidateTag(MY_BOOKMARKS_TAG, REVALIDATE_MAX);
      revalidateTag(`bookmark-check-${payload.questionId}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "বুকমার্ক যোগ করা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "বুকমার্ক করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Add bookmark error:", error);
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
// Remove — any authenticated user, own bookmark only
// ────────────────────────────────────────────────

export async function removeBookmark(questionId: string): Promise<ActionResult> {
  try {
    const response = await serverFetch.delete(`/bookmarks/${questionId}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(MY_BOOKMARKS_TAG, REVALIDATE_MAX);
      revalidateTag(`bookmark-check-${questionId}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "বুকমার্ক সরানো হয়েছে!",
      };
    }

    return {
      success: false,
      message: result.message || "বুকমার্ক সরাতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Remove bookmark error:", error);
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
// Get my bookmarks — any authenticated user, own bookmarks only
// (backend itself caches this in Redis for 5 minutes; the tag here is a
// separate, Next.js-side cache layer on top of that)
// ────────────────────────────────────────────────

export async function getMyBookmarks(): Promise<{
  success: boolean;
  message?: string;
  data: Bookmark[];
}> {
  try {
    const response = await serverFetch.get("/bookmarks/my", {
      next: { tags: [MY_BOOKMARKS_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "বুকমার্ক লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get my bookmarks error:", error);
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
// Check if a single question is bookmarked — any authenticated user
// ────────────────────────────────────────────────

export async function checkIsBookmarked(questionId: string): Promise<{
  success: boolean;
  message?: string;
  data: { isBookmarked: boolean };
}> {
  try {
    const response = await serverFetch.get(`/bookmarks/check/${questionId}`, {
      next: { tags: [`bookmark-check-${questionId}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "বুকমার্ক স্ট্যাটাস পাওয়া যায়নি",
        data: { isBookmarked: false },
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Check is bookmarked error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: { isBookmarked: false },
    };
  }
}