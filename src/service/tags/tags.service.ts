/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    questions: number;
  };
}

// Mirrors ICreateTag — slug is derived server-side, never sent by the client
export interface CreateTagPayload {
  name: string;
}

// Mirrors IUpdateTag
export interface UpdateTagPayload {
  name?: string;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const TAGS_LIST_TAG = "tags-list";

// ────────────────────────────────────────────────
// Create — admin only
// ────────────────────────────────────────────────

export async function createTag(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Tag>> {
  try {
    const name = (formData.get("name") as string)?.trim();

    if (!name) {
      return {
        success: false,
        message: "Name আবশ্যক",
      };
    }

    const response = await serverFetch.post("/tags", {
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(TAGS_LIST_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "ট্যাগ সফলভাবে তৈরি হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ট্যাগ তৈরি করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Create tag error:", error);
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
// Read (list) — public
// ────────────────────────────────────────────────

export async function getAllTags(): Promise<{
  success: boolean;
  message?: string;
  data: Tag[];
}> {
  try {
    const response = await serverFetch.get("/tags", {
      next: { tags: [TAGS_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ট্যাগ লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get all tags error:", error);
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
// Read (single) — public
// ────────────────────────────────────────────────

export async function getTagById(id: string): Promise<{
  success: boolean;
  message?: string;
  data: Tag | null;
}> {
  try {
    const response = await serverFetch.get(`/tags/${id}`, {
      next: { tags: [TAGS_LIST_TAG, `tag-${id}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ট্যাগ পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get tag by id error:", error);
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

export async function updateTag(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<Tag>> {
  try {
    const name = (formData.get("name") as string)?.trim();

    if (!name) {
      return {
        success: false,
        message: "Name আবশ্যক",
      };
    }

    const response = await serverFetch.patch(`/tags/${id}`, {
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(TAGS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`tag-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "ট্যাগ সফলভাবে আপডেট হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ট্যাগ আপডেট করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Update tag error:", error);
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
// Delete — admin only (backend has no dependent-question guard here,
// unlike Subject/Category/Topic — deleting a tag with questions attached
// presumably cascades or fails at the FK level depending on the schema)
// ────────────────────────────────────────────────

export async function deleteTag(id: string): Promise<ActionResult> {
  try {
    const response = await serverFetch.delete(`/tags/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(TAGS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`tag-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "ট্যাগ সফলভাবে মুছে ফেলা হয়েছে!",
      };
    }

    return {
      success: false,
      message: result.message || "ট্যাগ মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Delete tag error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}