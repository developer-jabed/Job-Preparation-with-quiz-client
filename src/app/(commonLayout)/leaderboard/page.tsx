// app/(commonLayout)/leaderboard/page.tsx
import { Metadata } from "next";
import { getLeaderboard } from "@/service/analytics/analytics.service";
import LeaderboardClient from "@/components/modules/analytics/LeaderboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard | JobPrep",
  description: "Top performers on JobPrep — practice smarter, climb higher.",
};

export default async function LeaderboardPage() {
  const result = await getLeaderboard(50);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Leaderboard
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Top performers based on recent mock & practice scores. Updated every
          few minutes.
        </p>
      </div>

      <LeaderboardClient
        entries={result.success ? result.data : []}
        error={!result.success ? result.message : undefined}
      />
    </div>
  );
}