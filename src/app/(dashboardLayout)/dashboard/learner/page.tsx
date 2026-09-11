
import LearnerDashboardClient from "@/components/modules/learnersManagement/learnerDashboard/LearnerDashboardClient";
import { getLearnerCharts, getLearnerDashboard } from "@/service/dashboard/dashboard.service";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Dashboard | Learner",
  description: "Your learning progress and overview",
};

export default async function LearnerDashboardPage() {
  const [dashboardRes, chartsRes] = await Promise.all([
    getLearnerDashboard(),
    getLearnerCharts(14),
  ]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LearnerDashboardClient
          data={dashboardRes.success ? dashboardRes.data : null}
          charts={chartsRes.success ? chartsRes.data : null}
          error={!dashboardRes.success ? dashboardRes.message : undefined}
        />
      </div>
    </div>
  );
}