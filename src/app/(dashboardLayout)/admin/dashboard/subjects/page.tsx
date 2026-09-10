import { StatCard } from "@/components/modules/subjectManagement/StatCard";
import { SubjectManager } from "@/components/modules/subjectManagement/SubjectManager";
import { getAllSubjects } from "@/service/subject/subject.service";

export const dynamic = "force-dynamic";


export const metadata = {
  title: "বিষয় ব্যবস্থাপনা",
};

export default async function SubjectsPage() {
  const { data: subjects } = await getAllSubjects({
    limit: 100,
    sortBy: "order",
    sortOrder: "asc",
  });

  const activeCount = subjects.filter((s) => s.isActive).length;
  const totalQuestions = subjects.reduce(
    (sum, s) => sum + (s._count?.questions ?? 0),
    0
  );
  const totalCategories = subjects.reduce(
    (sum, s) => sum + (s._count?.categories ?? 0),
    0
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm font-medium text-indigo-600">
            প্রশ্নব্যাংক ব্যবস্থাপনা
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
            বিষয় সমূহ
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="মোট বিষয়"
              value={subjects.length}
              tone="ink"
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            />
            <StatCard
              label="সক্রিয়"
              value={activeCount}
              tone="amber"
              icon={
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="ক্যাটাগরি"
              value={totalCategories}
              tone="violet"
              icon={
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              }
            />
            <StatCard
              label="প্রশ্ন"
              value={totalQuestions}
              tone="emerald"
              icon={
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              }
            />
          </div>
        </div>
      </header>

      <SubjectManager initialSubjects={subjects} />
    </div>
  );
}