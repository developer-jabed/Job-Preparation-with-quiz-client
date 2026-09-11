
import AnalyticsClient from "@/components/modules/learnersManagement/streakManagement/AnalyticsClient";
import { getLeaderboard, getMyPerformance, getWeakTopics } from "@/service/analytics/analytics.service";

import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Analytics | Learner",
  description: "Your performance, weak topics and leaderboard",
};

export default async function AnalyticsPage() {
  const [performanceRes, weakTopicsRes, leaderboardRes] = await Promise.all([
    getMyPerformance(),
    getWeakTopics(),
    getLeaderboard(20),
  ]);

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your progress, identify weak areas, and compete on the leaderboard
          </p>
        </div>

        <AnalyticsClient
          performance={performanceRes.success ? performanceRes.data : null}
          weakTopics={weakTopicsRes.success ? weakTopicsRes.data : []}
          leaderboard={leaderboardRes.success ? leaderboardRes.data : []}
          errors={{
            performance: !performanceRes.success ? performanceRes.message : undefined,
            weakTopics: !weakTopicsRes.success ? weakTopicsRes.message : undefined,
            leaderboard: !leaderboardRes.success ? leaderboardRes.message : undefined,
          }}
        />
      </div>
    </div>
  );
}