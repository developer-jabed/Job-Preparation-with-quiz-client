/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface Category {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string; slug: string };
  _count?: {
    topics: number;
    questions: number;
  };
}

export interface CategoryTopic {
  id: string;
  categoryId: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface CategoryWithTopics extends Category {
  topics: CategoryTopic[];
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
const CATEGORIES_LIST_TAG = "categories-list";

// ────────────────────────────────────────────────
// Create — admin only (backend enforces the ADMIN role check)
// ────────────────────────────────────────────────

export async function createCategory(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Category>> {
  try {
    const payload = {
      subjectId: (formData.get("subjectId") as string)?.trim(),
      name: (formData.get("name") as string)?.trim(),
      slug: (formData.get("slug") as string)?.trim().toLowerCase(),
      order: Number(formData.get("order")) || 0,
    };

    if (!payload.subjectId || !payload.name || !payload.slug) {
      return {
        success: false,
        message: "Subject, Name এবং Slug আবশ্যক",
      };
    }

    const response = await serverFetch.post("/categories", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(CATEGORIES_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`subject-${payload.subjectId}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "ক্যাটাগরি সফলভাবে তৈরি হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ক্যাটাগরি তৈরি করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create category error:", error);
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

export async function getAllCategories(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  subjectId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  success: boolean;
  message?: string;
  data: Category[];
  meta?: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params?.subjectId) query.set("subjectId", params.subjectId);
    if (params?.isActive !== undefined)
      query.set("isActive", String(params.isActive));
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();

    const response = await serverFetch.get(`/categories${qs ? `?${qs}` : ""}`, {
      next: { tags: [CATEGORIES_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ক্যাটাগরি লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    console.error("Get all categories error:", error);
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

export async function getSingleCategory(id: string): Promise<{
  success: boolean;
  message?: string;
  data: CategoryWithTopics | null;
}> {
  try {
    const response = await serverFetch.get(`/categories/${id}`, {
      next: { tags: [CATEGORIES_LIST_TAG, `category-${id}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ক্যাটাগরি পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get single category error:", error);
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

export async function updateCategory(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<Category>> {
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

    const response = await serverFetch.patch(`/categories/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(CATEGORIES_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`category-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "ক্যাটাগরি সফলভাবে আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ক্যাটাগরি আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update category error:", error);
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
// Delete — admin only (backend soft-deactivates if the category has
// dependent questions, otherwise hard-deletes)
// ────────────────────────────────────────────────

export async function deleteCategory(id: string): Promise<ActionResult<Category>> {
  try {
    const response = await serverFetch.delete(`/categories/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(CATEGORIES_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`category-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ক্যাটাগরি মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Delete category error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}