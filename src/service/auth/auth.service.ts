"use server";

import { verifyAccessToken } from "@/lib/jwtHanlders";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";
import { deleteCookie, getCookie, setCookie } from "./tokenHandlers";
import { changePasswordSchema, resetPasswordSchema } from "@/zod/auth.validation";

// Keep in sync with backend auth.constant.ts (ACCESS_TOKEN_EXPIRES_IN / REFRESH_TOKEN_EXPIRES_IN)
const ACCESS_TOKEN_MAX_AGE = 365 * 24 * 60 * 60;       // 1 year, in seconds
const REFRESH_TOKEN_MAX_AGE = 2 * 365 * 24 * 60 * 60;  // 2 years, in seconds

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function updateMyProfile(formData: FormData) {
    try {
        const uploadFormData = new FormData();

        const data: any = {};
        formData.forEach((value, key) => {
            if (key !== 'file' && value) {
                data[key] = value;
            }
        });

        uploadFormData.append('data', JSON.stringify(data));

        const file = formData.get('file');
        if (file && file instanceof File && file.size > 0) {
            uploadFormData.append('file', file);
        }

        const response = await serverFetch.patch(`/user/update-my-profile`, {
            body: uploadFormData,
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("user-info", { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

// Reset Password
export async function resetPassword(_prevState: any, formData: FormData) {
    const isEmailReset = formData.get("isEmailReset") === "true";
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;

    const validationPayload = {
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const validatedPayload = zodValidator(
        validationPayload,
        resetPasswordSchema
    );

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {
        if (token) {
            jwt.verify(token, process.env.RESET_PASS_TOKEN as string);
        }

        let response;

        if (isEmailReset) {
            if (!email || !token) {
                return {
                    success: false,
                    message: "Invalid reset link",
                };
            }

            response = await serverFetch.post("/auth/reset-password", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: email,
                    password: validationPayload.newPassword,
                }),
            });
        } else {
            response = await serverFetch.post("/auth/reset-password", {
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: validationPayload.newPassword,
                }),
            });
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Password reset failed");
        }

        if (result.success) {
            revalidateTag("user-info", { expire: 0 });
        }

        return {
            success: true,
            message: "Password reset successfully! Redirecting to login...",
            redirectToLogin: true,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}

export async function getNewAccessToken() {
    try {
        const accessToken = await getCookie("accessToken");
        const refreshToken = await getCookie("refreshToken");

        if (!accessToken && !refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        if (accessToken) {
            const verifiedToken = await verifyAccessToken(accessToken);

            if (verifiedToken.success) {
                return {
                    tokenRefreshed: false,
                }
            }
        }

        if (!refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;

        const response = await serverFetch.post("/auth/refresh-token", {
            headers: {
                Cookie: `refreshToken=${refreshToken}`,
            },
        });

        const result = await response.json();

        const setCookieHeaders = response.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie: string) => {
                const parsedCookie = parse(cookie);

                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie;
                }
                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie;
                }
            })
        } else {
            throw new Error("No Set-Cookie header found");
        }

        if (!accessTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        // Backend's /refresh-token only rotates the access token, so a new
        // refreshToken cookie won't normally be present — that's expected,
        // not an error. Only re-set it if the backend actually sent one.
        await deleteCookie("accessToken");
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || ACCESS_TOKEN_MAX_AGE,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        if (refreshTokenObject) {
            await deleteCookie("refreshToken");
            await setCookie("refreshToken", refreshTokenObject.refreshToken, {
                secure: true,
                httpOnly: true,
                maxAge: parseInt(refreshTokenObject['Max-Age']) || REFRESH_TOKEN_MAX_AGE,
                path: refreshTokenObject.Path || "/",
                sameSite: refreshTokenObject['SameSite'] || "none",
            });
        }

        if (!result.success) {
            throw new Error(result.message || "Token refresh failed");
        }

        return {
            tokenRefreshed: true,
            success: true,
            message: "Token refreshed successfully"
        };

    } catch (error: any) {
        return {
            tokenRefreshed: false,
            success: false,
            message: error?.message || "Something went wrong",
        };
    }
}

export async function changePassword(_prevState: any, formData: FormData) {
    const validationPayload = {
        oldPassword: formData.get("oldPassword") as string,
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const validatedPayload = zodValidator(
        validationPayload,
        changePasswordSchema
    );

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {
        const response = await serverFetch.post("/auth/change-password", {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                oldPassword: validationPayload.oldPassword,
                newPassword: validationPayload.newPassword,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Password change failed");
        }

        return {
            success: true,
            message: result.message || "Password changed successfully!",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}