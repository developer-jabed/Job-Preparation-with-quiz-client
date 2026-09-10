/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string | null;
  score: number;
}

export interface WeakTopic {
  topicId: string;
  name: string;
  wrong: number;
  subject: string;
  category: string;
}

export interface MyPerformance {
  totalAttempts: number;
  averageAccuracy: number;
  averageScore: number;
  totalCorrect: number;
  totalWrong: number;
}

// This module is read-only from the frontend's perspective — there is no
// route exposing updateLeaderboard; it's only called internally by
// TestAttemptService.submitAttempt on the backend. No action for it here.

const LEADERBOARD_TAG = "leaderboard";
const WEAK_TOPICS_TAG = "weak-topics";
const MY_PERFORMANCE_TAG = "my-performance";

// ────────────────────────────────────────────────
// Leaderboard — public, no auth required
// Backed by a Redis sorted set with a 10-minute TTL server-side, so this
// won't reflect a just-submitted attempt instantly even with cache busted
// client-side — that's expected, not a bug to chase.
// ────────────────────────────────────────────────

export async function getLeaderboard(limit = 20): Promise<{
  success: boolean;
  message?: string;
  data: LeaderboardEntry[];
}> {
  try {
    const response = await serverFetch.get(`/analytics/leaderboard?limit=${limit}`, {
      next: { tags: [LEADERBOARD_TAG], revalidate: 60 },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "লিডারবোর্ড লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get leaderboard error:", error);
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
// Weak topics — authenticated user, own data only
// ────────────────────────────────────────────────

export async function getWeakTopics(): Promise<{
  success: boolean;
  message?: string;
  data: WeakTopic[];
}> {
  try {
    const response = await serverFetch.get("/analytics/weak-topics", {
      next: { tags: [WEAK_TOPICS_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "দুর্বল বিষয় লোড করতে ব্যর্থ",
        data: [],
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get weak topics error:", error);
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
// My performance summary — authenticated user, own data only
// ────────────────────────────────────────────────

export async function getMyPerformance(): Promise<{
  success: boolean;
  message?: string;
  data: MyPerformance | null;
}> {
  try {
    const response = await serverFetch.get("/analytics/my-performance", {
      next: { tags: [MY_PERFORMANCE_TAG] },
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || "পারফরম্যান্স লোড করতে ব্যর্থ",
        data: null,
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get my performance error:", error);
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