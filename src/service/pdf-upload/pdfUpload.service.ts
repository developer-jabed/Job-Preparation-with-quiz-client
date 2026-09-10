/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export type PdfStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "EXTRACTED"
  | "FAILED";

export type ReviewStatus = "PENDING" | "NEEDS_EDIT" | "APPROVED" | "REJECTED";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface PdfUpload {
  id: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  status: PdfStatus;
  subjectId: string;
  examName: string | null;
  year: number | null;
  pageCount: number | null;
  errorMessage: string | null;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string };
  uploadedBy?: { id: string; name: string };
  _count?: { extractedQuestions: number };
}

export interface ExtractedQuestionOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface ExtractedQuestion {
  id: string;
  pdfUploadId: string;
  rawText: string;
  questionText: string;
  options: ExtractedQuestionOption[];
  explanation: string | null;
  difficulty: Difficulty;
  questionType: string;
  confidenceScore: number;
  status: ReviewStatus;
  reviewNote: string | null;
  correctAnswers: string[];
  createdAt: string;
}

export interface PdfUploadDetail extends PdfUpload {
  subject: { id: string; name: string };
  uploadedBy: { id: string; name: string; email: string };
  extractedQuestions: ExtractedQuestion[];
}

export interface ExtractionResult {
  success: boolean;
  message: string;
  totalExtracted: number;
  totalChunks: number;
}

// Mirrors ICreatePdfUpload
export interface UploadPdfPayload {
  subjectId: string;
  examName?: string;
  year?: number;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: FieldError[];
  data?: T;
}

const REVALIDATE_MAX = "max";
const PDF_UPLOADS_LIST_TAG = "pdf-uploads-list";

// ────────────────────────────────────────────────
// Upload a PDF — any authenticated user (admin or learner)
// Takes FormData since it's a real file upload — the file itself plus
// the JSON metadata get combined the same way updateMyProfile does it
// for its avatar upload.
// ────────────────────────────────────────────────

export async function uploadPdf(formData: FormData): Promise<ActionResult<PdfUpload>> {
  try {
    const file = formData.get("file");
    if (!file || !(file instanceof File) || file.size === 0) {
      return {
        success: false,
        message: "PDF ফাইল আবশ্যক",
      };
    }

    if (file.type !== "application/pdf") {
      return {
        success: false,
        message: "শুধুমাত্র PDF ফাইল আপলোড করা যাবে",
      };
    }

    const subjectId = formData.get("subjectId") as string;
    if (!subjectId) {
      return {
        success: false,
        message: "Subject আবশ্যক",
      };
    }

    // Re-pack into the multipart shape the Fastify @fastify/multipart route
    // expects: the file field, plus everything else as-is.
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("subjectId", subjectId);

    const examName = formData.get("examName");
    if (examName) uploadFormData.append("examName", examName as string);

    const year = formData.get("year");
    if (year) uploadFormData.append("year", year as string);

    const response = await serverFetch.post("/pdf-uploads/upload", {
      body: uploadFormData,
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag(PDF_UPLOADS_LIST_TAG, REVALIDATE_MAX);
      return {
        success: true,
        message: "PDF সফলভাবে আপলোড হয়েছে!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "PDF আপলোড করতে ব্যর্থ হয়েছে",
      errors: result.errors || [],
    };
  } catch (error: any) {
    console.error("Upload PDF error:", error);
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
// Start AI extraction on an uploaded PDF — owner only (backend checks
// pdfRecord.uploadedById === userId, no admin override here despite other
// routes in this file allowing admin access to all records)
// ────────────────────────────────────────────────

export async function startAIExtraction(
  pdfId: string
): Promise<ActionResult<ExtractionResult>> {
  try {
    const response = await serverFetch.post(`/pdf-uploads/${pdfId}/extract-ai`, {});

    const result = await response.json();

    if (result.success) {
      revalidateTag(PDF_UPLOADS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`pdf-upload-${pdfId}`, REVALIDATE_MAX);
      return {
        success: true,
        message: result.message || "AI এক্সট্র্যাকশন সম্পন্ন হয়েছে!",
        data: result,
      };
    }

    return {
      success: false,
      message: result.message || "AI এক্সট্র্যাকশন ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Start AI extraction error:", error);
    // Extraction can genuinely take a while (chunked, sequential batches
    // of 3) — a timeout here doesn't necessarily mean it failed server-side.
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "এক্সট্র্যাকশন প্রক্রিয়ায় সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ────────────────────────────────────────────────
// Get all uploads — own uploads for a learner, all uploads for an admin
// (the isAdmin distinction is resolved server-side from the auth token,
// not passed from the client)
// ────────────────────────────────────────────────

export async function getAllPdfUploads(): Promise<{
  success: boolean;
  message?: string;
  data: PdfUpload[];
}> {
  try {
    const response = await serverFetch.get("/pdf-uploads", {
      next: { tags: [PDF_UPLOADS_LIST_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "PDF তালিকা লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get all PDF uploads error:", error);
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
// Get single PDF with its extracted questions — owner or admin
// ────────────────────────────────────────────────

export async function getPdfById(id: string): Promise<{
  success: boolean;
  message?: string;
  data: PdfUploadDetail | null;
}> {
  try {
    const response = await serverFetch.get(`/pdf-uploads/${id}`, {
      next: { tags: [PDF_UPLOADS_LIST_TAG, `pdf-upload-${id}`] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "PDF পাওয়া যায়নি",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get PDF by id error:", error);
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
// Delete a PDF — owner or admin
// ────────────────────────────────────────────────

export async function deletePdf(id: string): Promise<ActionResult> {
  try {
    const response = await serverFetch.delete(`/pdf-uploads/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag(PDF_UPLOADS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag(`pdf-upload-${id}`, REVALIDATE_MAX);
      return {
        success: true,
        message: "PDF সফলভাবে মুছে ফেলা হয়েছে!",
      };
    }

    return {
      success: false,
      message: result.message || "PDF মুছতে ব্যর্থ হয়েছে",
    };
  } catch (error: any) {
    console.error("Delete PDF error:", error);
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
// Update Extracted Question Status
// ────────────────────────────────────────────────
export async function updateExtractedQuestionStatus(
  questionId: string,
  status: "APPROVED" | "REJECTED" | "NEEDS_EDIT" | "PENDING",
  reviewNote?: string
): Promise<ActionResult<ExtractedQuestion>> {
  try {
    const response = await serverFetch.patch(
      `/extracted-questions/${questionId}`,
      {
        body: JSON.stringify({ status, reviewNote }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (result.success) {
      revalidateTag(PDF_UPLOADS_LIST_TAG, REVALIDATE_MAX);
      if (result.data?.pdfUploadId) {
        revalidateTag(`pdf-upload-${result.data.pdfUploadId}`, REVALIDATE_MAX);
      }
      revalidateTag("extracted-questions-list", REVALIDATE_MAX);

      const messages: Record<string, string> = {
        APPROVED: "Question approved!",
        REJECTED: "Question rejected",
        NEEDS_EDIT: "Marked as Needs Edit",
        PENDING: "Reset to Pending",
      };

      return {
        success: true,
        message: messages[status] || "Status updated",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update status",
    };
  } catch (error: any) {
    console.error("updateExtractedQuestionStatus error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    };
  }
}

// ────────────────────────────────────────────────
// Approve + Create real Question
// ────────────────────────────────────────────────
export async function approveAndCreateQuestion(
  questionId: string,
  payload?: {
    subjectId?: string;
    categoryId?: string | null;
    topicId?: string | null;
    tagIds?: string[];
  }
): Promise<ActionResult> {
  try {
    const response = await serverFetch.post(
      `/extracted-questions/${questionId}/approve`,
      {
        body: JSON.stringify(payload || {}),
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (result.success) {
      revalidateTag(PDF_UPLOADS_LIST_TAG, REVALIDATE_MAX);
      revalidateTag("questions-list", REVALIDATE_MAX);
      revalidateTag("extracted-questions-list", REVALIDATE_MAX);

      // If backend returns extracted.pdfUploadId, revalidate that PDF too
      const pdfUploadId =
        result.data?.extracted?.pdfUploadId ||
        result.data?.question?.pdfUploadId;
      if (pdfUploadId) {
        revalidateTag(`pdf-upload-${pdfUploadId}`, REVALIDATE_MAX);
      }

      return {
        success: true,
        message:
          result.message || "Question approved and added to Question Bank!",
      };
    }

    return {
      success: false,
      message: result.message || "Approval failed",
    };
  } catch (error: any) {
    console.error("approveAndCreateQuestion error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    };
  }
}