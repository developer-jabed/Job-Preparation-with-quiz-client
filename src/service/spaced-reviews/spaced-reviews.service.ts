 /* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface SpacedReview {
  id: string;
  userId: string;
  questionId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  createdAt: string;
}

export interface DueReviewQuestionOption {
  id: string;
  text: string;
  textHi?: string | null;
  order: number;
  isCorrect: boolean;
}

export interface DueReview extends SpacedReview {
  question: {
    id: string;
    questionText: string;
    difficulty: string;
    options: DueReviewQuestionOption[];
    subject: { id: string; name: string; slug: string };
    category: { id: string; name: string } | null;
    topic: { id: string; name: string } | null;
  };
}

export interface MySpacedReview extends SpacedReview {
  question: {
    id: string;
    questionText: string;
    difficulty: string;
    subject: { id: string; name: string };
  };
}

// Mirrors submitReviewZodSchema — SM-2 quality rating, 0-5
export interface SubmitReviewPayload {
  quality: number;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const DUE_REVIEWS_TAG = "due-reviews";
const MY_SPACED_REVIEWS_TAG = "my-spaced-reviews";

// ────────────────────────────────────────────────
// Add a question to spaced review — any authenticated user
// ────────────────────────────────────────────────

export async function addToSpacedReview(
  questionId: string
): Promise<ActionResult<SpacedReview>> {
  try {
    if (!questionId) {
      return {
        success: false,
        message: "Question ID আবশ্যক",
      };
    }

    const response = await serverFetch.post("/spaced-reviews", {
      body: JSON.stringify({ questionId }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      // Backend invalidates its own Redis "due-reviews" cache on write;
      // this busts the Next.js fetch cache layer on top of that.
      revalidateTag(DUE_REVIEWS_TAG, REVALIDATE_MAX);
      revalidateTag(MY_SPACED_REVIEWS_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "স্পেসড রিভিউতে যোগ করা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "স্পেসড রিভিউতে যোগ করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Add to spaced review error:", error);
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
// Get questions due for review right now — any authenticated user
// (backend also caches this in Redis for 2 minutes, capped at 40 items)
// ────────────────────────────────────────────────

export async function getDueReviews(): Promise<{
  success: boolean;
  message?: string;
  data: DueReview[];
}> {
  try {
    const response = await serverFetch.get("/spaced-reviews/due", {
      next: { tags: [DUE_REVIEWS_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "রিভিউ লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get due reviews error:", error);
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
// Submit a review (SM-2 quality rating 0-5) — any authenticated user
// ────────────────────────────────────────────────

export async function submitReview(
  questionId: string,
  payload: SubmitReviewPayload
): Promise<ActionResult<SpacedReview>> {
  try {
    if (payload.quality < 0 || payload.quality > 5) {
      return {
        success: false,
        message: "Quality রেটিং অবশ্যই ০ থেকে ৫ এর মধ্যে হতে হবে",
      };
    }

    const response = await serverFetch.post(
      `/spaced-reviews/${questionId}/submit`,
      {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (result.success) {
      revalidateTag(DUE_REVIEWS_TAG, REVALIDATE_MAX);
      revalidateTag(MY_SPACED_REVIEWS_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "রিভিউ সাবমিট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "রিভিউ সাবমিট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Submit review error:", error);
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
// Get all of my spaced reviews (not just due ones) — any authenticated
// user; backend does NOT cache this one in Redis, unlike getDueReviews
// ────────────────────────────────────────────────

export async function getMySpacedReviews(): Promise<{
  success: boolean;
  message?: string;
  data: MySpacedReview[];
}> {
  try {
    const response = await serverFetch.get("/spaced-reviews/my", {
      next: { tags: [MY_SPACED_REVIEWS_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "আপনার রিভিউ লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get my spaced reviews error:", error);
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