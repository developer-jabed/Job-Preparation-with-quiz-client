
import SpacedReviewClient from "@/components/modules/learnersManagement/reviewManagement/SpacedReviewClient";
import { getDueReviews } from "@/service/spaced-reviews/spaced-reviews.service";

import { Metadata } from "next";
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Spaced Review | Learner",
  description: "Review due questions using spaced repetition",
};

export default async function SpacedReviewPage() {
  const result = await getDueReviews();

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Spaced Review
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Strengthen long-term memory with smart scheduling
          </p>
        </div>

        <SpacedReviewClient
          initialReviews={result.success ? result.data : []}
          initialError={!result.success ? result.message : undefined}
        />
      </div>
    </div>
  );
}