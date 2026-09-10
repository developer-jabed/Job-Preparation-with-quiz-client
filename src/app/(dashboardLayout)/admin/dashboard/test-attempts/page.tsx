import { getAllTests } from "@/service/test/test.service";
import { getAllTestAttempts } from "@/service/test-attempt/testAttempt.service";
import { StatCard } from "@/components/modules/subjectManagement/StatCard";
import { TestAttemptManager } from "@/components/modules/test-attemptsManagement/TestAttemptManager";


export const dynamic = "force-dynamic";


export const metadata = {
  title: "টেস্ট অ্যাটেম্পট ব্যবস্থাপনা",
};

export default async function TestAttemptsPage() {
  const [{ data: attempts }, { data: tests }] = await Promise.all([
    getAllTestAttempts({ limit: 50, sortBy: "createdAt", sortOrder: "desc" }),
    getAllTests({ limit: 100 }),
  ]);

  const completedCount = attempts.filter((a) => a.status === "COMPLETED").length;
  const inProgressCount = attempts.filter((a) => a.status === "IN_PROGRESS").length;

  const accuracyValues = attempts
    .map((a) => a.accuracy)
    .filter((a): a is number => a != null);

  const avgAccuracy =
    accuracyValues.length > 0
      ? (accuracyValues.reduce((sum, a) => sum + a, 0) / accuracyValues.length).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen ">
      <header className="relative overflow-hidden border-b border-slate-200/80 ">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-medium text-indigo-600">প্রশ্নব্যাংক ব্যবস্থাপনা</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
            টেস্ট অ্যাটেম্পট
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="মোট অ্যাটেম্পট"
              value={attempts.length}
              tone="ink"
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              }
            />
            <StatCard
              label="সম্পন্ন"
              value={completedCount}
              tone="emerald"
              icon={
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="চলমান"
              value={inProgressCount}
              tone="amber"
              icon={
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="গড় সঠিকতা"
              value={`${avgAccuracy}%`}
              tone="violet"
              icon={
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              }
            />
          </div>
        </div>
      </header>

      <TestAttemptManager initialAttempts={attempts} tests={tests} />
    </div>
  );
}