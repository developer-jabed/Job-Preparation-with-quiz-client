"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Shield } from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "হোম" },
  { href: "/practice", label: "প্র্যাকটিস" },
  { href: "/model-test", label: "মডেল টেস্ট" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/dashboard", label: "ড্যাশবোর্ড" },
];

const RESOURCES = [
  { href: "/practice", label: "প্র্যাকটিস প্রশ্ন" },
  { href: "/model-test", label: "মডেল টেস্ট" },
  { href: "/leaderboard", label: "লিডারবোর্ড" },
  { href: "/my-profile", label: "প্রোফাইল" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
];

const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-100">
      {/* Top accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-600 via-emerald-600/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Shield className="h-4.5 w-4.5" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-white">
                  JobPrep
                </p>
                <p className="text-[11px] text-slate-400">
                  সরকারি চাকরি প্রস্তুতি প্ল্যাটফর্ম
                </p>
              </div>
            </Link>

            <p className="max-w-xs text-[13.5px] leading-relaxed text-slate-400">
              হাজারো প্রার্থীর সাথে একসাথে প্র্যাকটিস করুন এবং নিয়মিত অনুশীলনের
              মাধ্যমে নিজের প্রস্তুতিকে আরও শক্তিশালী করুন।
            </p>

            <div className="space-y-2.5 text-[13px] text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>support@jobprep.com</span>
              </div>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-emerald-500">
              নেভিগেট
            </h3>
            <ul className="space-y-1">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-[13.5px] text-slate-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-emerald-500">
              রিসোর্স
            </h3>
            <ul className="space-y-1">
              {RESOURCES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-[13.5px] text-slate-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="text-[12.5px] text-slate-500">
            © {year} <span className="font-medium text-slate-400">JobPrep</span>.
            All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {LEGAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[12px] text-slate-500 transition-colors hover:text-slate-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;