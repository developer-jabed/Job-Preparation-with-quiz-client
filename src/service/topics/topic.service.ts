/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface Topic {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string; subjectId: string };
  _count?: {
    questions: number;
  };
}

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
const TOPICS_LIST_TAG = "topics-list";

// ────────────────────────────────────────────────
// Create — admin only (backend enforces the ADMIN role check)
// ────────────────────────────────────────────────

export async function createTopic(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Topic>> {
  try {
    const payload = {
      categoryId: (formData.get("categoryId") as string)?.trim(),
      name: (formData.get("name") as string)?.trim(),
      slug: (formData.get("slug") as string)?.trim().toLowerCase(),
      order: Number(formData.get("order")) || 0,
    };

    if (!payload.categoryId || !payload.name || !payload.slug) {
      return {
        success: false,
        message: "Category, Name এবং Slug আবশ্যক",
      };
    }

    const response = await serverFetch.post("/topics", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(TOPICS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`category-${payload.categoryId}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "টপিক সফলভাবে তৈরি হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টপিক তৈরি করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create topic error:", error);
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
// Read (list) — public, matches the unauthenticated GET / route
// ────────────────────────────────────────────────

export async function getAllTopics(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  success: boolean;
  message?: string;
  data: Topic[];
  meta?: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.isActive !== undefined)
      query.set("isActive", String(params.isActive));
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();

    const response = await serverFetch.get(`/topics${qs ? `?${qs}` : ""}`, {
      next: { tags: [TOPICS_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "টপিক লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    console.error("Get all topics error:", error);
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
// Read (single) — public, matches the unauthenticated GET /:id route
// ────────────────────────────────────────────────

export async function getSingleTopic(id: string): Promise<{
  success: boolean;
  message?: string;
  data: Topic | null;
}> {
  try {
    const response = await serverFetch.get(`/topics/${id}`, {
      next: { tags: [TOPICS_LIST_TAG, `topic-${id}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "টপিক পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get single topic error:", error);
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
// Update — admin only (backend enforces the ADMIN role check)
// ────────────────────────────────────────────────

export async function updateTopic(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<Topic>> {
  try {
    const payload: Record<string, any> = {};

    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim().toLowerCase();
    const order = formData.get("order");
    const isActive = formData.get("isActive");

    if (name) payload.name = name;
    if (slug) payload.slug = slug;
    if (order !== null && order !== "") payload.order = Number(order);
    if (isActive !== null) payload.isActive = isActive === "true";

    const response = await serverFetch.patch(`/topics/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(TOPICS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`topic-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "টপিক সফলভাবে আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টপিক আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update topic error:", error);
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
// Delete — admin only (backend soft-deactivates if the topic has
// dependent questions, otherwise hard-deletes)
// ────────────────────────────────────────────────

export async function deleteTopic(id: string): Promise<ActionResult<Topic>> {
  try {
    const response = await serverFetch.delete(`/topics/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(TOPICS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`topic-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "টপিক সফলভাবে মুছে ফেলা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টপিক মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Delete topic error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}