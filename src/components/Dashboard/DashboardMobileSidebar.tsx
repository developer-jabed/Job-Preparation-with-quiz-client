"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SheetTitle } from "@/components/ui/sheet";
import { getIconComponent } from "@/lib/icon-mapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/userInterface";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
  appName?: string;
}

const DashboardMobileSidebar = ({
  userInfo,
  navItems,
  dashboardHome,
  appName = "JobPrep",
}: Props) => {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== dashboardHome && pathname.startsWith(`${href}/`)) return true;
    return false;
  };

  const initials = userInfo.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-5 dark:border-slate-800">
        <Link
          href={dashboardHome}
          className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        >
          {appName}
        </Link>
      </div>

      <SheetTitle className="sr-only">Navigation</SheetTitle>

      {/* Scrollable Navigation */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-3 py-4">
          <nav className="space-y-5">
            {navItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {section.title && (
                  <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isItemActive(item.href);
                    const Icon = getIconComponent(item.icon);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                            active
                              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:text-slate-50 dark:ring-slate-700"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-slate-700" : "text-slate-400"
                            )}
                          />
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge != null && item.badge !== "" && (
                            <Badge
                              variant="secondary"
                              className="h-5 border-0 bg-slate-200/80 px-1.5 text-[10px] text-slate-700"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {sectionIdx < navItems.length - 1 && (
                  <Separator className="mt-4 bg-slate-200/80" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Footer - User Profile */}
      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
        <Link
          href="/my-profile"
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
            {userInfo.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userInfo.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-slate-900">
              {userInfo.name}
            </p>
            <p className="truncate text-[11px] capitalize text-slate-500">
              {userInfo.role.toLowerCase()}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardMobileSidebar;