"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.interface";
import { Menu } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";

import DashboardMobileSidebar from "./DashboardMobileSidebar";
import NotificationDropdown from "./Notification";
import UserDropdown from "./UserDropdown";
import { UserInfo } from "@/types/userInterface";

interface DashboardNavbarContentProps {
  userInfo: UserInfo;
  navItems?: NavSection[];
  dashboardHome?: string;
}

/** Map path → short title for the top bar */
function getPageTitle(pathname: string, dashboardHome: string): string {
  if (pathname === dashboardHome || pathname === `${dashboardHome}/`) {
    return "Dashboard";
  }

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "Dashboard";

  // Humanize slug
  return last
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPageSubtitle(role: string): string {
  if (role === "ADMIN") return "Admin workspace";
  if (role === "LEARNER") return "Learner workspace";
  return "Workspace";
}

const DashboardNavbarContent = ({
  userInfo,
  navItems,
  dashboardHome = "/",
}: DashboardNavbarContentProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sheetOpen = isMobile && isOpen;

  const title = useMemo(
    () => getPageTitle(pathname, dashboardHome),
    [pathname, dashboardHome]
  );

  const subtitle = getPageSubtitle(userInfo.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <Sheet
            open={sheetOpen}
            onOpenChange={(open) => {
              if (isMobile) setIsOpen(open);
              else setIsOpen(false);
            }}
          >
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-slate-600"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <DashboardMobileSidebar
                userInfo={userInfo}
                navItems={navItems || []}
                dashboardHome={dashboardHome}
              />
            </SheetContent>
          </Sheet>

          {/* Context text */}
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </p>
            <p className="hidden sm:block truncate text-[11px] text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <NotificationDropdown />
          <UserDropdown userInfo={userInfo} />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbarContent;