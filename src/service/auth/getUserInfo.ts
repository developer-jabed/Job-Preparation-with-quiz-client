/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { UserInfo } from "@/types/userInterface";

export const getUserInfo = async (): Promise<UserInfo> => {
    try {
        const response = await serverFetch.get("/auth/me", {
            cache: "force-cache",
            next: { tags: ["user-info"] }
        });

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.message || "Failed to fetch user info");
        }

        // Backend's /auth/me (getMe) returns a flat User record — no
        // nested admin/student/teacher shape — so just pass it through.
        const userInfo: UserInfo = {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone ?? null,
            role: result.data.role,
            avatar: result.data.avatar ?? null,
            preferredLanguage: result.data.preferredLanguage ?? "en",
            isEmailVerified: result.data.isEmailVerified,
            isActive: result.data.isActive,
            streakDays: result.data.streakDays,
            lastActiveAt: result.data.lastActiveAt ?? null,
            createdAt: result.data.createdAt,
        };

        return userInfo;
    } catch (error: any) {
        console.log(error);
        return {
            id: "",
            name: "Unknown User",
            email: "",
            phone: null,
            role: "LEARNER",
            avatar: null,
            preferredLanguage: "en",
            isEmailVerified: false,
            isActive: false,
            streakDays: 0,
            lastActiveAt: null,
            createdAt: "",
        };
    }
};