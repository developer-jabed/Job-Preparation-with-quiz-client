
import MyReportsClient from "@/components/modules/learnersManagement/reportmanagement/MyReportsClient";
import { getMyReports } from "@/service/questionReport/questionReport.service";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "My Reports | Learner",
};

export default async function MyReportsPage() {
  const result = await getMyReports();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            My Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Questions you have reported
          </p>
        </div>

        <MyReportsClient
          initialReports={result.success ? result.data : []}
          initialError={!result.success ? result.message : undefined}
        />
      </div>
    </div>
  );
}