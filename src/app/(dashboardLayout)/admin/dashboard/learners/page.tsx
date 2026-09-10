
import { CreateLearnerDialog } from "@/components/modules/LearnerManagement/CreateLearnerDialog";
import { LearnersFilters } from "@/components/modules/LearnerManagement/LearnersFilters";
import { LearnersPagination } from "@/components/modules/LearnerManagement/LearnersPagination";
import { LearnersTable } from "@/components/modules/LearnerManagement/LearnersTable";
import { getAllLearners } from "@/service/learners/learner.service";
import { Users, AlertCircle } from "lucide-react";
import { Suspense } from "react";


export const dynamic = "force-dynamic";


export default async function AdminLearnersPage({
  searchParams,
}: {
  searchParams: Promise<{
    searchTerm?: string;
    isActive?: string;
    isEmailVerified?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const res = await getAllLearners({
    searchTerm: params.searchTerm,
    isActive: params.isActive,
    isEmailVerified: params.isEmailVerified,
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const learners = res.data || [];
  const meta = res.meta || { page, limit, total: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Learners
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage learner accounts, access, and profiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground tabular-nums">
              {meta.total} total
            </span>
            <CreateLearnerDialog />
          </div>
        </div>

        {!res.success && res.message && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{res.message}</p>
          </div>
        )}

        {/* Filters */}
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <LearnersFilters />
        </Suspense>

        {/* Table */}
        <LearnersTable learners={learners} />

        {/* Pagination */}
        <LearnersPagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
        />
      </div>
    </div>
  );
}