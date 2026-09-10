
import { getAllTests } from "@/service/test/test.service";
import { getAllSubjects } from "@/service/subject/subject.service";
import { getAllCategories } from "@/service/category/category.service";
import { getAllQuestions } from "@/service/question/question.service";
import { StatCard } from "@/components/modules/subjectManagement/StatCard";
import { TestManager } from "@/components/modules/testManagement/TestManager";


export const dynamic = "force-dynamic";


export const metadata = {
  title: "টেস্ট ব্যবস্থাপনা",
};

export default async function TestsPage() {
  const [
    { data: tests },
    { data: subjects },
    { data: categories },
    { data: questions },
  ] = await Promise.all([
    getAllTests({ limit: 50, sortBy: "createdAt", sortOrder: "desc" }),
    getAllSubjects({ limit: 100, sortBy: "order", sortOrder: "asc" }),
    getAllCategories({ limit: 100, sortBy: "order", sortOrder: "asc" }),
    getAllQuestions({ limit: 200, sortBy: "createdAt", sortOrder: "desc" }),
  ]);

  const activeCount = tests.filter((t) => t.isActive).length;
  const freeCount = tests.filter((t) => t.isFree).length;
  const featuredCount = tests.filter((t) => t.isFeatured).length;

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-slate-200/80 ">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-medium text-blue-600">প্রশ্নব্যাংক ব্যবস্থাপনা</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
            টেস্ট সমূহ
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="মোট টেস্ট"
              value={tests.length}
              tone="ink"
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
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
              label="ফ্রি টেস্ট"
              value={freeCount}
              tone="emerald"
              icon={
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="ফিচার্ড"
              value={featuredCount}
              tone="violet"
              icon={
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              }
            />
          </div>
        </div>
      </header>

      <TestManager
        initialTests={tests}
        subjects={subjects}
        categories={categories}
        questions={questions}
      />
    </div>
  );
}