/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export type TemplateEntityType = "SUBJECT" | "CATEGORY" | "TOPIC";

export type SelectionMode =
  | "SMART"
  | "RANDOM"
  | "NEVER_SEEN_ONLY"
  | "WRONG_ONLY";

export interface TaxonomyMapItem {
  id: string;
  key: string;
  label: string;
  labelHi?: string | null;
  entityType: TemplateEntityType;
  entityId?: string | null;
  defaultWeight?: number;
  linked?: boolean;
}

export interface TemplateSection {
  subjectId: string;
  subjectName?: string;
  count: number;
  difficulty?: {
    EASY?: number;
    MEDIUM?: number;
    HARD?: number;
  };
  categoryIds?: string[];
  topicIds?: string[];
  questionTypes?: string[];
}

export interface TestTemplateConfigV2 {
  version: 2;
  selectionMode: SelectionMode;
  policyName?: string;
  sections: TemplateSection[];
  fallback?: {
    allowPartial: boolean;
    minQuestionsRatio: number;
  };
}

export interface TestTemplateItem {
  id: string;
  name: string;
  nameHi?: string | null;
  slug: string;
  description?: string | null;
  status: string;
  testType?: string;
  totalQuestions: number;
  durationMinutes: number;
  examTag?: string | null;
  isFeatured?: boolean;
  isFree?: boolean;
  order?: number;
  config?: TestTemplateConfigV2 | unknown;
}

export interface MasterySetupStatus {
  ready: boolean;
  policy: {
    id: string;
    name: string;
    cooldownDays: number;
    maxShowInWindow?: number;
    windowDays?: number;
  } | null;
  content?: {
    subjects: number;
    questions: number;
    canCreateTemplate: boolean;
  };
  /** legacy — may be absent after service update */
  maps?: {
    total: number;
    linked: number;
    unlinked: number;
    items: TaxonomyMapItem[];
  };
  templates: TestTemplateItem[];
}

export interface CreateTemplatePayload {
  name: string;
  nameHi?: string;
  slug: string;
  description?: string;
  testType?: string;
  durationMinutes: number;
  isFree?: boolean;
  examTag?: string;
  isFeatured?: boolean;
  order?: number;
  status?: string;
  sections: TemplateSection[];
  selectionMode?: SelectionMode;
  policyName?: string;
  allowPartial?: boolean;
  minQuestionsRatio?: number;
}

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;

export interface CreateTaxonomyMapPayload {
  key: string;
  label: string;
  labelHi?: string;
  entityType: TemplateEntityType;
  entityId?: string;
  defaultWeight?: number;
}

export interface LinkTaxonomyMapPayload {
  entityId: string;
  entityType?: TemplateEntityType;
}

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

const REVALIDATE_MAX = "max";
const MASTERY_SETUP_TAG = "mastery-setup";
const MASTERY_MAPS_TAG = "mastery-taxonomy-maps";
const MASTERY_TEMPLATES_TAG = "mastery-templates";

// ────────────────────────────────────────────────
// Setup
// ────────────────────────────────────────────────

export async function ensureMasteryDefaults(): Promise<
  ActionResult<{
    policy: {
      id: string;
      name: string;
      cooldownDays: number;
      maxShowInWindow?: number;
      windowDays?: number;
    };
    message?: string;
  }>
> {
  try {
    const response = await serverFetch.post("/mastery-setup/setup/defaults");
    const result = await response.json();

    if (result.success) {
      revalidateTag(MASTERY_SETUP_TAG, REVALIDATE_MAX);
      revalidateTag(MASTERY_TEMPLATES_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "মাস্টারি ডিফল্ট সেটআপ সম্পন্ন",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "সেটআপ করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("ensureMasteryDefaults error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

export async function getMasterySetupStatus(): Promise<{
  success: boolean;
  message?: string;
  data: MasterySetupStatus | null;
}> {
  try {
    const response = await serverFetch.get("/mastery-setup/setup/status", {
      next: { tags: [MASTERY_SETUP_TAG] },
    });
    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "স্ট্যাটাস লোড করতে ব্যর্থ",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getMasterySetupStatus error:", error);
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
// Taxonomy maps (optional / legacy)
// ────────────────────────────────────────────────

export async function getTaxonomyMaps(): Promise<{
  success: boolean;
  message?: string;
  data: TaxonomyMapItem[];
}> {
  try {
    const response = await serverFetch.get("/mastery-setup/taxonomy-maps", {
      next: { tags: [MASTERY_MAPS_TAG] },
    });
    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "ম্যাপ লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data ?? [] };
  } catch (error: any) {
    console.error("getTaxonomyMaps error:", error);
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

export async function createTaxonomyMap(
  payload: CreateTaxonomyMapPayload
): Promise<ActionResult<TaxonomyMapItem>> {
  try {
    if (!payload.key?.trim() || !payload.label?.trim() || !payload.entityType) {
      return {
        success: false,
        message: "key, label এবং entityType আবশ্যক",
      };
    }

    const response = await serverFetch.post("/mastery-setup/taxonomy-maps", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    if (result.success) {
      revalidateTag(MASTERY_MAPS_TAG, REVALIDATE_MAX);
      revalidateTag(MASTERY_SETUP_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "ম্যাপ তৈরি হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "ম্যাপ তৈরি করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("createTaxonomyMap error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}


// mastery.service.ts (client/server actions file)

export async function generateTestFromTemplate(
  slug: string
): Promise<
  ActionResult<{
    testId: string;
    attemptId: string;
    totalQuestions: number;
    durationMinutes: number;
  }>
> {
  try {
    if (!slug?.trim()) {
      return { success: false, message: "Template slug আবশ্যক" };
    }

    const response = await serverFetch.post(
      `/mastery-setup/templates/${encodeURIComponent(slug)}/generate`,
      {
        body: JSON.stringify({}), // ✅ required when Content-Type is application/json
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        message: result.message || "টেস্ট তৈরি হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টেস্ট তৈরি করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("generateTestFromTemplate error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

export async function linkTaxonomyMap(
  key: string,
  payload: LinkTaxonomyMapPayload
): Promise<ActionResult<TaxonomyMapItem>> {
  try {
    if (!key?.trim() || !payload.entityId?.trim()) {
      return {
        success: false,
        message: "key এবং entityId আবশ্যক",
      };
    }

    const response = await serverFetch.patch(
      `/mastery-setup/taxonomy-maps/${encodeURIComponent(key)}/link`,
      {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await response.json();

    if (result.success) {
      revalidateTag(MASTERY_MAPS_TAG, REVALIDATE_MAX);
      revalidateTag(MASTERY_SETUP_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "ম্যাপ লিংক হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "লিংক করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("linkTaxonomyMap error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

export async function unlinkTaxonomyMap(
  key: string
): Promise<ActionResult<TaxonomyMapItem>> {
  try {
    if (!key?.trim()) {
      return { success: false, message: "key আবশ্যক" };
    }

    const response = await serverFetch.patch(
      `/mastery-setup/taxonomy-maps/${encodeURIComponent(key)}/unlink`
    );
    const result = await response.json();

    if (result.success) {
      revalidateTag(MASTERY_MAPS_TAG, REVALIDATE_MAX);
      revalidateTag(MASTERY_SETUP_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "ম্যাপ আনলিংক হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "আনলিংক করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("unlinkTaxonomyMap error:", error);
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
// Templates (subject-based)
// ────────────────────────────────────────────────

export async function getMasteryTemplates(activeOnly = false): Promise<{
  success: boolean;
  message?: string;
  data: TestTemplateItem[];
}> {
  try {
    const qs = activeOnly ? "?active=true" : "";
    const response = await serverFetch.get(`/mastery-setup/templates${qs}`, {
      next: { tags: [MASTERY_TEMPLATES_TAG] },
    });
    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "টেমপ্লেট লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data ?? [] };
  } catch (error: any) {
    console.error("getMasteryTemplates error:", error);
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

export async function getMasteryTemplateBySlug(slug: string): Promise<{
  success: boolean;
  message?: string;
  data: TestTemplateItem | null;
}> {
  try {
    if (!slug?.trim()) {
      return { success: false, message: "slug আবশ্যক", data: null };
    }

    const response = await serverFetch.get(
      `/mastery-setup/templates/by-slug/${encodeURIComponent(slug)}`,
      { next: { tags: [MASTERY_TEMPLATES_TAG] } }
    );
    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "টেমপ্লেট পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getMasteryTemplateBySlug error:", error);
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

export async function getMasteryTemplateById(id: string): Promise<{
  success: boolean;
  message?: string;
  data: TestTemplateItem | null;
}> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "id আবশ্যক", data: null };
    }

    const response = await serverFetch.get(
      `/mastery-setup/templates/${encodeURIComponent(id)}`,
      { next: { tags: [MASTERY_TEMPLATES_TAG] } }
    );
    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "টেমপ্লেট পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getMasteryTemplateById error:", error);
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

export async function createMasteryTemplate(
  payload: CreateTemplatePayload
): Promise<ActionResult<TestTemplateItem>> {
  try {
    if (!payload.name?.trim()) {
      return { success: false, message: "name আবশ্যক" };
    }
    if (!payload.slug?.trim()) {
      return { success: false, message: "slug আবশ্যক" };
    }
    if (!payload.durationMinutes || payload.durationMinutes < 1) {
      return { success: false, message: "durationMinutes আবশ্যক" };
    }
    if (!payload.sections?.length) {
      return {
        success: false,
        message: "অন্তত একটি subject section আবশ্যক",
      };
    }
    for (const s of payload.sections) {
      if (!s.subjectId?.trim() || !s.count || s.count < 1) {
        return {
          success: false,
          message: "প্রতিটি section এ subjectId এবং count লাগবে",
        };
      }
    }

    const response = await serverFetch.post("/mastery-setup/templates", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    if (result.success) {
      revalidateTag(MASTERY_TEMPLATES_TAG, REVALIDATE_MAX);
      revalidateTag(MASTERY_SETUP_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "টেমপ্লেট তৈরি হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টেমপ্লেট তৈরি করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("createMasteryTemplate error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

export async function updateMasteryTemplate(
  id: string,
  payload: UpdateTemplatePayload
): Promise<ActionResult<TestTemplateItem>> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "id আবশ্যক" };
    }

    const response = await serverFetch.patch(
      `/mastery-setup/templates/${encodeURIComponent(id)}`,
      {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await response.json();

    if (result.success) {
      revalidateTag(MASTERY_TEMPLATES_TAG, REVALIDATE_MAX);
      revalidateTag(MASTERY_SETUP_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "টেমপ্লেট আপডেট হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "টেমপ্লেট আপডেট করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("updateMasteryTemplate error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

export async function archiveMasteryTemplate(
  id: string
): Promise<ActionResult<TestTemplateItem>> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "id আবশ্যক" };
    }

    const response = await serverFetch.delete(
      `/mastery-setup/templates/${encodeURIComponent(id)}`
    );
    const result = await response.json();

    if (result.success) {
      revalidateTag(MASTERY_TEMPLATES_TAG, REVALIDATE_MAX);
      revalidateTag(MASTERY_SETUP_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "টেমপ্লেট আর্কাইভ হয়েছে",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "আর্কাইভ করতে ব্যর্থ",
    };
  } catch (error: any) {
    console.error("archiveMasteryTemplate error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}