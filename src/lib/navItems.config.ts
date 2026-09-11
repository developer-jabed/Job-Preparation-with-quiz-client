import { NavSection } from "@/types/dashboard.interface";
import { getDefaultDashboardRoute, UserRole } from "./auth-utils";

// ─────────────────────────────────────────────────────────────────────────────
// Common — visible to all roles
// ─────────────────────────────────────────────────────────────────────────────
export const getCommonNavItems = (role: UserRole): NavSection[] => {
  const defaultDashboard = getDefaultDashboardRoute(role);
  return [
    {
      items: [
        { title: "Home", href: "/", icon: "Home", roles: ["LEARNER", "ADMIN"] },
        { title: "Dashboard", href: defaultDashboard, icon: "LayoutDashboard", roles: ["LEARNER", "ADMIN"] },
        { title: "My Profile", href: "/my-profile", icon: "User", roles: ["LEARNER", "ADMIN"] },
      ],
    },
    {
      title: "Settings",
      items: [
        { title: "Change Password", href: "/change-password", icon: "Settings", roles: ["LEARNER", "ADMIN"] },
      ],
    },
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// Learner
// ─────────────────────────────────────────────────────────────────────────────
export const learnerNavItems: NavSection[] = [

  {
    title: "My Progress",
    items: [
      { title: "My Attempts", href: "/dashboard/learner/attempts", icon: "BarChart", roles: ["LEARNER"] },
      { title: "Bookmarks", href: "/dashboard/learner/bookmarks", icon: "Bookmark", roles: ["LEARNER"] },
      { title: "Spaced Review", href: "/dashboard/learner/review", icon: "RefreshCw", roles: ["LEARNER"] },
      { title: "Streak", href: "/dashboard/learner/streak", icon: "Flame", roles: ["LEARNER"] },
    ],
  },
  {
    title: "Support",
    items: [
      { title: "Report a Question", href: "/dashboard/learner/report", icon: "MessageCircleWarning", roles: ["LEARNER"] },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────────────────────
export const adminNavItems: NavSection[] = [
  {
    title: "Content Management",
    items: [
      { title: "Subjects", href: "/admin/dashboard/subjects", icon: "BookOpen", roles: ["ADMIN"] },
      { title: "Categories", href: "/admin/dashboard/categories", icon: "FolderTree", roles: ["ADMIN"] },
      { title: "Topics", href: "/admin/dashboard/topics", icon: "ListTree", roles: ["ADMIN"] },
      { title: "Questions", href: "/admin/dashboard/questions", icon: "HelpCircle", roles: ["ADMIN"] },
      { title: "Tags", href: "/admin/dashboard/tags", icon: "Tag", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Tests",
    items: [
      { title: "Manage Tests", href: "/admin/dashboard/tests", icon: "ClipboardList", roles: ["ADMIN"] },
      { title: "Test Templates", href: "/admin/dashboard/test-templates", icon: "LayoutTemplate", roles: ["ADMIN"] },
      { title: "Mastery Setup", href: "/admin/dashboard/mastery", icon: "Sparkles", roles: ["ADMIN"] },
      { title: "Test Attempts", href: "/admin/dashboard/test-attempts", icon: "Activity", roles: ["ADMIN"] },
    ],
  },
  {
    title: "AI Ingestion",
    items: [
      { title: "PDF Uploads", href: "/admin/dashboard/pdf-uploads", icon: "FileUp", roles: ["ADMIN"] },
    ],
  },
  {
    title: "User Management",
    items: [
      { title: "Learners", href: "/admin/dashboard/learners", icon: "Users", roles: ["ADMIN"] },
      { title: "Admins", href: "/admin/dashboard/admins", icon: "Shield", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Moderation",
    items: [
      { title: "Question Reports", href: "/admin/dashboard/reports", icon: "Flag", roles: ["ADMIN"] },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role resolver
// ─────────────────────────────────────────────────────────────────────────────
export const getNavItemsByRole = (role: UserRole): NavSection[] => {
  const common = getCommonNavItems(role);
  switch (role) {
    case "ADMIN":
      return [...common, ...adminNavItems];
    case "LEARNER":
      return [...common, ...learnerNavItems];
    default:
      return common;
  }
};