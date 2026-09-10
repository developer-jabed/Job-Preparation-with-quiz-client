"use server"

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

export const setCookie = async (key: string, value: string, options: Partial<ResponseCookie>) => {
    const cookieStore = await cookies();
    cookieStore.set(key, value, options);
}

export const getCookie = async (key: string) => {
    const cookieStore = await cookies();
    return cookieStore.get(key)?.value || null;
}

// Backend's logout/refresh flow sets accessToken and refreshToken with
// path: '/' (see ACCESS_TOKEN_COOKIE_OPTIONS / REFRESH_TOKEN_COOKIE_OPTIONS
// in auth.controller.ts). Next's cookieStore.delete() only removes a cookie
// if the path matches the one it was set with — omitting it here relied on
// the '/' default lining up, which is fragile. Accept an explicit path (and
// any other delete options) so this can never silently mismatch.
export const deleteCookie = async (key: string, options?: { path?: string; domain?: string }) => {
    const cookieStore = await cookies();
    cookieStore.delete({ name: key, path: options?.path || "/", ...options });
}