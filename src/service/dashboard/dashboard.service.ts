/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

export async function getAdminDashboard() {
  try {
    const response = await serverFetch.get("/dashboard/admin", {
      next: { tags: ["admin-dashboard"], revalidate: 60 },
    });
    const result = await response.json();
    if (!result.success) {
      return { success: false, message: result.message, data: null };
    }
    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to load dashboard",
      data: null,
    };
  }
}

export async function getLearnerDashboard() {
  try {
    const response = await serverFetch.get("/dashboard/learner", {
      next: { tags: ["learner-dashboard"], revalidate: 30 },
    });
    const result = await response.json();
    if (!result.success) {
      return { success: false, message: result.message, data: null };
    }
    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to load dashboard",
      data: null,
    };
  }
}

export async function getAdminCharts(days = 14) {
  try {
    const response = await serverFetch.get(
      `/dashboard/admin/charts?days=${days}`,
      { next: { tags: ["admin-dashboard-charts"], revalidate: 120 } }
    );
    const result = await response.json();
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message, data: null };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}

export async function getLearnerCharts(days = 14) {
  try {
    const response = await serverFetch.get(
      `/dashboard/learner/charts?days=${days}`,
      { next: { tags: ["learner-dashboard-charts"], revalidate: 60 } }
    );
    const result = await response.json();
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message, data: null };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}