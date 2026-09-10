/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, User, Menu, X, ShieldCheck } from "lucide-react";
import { getCookie } from "@/service/auth/tokenHandlers";
import { getUserDashboardRoute } from "@/lib/auth-utils";
import LogoutButton from "./LogoutButton";

const NAV_LINKS = [
  { href: "/", label: "হোম" },
  { href: "/subjects", label: "প্র্যাকটিস" },
  { href: "/tests", label: "মডেল টেস্ট" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [drop, setDrop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const user = { name: "John Doe", email: "john@jobprep.com" };
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const dashboardHref = loggedIn && userRole
    ? getUserDashboardRoute(userRole as any)
    : "/dashboard";

  const links = [
    ...NAV_LINKS,
    ...(loggedIn ? [{ href: dashboardHref, label: "ড্যাশবোর্ড" }] : [])
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href.replace(/\/$/, ""));

  useEffect(() => {
    getCookie("accessToken").then(async (token) => {
      if (!token) {
        setLoggedIn(false);
        setUserRole(null);
        return;
      }

      setLoggedIn(true);

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role || null);
      } catch (err) {
        console.error("Failed to decode token for role:", err);
        setUserRole(null);
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        :root {
          --gov-green: #0b6e3c;
          --gov-green-deep: #084d2a;
          --gov-green-soft: #e6f3ea;
          --gov-maroon: #7a1d2b;
          --gov-ink: #14201a;
          --gov-mid: #52685c;
          --gov-rule: rgba(11, 110, 60, 0.16);
          --gov-bg: #f6f8f5;
        }

        .dark {
          --gov-green: #2fa968;
          --gov-green-deep: #1c7a48;
          --gov-green-soft: rgba(47, 169, 104, 0.14);
          --gov-maroon: #d96b7a;
          --gov-ink: #eaf1ec;
          --gov-mid: #9db3a6;
          --gov-rule: rgba(47, 169, 104, 0.22);
          --gov-bg: #0e1611;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          font-family: 'Hind Siliguri', 'Inter', system-ui, sans-serif;
          transition: all 0.3s ease;
        }

        .nav-strip {
          height: 4px;
          background: linear-gradient(90deg, var(--gov-green-deep), var(--gov-green) 55%, var(--gov-maroon));
        }

        .nav.scrolled {
          background: color-mix(in oklab, var(--gov-bg) 94%, transparent);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--gov-rule), 0 6px 24px rgba(8, 77, 42, 0.10);
        }

        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          height: 68px;
          padding: 0 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--gov-ink);
        }

        .nav-crest {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 25%, var(--gov-green), var(--gov-green-deep));
          border: 2px solid var(--gov-green-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 2px 8px rgba(8, 77, 42, 0.28);
        }

        .nav-name {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.1;
          color: var(--gov-ink);
        }

        .nav-name span {
          color: var(--gov-green);
        }

        .nav-sub {
          font-size: 11px;
          font-weight: 500;
          color: var(--gov-mid);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          padding: 9px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--gov-mid);
          text-decoration: none;
          border-radius: 999px;
          transition: all 0.18s ease;
        }

        .nav-link:hover {
          color: var(--gov-green-deep);
          background: var(--gov-green-soft);
        }

        .nav-link.active {
          color: #fff;
          background: var(--gov-green);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nav-signin {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: var(--gov-green);
          padding: 10px 22px;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 3px 10px rgba(11, 110, 60, 0.30);
          transition: all 0.2s;
        }

        .nav-signin:hover {
          background: var(--gov-green-deep);
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(11, 110, 60, 0.38);
        }

        .nav-user {
          position: relative;
        }

        .nav-user-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 6px;
          border: 1px solid var(--gov-rule);
          border-radius: 999px;
          background: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .nav-user-btn:hover {
          background: var(--gov-green-soft);
        }

        .nav-avatar {
          width: 32px;
          height: 32px;
          background: var(--gov-green);
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-username {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--gov-ink);
        }

        .nav-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 10px;
          width: 230px;
          background: var(--gov-bg);
          border: 1px solid var(--gov-rule);
          box-shadow: 0 12px 40px rgba(8, 77, 42, 0.16);
          border-radius: 12px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
          transition: all 0.18s ease;
        }

        .nav-dropdown.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .nav-dropdown-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--gov-rule);
        }

        .nav-dropdown-name {
          font-weight: 600;
          color: var(--gov-ink);
        }

        .nav-dropdown-email {
          font-size: 12px;
          color: var(--gov-mid);
        }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          color: var(--gov-mid);
          text-decoration: none;
          font-size: 14px;
          transition: all 0.15s;
        }

        .nav-dropdown-item:hover {
          background: var(--gov-green-soft);
          color: var(--gov-green-deep);
        }

        .nav-mobile-btn {
          display: none;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--gov-rule);
          border-radius: 8px;
          color: var(--gov-ink);
          background: none;
          cursor: pointer;
        }

        /* Mobile Drawer */
        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(8, 20, 14, 0.55);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .overlay.open {
          display: block;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background: var(--gov-bg);
          border-left: 1px solid var(--gov-rule);
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
          box-shadow: -10px 0 30px rgba(8, 20, 14, 0.18);
        }

        .drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 68px;
          border-bottom: 1px solid var(--gov-rule);
        }

        .drawer-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--gov-ink);
        }

        .drawer-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--gov-rule);
          border-radius: 8px;
          background: none;
          color: var(--gov-mid);
          cursor: pointer;
        }

        .drawer-nav {
          flex: 1;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .drawer-link {
          padding: 13px 16px;
          font-size: 14.5px;
          font-weight: 500;
          color: var(--gov-mid);
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .drawer-link:hover,
        .drawer-link.active {
          color: #fff;
          background: var(--gov-green);
        }

        .drawer-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--gov-rule);
        }

        @media (max-width: 768px) {
          .nav-links,
          .nav-signin,
          .nav-user-btn {
            display: none;
          }
          .nav-mobile-btn {
            display: flex;
          }
          .nav-inner {
            padding: 0 1.25rem;
          }
        }
      `}</style>

      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-strip" />

        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-crest">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="nav-name">Job<span>Prep</span></div>
              <div className="nav-sub">সরকারি চাকরি প্রস্তুতি প্ল্যাটফর্ম</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="nav-right">
            {loggedIn ? (
              <div className="nav-user" ref={dropRef}>
                <button className="nav-user-btn" onClick={() => setDrop(!drop)}>
                  <div className="nav-avatar">{initials}</div>
                  <span className="nav-username">{user.name}</span>
                  <ChevronDown size={15} className={drop ? "rotate-180" : ""} />
                </button>

                {/* Dropdown */}
                <div className={`nav-dropdown ${drop ? "open" : ""}`}>
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-name">{user.name}</div>
                    <div className="nav-dropdown-email">{user.email}</div>
                  </div>

                  <Link
                    href={dashboardHref}
                    className="nav-dropdown-item"
                    onClick={() => setDrop(false)}
                  >
                    <LayoutDashboard size={16} /> ড্যাশবোর্ড
                  </Link>

                  <Link
                    href="/profile"
                    className="nav-dropdown-item"
                    onClick={() => setDrop(false)}
                  >
                    <User size={16} /> প্রোফাইল
                  </Link>

                  <div style={{ height: "1px", background: "var(--gov-rule)", margin: "4px 8px" }} />

                  <LogoutButton />
                </div>
              </div>
            ) : (
              <Link href="/login" className="nav-signin">
                সাইন ইন
              </Link>
            )}

            <button className="nav-mobile-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`overlay ${mobileOpen ? "open" : ""}`} onClick={closeMobile} />

      <div className={`drawer ${mobileOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title">JobPrep</div>
          <button className="drawer-close" onClick={closeMobile}>
            <X size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`drawer-link ${isActive(link.href) ? "active" : ""}`}
              onClick={closeMobile}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="drawer-footer">
          {loggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="nav-signin"
              onClick={closeMobile}
              style={{ display: "block", textAlign: "center", width: "100%" }}
            >
              সাইন ইন
            </Link>
          )}
        </div>
      </div>
    </>
  );
}