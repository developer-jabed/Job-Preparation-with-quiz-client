/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";


export interface Subject {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    categories: number;
    questions: number;
    tests: number;
  };
}

export interface SubjectCategory {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface SubjectWithCategories extends Subject {
  categories: SubjectCategory[];
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
const SUBJECTS_LIST_TAG = "subjects-list";

// ────────────────────────────────────────────────
// Create — admin only (backend enforces the ADMIN role check)
// ────────────────────────────────────────────────

export async function createSubject(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Subject>> {
  try {
    const payload = {
      name: (formData.get("name") as string)?.trim(),
      slug: (formData.get("slug") as string)?.trim().toLowerCase(),
      order: Number(formData.get("order")) || 0,
    };

    if (!payload.name || !payload.slug) {
      return {
        success: false,
        message: "Name এবং Slug আবশ্যক",
      };
    }

    const response = await serverFetch.post("/subjects", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(SUBJECTS_LIST_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "বিষয় সফলভাবে তৈরি হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "বিষয় তৈরি করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create subject error:", error);
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

export async function getAllSubjects(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  success: boolean;
  message?: string;
  data: Subject[];
  meta?: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params?.isActive !== undefined)
      query.set("isActive", String(params.isActive));
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();

    const response = await serverFetch.get(`/subjects${qs ? `?${qs}` : ""}`, {
      next: { tags: [SUBJECTS_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "বিষয় লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    console.error("Get all subjects error:", error);
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

export async function getSingleSubject(id: string): Promise<{
  success: boolean;
  message?: string;
  data: SubjectWithCategories | null;
}> {
  try {
    const response = await serverFetch.get(`/subjects/${id}`, {
      next: { tags: [SUBJECTS_LIST_TAG, `subject-${id}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "বিষয় পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get single subject error:", error);
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

export async function updateSubject(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<Subject>> {
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

    const response = await serverFetch.patch(`/subjects/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(SUBJECTS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`subject-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "বিষয় সফলভাবে আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "বিষয় আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update subject error:", error);
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
// Delete — admin only (backend soft-deactivates if the subject has
// dependent questions, otherwise hard-deletes)
// ────────────────────────────────────────────────

export async function deleteSubject(id: string): Promise<ActionResult<Subject>> {
  try {
    const response = await serverFetch.delete(`/subjects/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(SUBJECTS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`subject-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "বিষয় সফলভাবে মুছে ফেলা হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "বিষয় মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Delete subject error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}