/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface Learner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  preferredLanguage: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  streakDays?: number;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LearnerListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface LearnerListResult {
  meta: LearnerListMeta;
  data: Learner[];
}

export interface LearnerFilters {
  searchTerm?: string;
  isActive?: boolean | string;
  isEmailVerified?: boolean | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateLearnerPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateLearnerPayload {
  name?: string;
  phone?: string | null;
  preferredLanguage?: string;
  isActive?: boolean;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const LEARNERS_LIST_TAG = "learners-list";
const learnerTag = (id: string) => `learner-${id}`;

// ────────────────────────────────────────────────
// Create Learner — Admin (multipart: fields + optional avatar)
// ────────────────────────────────────────────────

export async function createLearner(
  formData: FormData
): Promise<ActionResult<Learner>> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string | null;
    const file = formData.get("avatar") || formData.get("file");

    if (!name?.trim()) {
      return { success: false, message: "নাম আবশ্যক" };
    }
    if (!email?.trim()) {
      return { success: false, message: "ইমেইল আবশ্যক" };
    }
    if (!password || password.length < 6) {
      return {
        success: false,
        message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
      };
    }

    const uploadFormData = new FormData();
    uploadFormData.append("name", name.trim());
    uploadFormData.append("email", email.trim().toLowerCase());
    uploadFormData.append("password", password);
    if (phone?.trim()) uploadFormData.append("phone", phone.trim());

    if (file && file instanceof File && file.size > 0) {
      uploadFormData.append("file", file); // or "avatar" — match backend field name
    }

    const response = await serverFetch.post("/learners", {
      body: uploadFormData,
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(LEARNERS_LIST_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "লার্নার সফলভাবে তৈরি হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "লার্নার তৈরি করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create learner error:", error);
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
// Get All Learners — Admin (search, filters, pagination)
// ────────────────────────────────────────────────

export async function getAllLearners(
  filters: LearnerFilters = {}
): Promise<{
  success: boolean;
  message?: string;
  data: Learner[];
  meta: LearnerListMeta;
}> {
  try {
    const params = new URLSearchParams();

    if (filters.searchTerm)
      params.set("searchTerm", filters.searchTerm);
    if (filters.isActive !== undefined && filters.isActive !== "")
      params.set("isActive", String(filters.isActive));
    if (filters.isEmailVerified !== undefined && filters.isEmailVerified !== "")
      params.set("isEmailVerified", String(filters.isEmailVerified));
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

    const qs = params.toString();
    const url = qs ? `/learners?${qs}` : "/learners";

    const response = await serverFetch.get(url, {
      next: { tags: [LEARNERS_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "লার্নার তালিকা লোড করতে ব্যর্থ",
        data: [],
        meta: { page: 1, limit: 10, total: 0 },
      };
    }

    // Backend returns { meta, data } inside result.data OR result itself
    const payload = result.data;
    const list = Array.isArray(payload)
      ? payload
      : payload?.data ?? [];
    const meta = payload?.meta ?? result.meta ?? {
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: list.length,
    };

    return {
      success: true,
      data: list,
      meta,
    };
  } catch (error: any) {
    console.error("Get all learners error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে।",
      data: [],
      meta: { page: 1, limit: 10, total: 0 },
    };
  }
}

// ────────────────────────────────────────────────
// Get Single Learner — Admin or Learner
// ────────────────────────────────────────────────

export async function getLearnerById(id: string): Promise<{
  success: boolean;
  message?: string;
  data: Learner | null;
}> {
  try {
    const response = await serverFetch.get(`/learners/${id}`, {
      next: { tags: [LEARNERS_LIST_TAG, learnerTag(id)] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "লার্নার পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get learner by id error:", error);
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
// Update Learner — Admin or Learner (multipart optional avatar)
// ────────────────────────────────────────────────

export async function updateLearner(
  id: string,
  formData: FormData
): Promise<ActionResult<Learner>> {
  try {
    const uploadFormData = new FormData();

    const name = formData.get("name");
    const phone = formData.get("phone");
    const preferredLanguage = formData.get("preferredLanguage");
    const isActive = formData.get("isActive");
    const file = formData.get("avatar") || formData.get("file");

    if (name !== null && name !== undefined)
      uploadFormData.append("name", String(name).trim());
    if (phone !== null && phone !== undefined)
      uploadFormData.append("phone", String(phone).trim());
    if (preferredLanguage !== null && preferredLanguage !== undefined)
      uploadFormData.append(
        "preferredLanguage",
        String(preferredLanguage).trim()
      );
    if (isActive !== null && isActive !== undefined)
      uploadFormData.append("isActive", String(isActive));

    if (file && file instanceof File && file.size > 0) {
      uploadFormData.append("file", file); // match backend multipart field
    }

    const response = await serverFetch.patch(`/learners/${id}`, {
      body: uploadFormData,
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(LEARNERS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(learnerTag(id), REVALIDATE_MAX);
      return {
        success: true,
        message: "লার্নার সফলভাবে আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "লার্নার আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update learner error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

/**
 * JSON-only update (no file) — useful for toggle isActive, language, etc.
 */
export async function updateLearnerJson(
  id: string,
  payload: UpdateLearnerPayload
): Promise<ActionResult<Learner>> {
  try {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.phone !== undefined)
      formData.append("phone", payload.phone ?? "");
    if (payload.preferredLanguage !== undefined)
      formData.append("preferredLanguage", payload.preferredLanguage);
    if (payload.isActive !== undefined)
      formData.append("isActive", String(payload.isActive));

    return updateLearner(id, formData);
  } catch (error: any) {
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
// Delete Learner — Admin only
// ────────────────────────────────────────────────

export async function deleteLearner(id: string): Promise<ActionResult> {
  try {
    const response = await serverFetch.delete(`/learners/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(LEARNERS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(learnerTag(id), REVALIDATE_MAX);
      return {
        success: true,
        message: "লার্নার সফলভাবে মুছে ফেলা হয়েছে!",
      };
    }

    return {
      success: false,
      message: result.message || "লার্নার মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Delete learner error:", error);
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
// Toggle Active — convenience for admin table
// ────────────────────────────────────────────────

export async function toggleLearnerActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<Learner>> {
  return updateLearnerJson(id, { isActive });
}