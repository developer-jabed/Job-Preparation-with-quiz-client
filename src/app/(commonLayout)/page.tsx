import Link from "next/link";
import {
  BookOpen,
  Brain,
  FileCheck2,
  Repeat,
  Bookmark,
  Flame,
  Search,
  PenLine,
  ClipboardCheck,
  TrendingUp,
  Layers,
  Target,
  Clock,
  ListChecks,
  CalendarDays,
  BarChart3,
  Quote,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// ✅ Cache the page for 30 minutes (ISR)
export const revalidate = 1800;

// Force static rendering for better caching
export const dynamic = "force-static";


export default function HomePage() {
  return (
    <main className="bg-[#f6f8f5] dark:bg-[#0e1611] text-[#14201a] dark:text-[#eaf1ec]">

      {/* 1. HERO */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,110,60,0.10),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0b6e3c]/25 bg-[#e6f3ea] dark:bg-[#2fa968]/15 px-4 py-1.5 text-xs font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
            <ShieldCheck size={14} /> বাংলাদেশের সরকারি চাকরি প্রস্তুতি প্ল্যাটফর্ম
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
            স্বপ্নের সরকারি চাকরি এখন
            <span className="text-[#0b6e3c] dark:text-[#2fa968]"> আরও কাছে</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-[#52685c] dark:text-[#9db3a6]">
            বিসিএস, ব্যাংক, প্রাইমারি, নন-ক্যাডার সহ সকল সরকারি নিয়োগ পরীক্ষার জন্য
            যাচাইকৃত প্রশ্নব্যাংক, রিয়েল এক্সাম প্যাটার্নের মডেল টেস্ট এবং স্মার্ট
            রিভিশন সিস্টেমে প্র্যাকটিস করুন — একদম বিনামূল্যে শুরু করা যায়।
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b6e3c] px-7 py-3 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(11,110,60,0.30)] transition hover:bg-[#084d2a]"
            >
              ফ্রি প্র্যাকটিস শুরু করুন <ArrowRight size={16} />
            </Link>
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 rounded-lg border border-[#0b6e3c]/25 px-7 py-3 text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968] transition hover:bg-[#e6f3ea] dark:hover:bg-[#2fa968]/10"
            >
              মডেল টেস্ট দেখুন
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="border-y border-[#0b6e3c]/10 bg-white/60 dark:bg-white/[0.03] px-6 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: "১২,০০০+", label: "প্রশ্নব্যাংক" },
            { value: "৫০,০০০+", label: "সক্রিয় শিক্ষার্থী" },
            { value: "৩০০+", label: "মডেল টেস্ট" },
            { value: "২৫+", label: "বিষয়" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#0b6e3c] dark:text-[#2fa968]">
                {s.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#52685c] dark:text-[#9db3a6]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
              কীভাবে কাজ করে
            </p>
            <h2 className="mt-2 text-3xl font-bold">মাত্র ৪টি ধাপে প্রস্তুতি শুরু করুন</h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, step: "০১", title: "বিষয় বেছে নিন", desc: "বাংলা, গণিত, ইংরেজি, সাধারণ জ্ঞানসহ ২৫+ বিষয় থেকে পছন্দমতো টপিক নির্বাচন করুন।" },
              { icon: PenLine, step: "০২", title: "প্র্যাকটিস করুন", desc: "টপিক ধরে ধরে প্রশ্ন সমাধান করুন, প্রতিটি প্রশ্নের বিস্তারিত ব্যাখ্যা সাথে সাথে পাবেন।" },
              { icon: ClipboardCheck, step: "০৩", title: "মডেল টেস্ট দিন", desc: "রিয়েল পরীক্ষার নিয়মে সময় বেঁধে সম্পূর্ণ মডেল টেস্ট বা সাবজেক্ট-ভিত্তিক টেস্ট দিন।" },
              { icon: TrendingUp, step: "০৪", title: "অগ্রগতি ট্র্যাক করুন", desc: "নির্ভুলতা, পার্সেন্টাইল ও দুর্বল টপিক দেখে পরবর্তী প্রস্তুতির পরিকল্পনা করুন।" },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-[#0b6e3c]/12 bg-white dark:bg-white/[0.03] p-6">
                <span className="text-xs font-bold text-[#0b6e3c]/40 dark:text-[#2fa968]/40">
                  {s.step}
                </span>
                <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f3ea] dark:bg-[#2fa968]/15 text-[#0b6e3c] dark:text-[#2fa968]">
                  <s.icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-[#52685c] dark:text-[#9db3a6]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="bg-white/60 dark:bg-white/[0.03] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
              কেন আমাদের বেছে নেবেন
            </p>
            <h2 className="mt-2 text-3xl font-bold">যা আমাদের আলাদা করে</h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileCheck2, title: "যাচাইকৃত প্রশ্নব্যাংক", desc: "প্রতিটি প্রশ্ন বিশেষজ্ঞ প্যানেলের পর্যালোচনার পরই প্রকাশিত হয়, তাই ভুল তথ্যের সুযোগ নেই।" },
              { icon: Brain, title: "স্মার্ট রিভিশন", desc: "স্পেসড রিপিটিশন পদ্ধতিতে ভুলে যাওয়ার আগেই সঠিক সময়ে প্রশ্ন আবার আপনার সামনে আসবে।" },
              { icon: Target, title: "রিয়েল এক্সাম প্যাটার্ন", desc: "প্রকৃত পরীক্ষার নিয়মে নেগেটিভ মার্কিং ও সময়সীমা সহ মডেল টেস্ট অনুশীলন করুন।" },
              { icon: Layers, title: "আগের বছরের প্রশ্ন", desc: "বিভিন্ন সালের প্রকৃত নিয়োগ পরীক্ষার প্রশ্ন আলাদাভাবে চিহ্নিত করে সাজানো আছে।" },
              { icon: Bookmark, title: "বুকমার্ক ও রিভিউ", desc: "কঠিন প্রশ্নগুলো বুকমার্ক করে রাখুন, পরে এক জায়গা থেকেই আবার অনুশীলন করুন।" },
              { icon: Flame, title: "স্ট্রিক ট্র্যাকিং", desc: "প্রতিদিনের অনুশীলনের ধারাবাহিকতা দেখে নিজেকে নিয়মিত প্রস্তুতিতে অনুপ্রাণিত রাখুন।" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-[#0b6e3c]/12 bg-[#f6f8f5] dark:bg-transparent p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b6e3c] text-white">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[#52685c] dark:text-[#9db3a6]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SUBJECTS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
              বিষয়সমূহ
            </p>
            <h2 className="mt-2 text-3xl font-bold">যেসব বিষয়ে প্র্যাকটিস করতে পারবেন</h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[
              "বাংলা", "ইংরেজি", "গণিত", "সাধারণ জ্ঞান",
              "বাংলাদেশ বিষয়াবলি", "আন্তর্জাতিক বিষয়াবলি", "কম্পিউটার ও আইসিটি", "বিজ্ঞান",
              "মানসিক দক্ষতা", "ভূগোল ও পরিবেশ", "বিধি ও আইন", "কারেন্ট অ্যাফেয়ার্স",
            ].map((subject) => (
              <div
                key={subject}
                className="flex items-center gap-3 rounded-xl border border-[#0b6e3c]/12 bg-white dark:bg-white/[0.03] px-4 py-4 text-sm font-medium transition hover:border-[#0b6e3c]/40 hover:bg-[#e6f3ea] dark:hover:bg-[#2fa968]/10"
              >
                <BookOpen size={16} className="shrink-0 text-[#0b6e3c] dark:text-[#2fa968]" />
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TEST TYPES */}
      <section className="bg-white/60 dark:bg-white/[0.03] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
              টেস্ট ফরম্যাট
            </p>
            <h2 className="mt-2 text-3xl font-bold">আপনার প্রয়োজন অনুযায়ী পরীক্ষা দিন</h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: PenLine, title: "প্র্যাকটিস মোড", desc: "সময়ের চাপ ছাড়াই টপিক ধরে ধরে প্রশ্ন সমাধান করে ধারণা স্বচ্ছ করুন।" },
              { icon: ListChecks, title: "সেকশনভিত্তিক টেস্ট", desc: "একটি নির্দিষ্ট বিষয় বা টপিকে গভীরভাবে প্র্যাকটিস করতে চাইলে বেছে নিন।" },
              { icon: ClipboardCheck, title: "ফুল মডেল টেস্ট", desc: "প্রকৃত পরীক্ষার মতো সম্পূর্ণ সিলেবাস কভার করে একটানা পরীক্ষা দিন।" },
              { icon: CalendarDays, title: "আগের বছরের প্রশ্ন", desc: "নির্দিষ্ট সাল ও পরীক্ষার নাম অনুযায়ী পুরনো প্রশ্নপত্র সমাধান করুন।" },
              { icon: Flame, title: "ডেইলি কুইজ", desc: "প্রতিদিন ছোট একটি কুইজ দিয়ে ধারাবাহিকতা বজায় রাখুন ও স্ট্রিক গড়ুন।" },
              { icon: Layers, title: "কাস্টম টেস্ট", desc: "নিজের পছন্দমতো বিষয়, কঠিনতা ও প্রশ্নসংখ্যা বেছে টেস্ট তৈরি করুন।" },
            ].map((t) => (
              <div key={t.title} className="flex items-start gap-4 rounded-2xl border border-[#0b6e3c]/12 bg-[#f6f8f5] dark:bg-transparent p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e6f3ea] dark:bg-[#2fa968]/15 text-[#0b6e3c] dark:text-[#2fa968]">
                  <t.icon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-[#52685c] dark:text-[#9db3a6]">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PROGRESS TRACKING PREVIEW */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
              অগ্রগতি বিশ্লেষণ
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-snug">
              নিজের প্রস্তুতির অবস্থান সবসময় নিজের চোখে দেখুন
            </h2>
            <p className="mt-4 text-sm text-[#52685c] dark:text-[#9db3a6]">
              প্রতিটি টেস্টের পর নির্ভুলতা, প্রাপ্ত নম্বর, সময় ব্যবস্থাপনা এবং
              অন্যান্য পরীক্ষার্থীদের তুলনায় নিজের পার্সেন্টাইল দেখতে পাবেন —
              কোন বিষয়ে আরও সময় দেওয়া দরকার তা সহজেই বুঝে যাবেন।
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["নির্ভুলতা ও প্রাপ্ত নম্বরের বিস্তারিত হিসাব", "টপিক অনুযায়ী দুর্বলতা চিহ্নিতকরণ", "প্রতিটি টেস্টে নিজের পার্সেন্টাইল অবস্থান"].map((li) => (
                <li key={li} className="flex items-center gap-2">
                  <Check size={16} className="text-[#0b6e3c] dark:text-[#2fa968]" /> {li}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#0b6e3c]/12 bg-white dark:bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">সর্বশেষ টেস্ট ফলাফল</p>
              <BarChart3 size={18} className="text-[#0b6e3c] dark:text-[#2fa968]" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "নির্ভুলতা", value: "৮২%" },
                { label: "প্রাপ্ত নম্বর", value: "৭৮/১০০" },
                { label: "পার্সেন্টাইল", value: "৯১তম" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-[#f6f8f5] dark:bg-white/[0.04] p-3 text-center">
                  <p className="text-lg font-bold text-[#0b6e3c] dark:text-[#2fa968]">{m.value}</p>
                  <p className="mt-1 text-[11px] text-[#52685c] dark:text-[#9db3a6]">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-end gap-2 h-24">
              {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-[#0b6e3c]/80 dark:bg-[#2fa968]/80" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#52685c] dark:text-[#9db3a6]">
              <Clock size={13} /> গত ৭ দিনের অনুশীলনের ধারাবাহিকতা
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="bg-white/60 dark:bg-white/[0.03] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
              শিক্ষার্থীদের মতামত
            </p>
            <h2 className="mt-2 text-3xl font-bold">যারা এখান থেকে প্রস্তুতি নিয়েছেন</h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { name: "রাফিউল ইসলাম", role: "প্রাথমিক শিক্ষক নিয়োগ প্রার্থী", quote: "আগের বছরের প্রশ্নগুলো আলাদা করে সাজানো থাকায় প্যাটার্ন বুঝতে অনেক সুবিধা হয়েছে।" },
              { name: "সুমাইয়া আক্তার", role: "ব্যাংক নিয়োগ প্রার্থী", quote: "স্মার্ট রিভিশনের কারণে যেসব প্রশ্নে ভুল করতাম সেগুলো বারবার চোখের সামনে এসেছে, ভুলগুলো কমে গেছে।" },
              { name: "তানভীর হাসান", role: "নন-ক্যাডার প্রার্থী", quote: "মডেল টেস্টের নেগেটিভ মার্কিং একদম আসল পরীক্ষার মতো, তাই পরীক্ষার দিন নার্ভাস লাগেনি।" },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-[#0b6e3c]/12 bg-[#f6f8f5] dark:bg-transparent p-6">
                <Quote size={20} className="text-[#0b6e3c]/40 dark:text-[#2fa968]/40" />
                <p className="mt-3 text-sm text-[#14201a] dark:text-[#eaf1ec]">{t.quote}</p>
                <div className="mt-5">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[#52685c] dark:text-[#9db3a6]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PRICING */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968]">
              প্ল্যান
            </p>
            <h2 className="mt-2 text-3xl font-bold">নিজের প্রয়োজন অনুযায়ী প্ল্যান বেছে নিন</h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#0b6e3c]/12 bg-white dark:bg-white/[0.03] p-7">
              <h3 className="font-semibold">ফ্রি</h3>
              <p className="mt-1 text-2xl font-bold">৳০</p>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  ["সীমিত প্র্যাকটিস প্রশ্ন", true],
                  ["ডেইলি কুইজ", true],
                  ["বেসিক অগ্রগতি ট্র্যাকিং", true],
                  ["ফুল মডেল টেস্ট", false],
                  ["স্মার্ট রিভিশন", false],
                ].map(([label, ok]) => (
                  <li key={label as string} className="flex items-center gap-2">
                    {ok ? <Check size={15} className="text-[#0b6e3c] dark:text-[#2fa968]" /> : <X size={15} className="text-[#52685c]/50" />}
                    <span className={ok ? "" : "text-[#52685c] dark:text-[#9db3a6]"}>{label}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-7 block rounded-lg border border-[#0b6e3c]/25 py-2.5 text-center text-sm font-semibold text-[#0b6e3c] dark:text-[#2fa968] transition hover:bg-[#e6f3ea] dark:hover:bg-[#2fa968]/10">
                ফ্রি শুরু করুন
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-[#0b6e3c] bg-white dark:bg-white/[0.03] p-7">
              <span className="absolute -top-3 left-7 rounded-full bg-[#0b6e3c] px-3 py-1 text-[11px] font-semibold text-white">
                জনপ্রিয়
              </span>
              <h3 className="font-semibold">প্রিমিয়াম</h3>
              <p className="mt-1 text-2xl font-bold">৳১৯৯<span className="text-sm font-normal text-[#52685c] dark:text-[#9db3a6]"> /মাস</span></p>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "সম্পূর্ণ প্রশ্নব্যাংকে সীমাহীন প্র্যাকটিস",
                  "সব ধরনের মডেল টেস্ট",
                  "স্মার্ট রিভিশন ও বিস্তারিত বিশ্লেষণ",
                  "আগের বছরের সব প্রশ্ন",
                  "অগ্রাধিকার সাপোর্ট",
                ].map((label) => (
                  <li key={label} className="flex items-center gap-2">
                    <Check size={15} className="text-[#0b6e3c] dark:text-[#2fa968]" /> {label}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-7 block rounded-lg bg-[#0b6e3c] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#084d2a]">
                প্রিমিয়াম নিন
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[#084d2a] to-[#0b6e3c] px-8 py-16 text-center text-white">
          <ShieldCheck size={30} className="mx-auto text-white/80" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold">
            আজই প্রস্তুতি শুরু করুন, স্বপ্নের চাকরি অপেক্ষা করছে
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            হাজারো প্রার্থীর সাথে একসাথে প্র্যাকটিস করুন এবং নিয়মিত অনুশীলনের মাধ্যমে
            নিজের প্রস্তুতিকে আরও শক্তিশালী করুন।
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-[#0b6e3c] transition hover:bg-white/90"
          >
            ফ্রি অ্যাকাউন্ট খুলুন <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}