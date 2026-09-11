// app/(learner)/practice/page.tsx
import PracticeClient from "@/components/modules/testUi/practiceClient";
import {
  getMasteryTemplates,
  getMasterySetupStatus,
} from "@/service/mastery/mastery.service";
import { getDueReviews } from "@/service/spaced-reviews/spaced-reviews.service";

import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Practice Tests | Learner",
  description: "Smart mock tests for computer government jobs",
};

export default async function PracticePage() {
  const [templatesRes, statusRes, dueRes] = await Promise.all([
    getMasteryTemplates(true),
    getMasterySetupStatus(),
    getDueReviews(),
  ]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Practice Tests
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            SMART mocks — less repeat, more coverage. Built for computer govt
            jobs.
          </p>
        </div>

        <PracticeClient
          templates={templatesRes.success ? templatesRes.data : []}
          status={statusRes.success ? statusRes.data : null}
          dueReviewCount={dueRes.success ? dueRes.data.length : 0}
          error={
            !templatesRes.success
              ? templatesRes.message
              : !statusRes.success
                ? statusRes.message
                : undefined
          }
        />
      </div>
    </div>
  );
}