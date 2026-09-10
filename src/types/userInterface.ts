export type UserRole = "ADMIN" | "LEARNER";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar: string | null;
  preferredLanguage: string; // "en" | "hi"
  isEmailVerified: boolean;
  isActive: boolean;
  streakDays: number;
  lastActiveAt: string | null; // ISO date string
  createdAt: string; // ISO date string
}