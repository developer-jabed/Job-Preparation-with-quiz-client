import { getAllQuestions } from "@/service/question/question.service";
import { getAllSubjects } from "@/service/subject/subject.service";
import { getAllCategories } from "@/service/category/category.service";
import { getAllTopics } from "@/service/topics/topic.service";
import { StatCard } from "@/components/modules/subjectManagement/StatCard";
import { QuestionManager } from "@/components/modules/questionManagement/QuestionManager";
import { getAllTags } from "@/service/tags/tags.service";


export const dynamic = "force-dynamic";


export const metadata = {
  title: "প্রশ্ন ব্যবস্থাপনা",
};

export default async function QuestionsPage() {
  const [
    { data: questions },
    { data: subjects },
    { data: categories },
    { data: topics },
    { data: tags },
  ] = await Promise.all([
    getAllQuestions({ limit: 50, sortBy: "createdAt", sortOrder: "desc" }),
    getAllSubjects({ limit: 100, sortBy: "order", sortOrder: "asc" }),
    getAllCategories({ limit: 100, sortBy: "order", sortOrder: "asc" }),
    getAllTopics({ limit: 100, sortBy: "order", sortOrder: "asc" }),
    getAllTags(),
  ]);

  const activeCount = questions.filter((q) => q.isActive).length;
  const previousYearCount = questions.filter((q) => q.isPreviousYear).length;

  return (
    <div className="min-h-screen ">
      <header className="relative overflow-hidden border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-medium text-rose-600">প্রশ্নব্যাংক ব্যবস্থাপনা</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
            প্রশ্ন সমূহ
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="মোট প্রশ্ন"
              value={questions.length}
              tone="ink"
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
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
              label="পূর্ববর্তী বছর"
              value={previousYearCount}
              tone="violet"
              icon={
                <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="বিষয়"
              value={subjects.length}
              tone="emerald"
              icon={
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            />
          </div>
        </div>
      </header>

      <QuestionManager
        initialQuestions={questions}
        subjects={subjects}
        categories={categories}
        topics={topics}
        tags={tags}
      />
    </div>
  );
}