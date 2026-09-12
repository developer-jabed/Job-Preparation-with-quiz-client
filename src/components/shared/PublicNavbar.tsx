/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  User,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { getCookie } from "@/service/auth/tokenHandlers";
import { getUserDashboardRoute } from "@/lib/auth-utils";
import LogoutButton from "./LogoutButton";
import { cn } from "@/lib/utils";
import type { UserInfo } from "@/types/userInterface";
import { getUserInfo } from "@/service/auth/getUserInfo";

const NAV_LINKS = [
  { href: "/", label: "হোম" },
  { href: "/subjects", label: "প্র্যাকটিস" },
  { href: "/tests", label: "মডেল টেস্ট" },
  { href: "/leaderboard", label: "লিডারবোর্ড" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [drop, setDrop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const dashboardHref =
    loggedIn && user?.role
      ? getUserDashboardRoute(user.role as any)
      : "/dashboard";

  const links = [
    ...NAV_LINKS,
    ...(loggedIn ? [{ href: dashboardHref, label: "ড্যাশবোর্ড" }] : []),
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href.replace(/\/$/, ""));

  // Auth + user info
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const token = await getCookie("accessToken");

        if (!token) {
          if (!cancelled) {
            setLoggedIn(false);
            setUser(null);
          }
          return;
        }

        if (!cancelled) setLoggedIn(true);

        const userInfo = await getUserInfo();

        if (!cancelled) {
          // getUserInfo returns a fallback object on error (id: "")
          if (userInfo?.id) {
            setUser(userInfo);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
        if (!cancelled) {
          setLoggedIn(false);
          setUser(null);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDrop(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[999] transition-all duration-300",
          scrolled
            ? "bg-[#f8f6f1]/90 shadow-sm backdrop-blur-md border-b border-emerald-900/10"
            : "bg-transparent"
        )}
      >
        {/* Top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-800 via-emerald-600 to-rose-800" />

        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/25 ring-2 ring-emerald-100">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <p className="text-[17px] font-bold tracking-tight text-slate-900">
                Job<span className="text-emerald-700">Prep</span>
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                সরকারি চাকরি প্রস্তুতি প্ল্যাটফর্ম
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {loggedIn && user ? (
              <div className="relative hidden md:block" ref={dropRef}>
                <button
                  onClick={() => setDrop(!drop)}
                  className="flex items-center gap-2.5 rounded-full border border-emerald-900/10 bg-white/60 py-1.5 pl-1.5 pr-3 transition hover:bg-emerald-50"
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate text-[13px] font-medium text-slate-800">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-500 transition-transform",
                      drop && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={cn(
                    "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-all",
                    drop
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-2 opacity-0"
                  )}
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-1.5">
                    <Link
                      href={dashboardHref}
                      onClick={() => setDrop(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      ড্যাশবোর্ড
                    </Link>
                    <Link
                      href="/my-profile"
                      onClick={() => setDrop(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <User className="h-4 w-4" />
                      প্রোফাইল
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 p-1.5">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            ) : loggedIn ? (
              // Logged in but user still loading
              <div className="hidden h-9 w-28 animate-pulse rounded-full bg-slate-200/80 md:block" />
            ) : (
              <Link
                href="/login"
                className="hidden items-center rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-800 hover:-translate-y-0.5 md:inline-flex"
              >
                সাইন ইন
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[72px]" />

      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobile}
      />

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[1001] flex w-[280px] flex-col border-l border-slate-200 bg-[#f8f6f1] shadow-2xl transition-transform duration-300 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-slate-200 px-5">
          <span className="text-base font-bold text-slate-900">JobPrep</span>
          <button
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile user info */}
        {loggedIn && user && (
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className={cn(
                "block rounded-xl px-4 py-3 text-[14.5px] font-medium transition",
                isActive(link.href)
                  ? "bg-emerald-700 text-white"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          {loggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              onClick={closeMobile}
              className="flex w-full items-center justify-center rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white"
            >
              সাইন ইন
            </Link>
          )}
        </div>
      </div>
    </>
  );
}