import { StatCard } from "@/components/modules/subjectManagement/StatCard";
import { TagManager } from "@/components/modules/tagsManagement/TagManager";
import { getAllTags } from "@/service/tags/tags.service";


export const dynamic = "force-dynamic";


export const metadata = {
  title: "ট্যাগ ব্যবস্থাপনা",
};

export default async function TagsPage() {
  const { data: tags } = await getAllTags();

  const totalQuestions = tags.reduce(
    (sum, t) => sum + (t._count?.questions ?? 0),
    0
  );

  return (
    <div className="min-h-screen ">
      <header className="relative overflow-hidden border-b border-slate-200/80 ">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm font-medium text-fuchsia-600">প্রশ্নব্যাংক ব্যবস্থাপনা</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
            ট্যাগ সমূহ
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label="মোট ট্যাগ"
              value={tags.length}
              tone="ink"
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              }
            />
            <StatCard
              label="মোট প্রশ্ন"
              value={totalQuestions}
              tone="violet"
              icon={
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              }
            />
            <StatCard
              label="ব্যবহৃত ট্যাগ"
              value={tags.filter((t) => (t._count?.questions ?? 0) > 0).length}
              tone="emerald"
              icon={
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </header>

      <TagManager initialTags={tags} />
    </div>
  );
}