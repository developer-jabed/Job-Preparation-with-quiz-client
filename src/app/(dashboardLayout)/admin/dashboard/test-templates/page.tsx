/* eslint-disable @typescript-eslint/no-explicit-any */

import TestTemplatesAdminClient from "@/components/modules/test-templates/TestTemplatesAdminClient";
import { getMasteryTemplates } from "@/service/mastery/mastery.service";
import { getAllSubjects } from "@/service/subject/subject.service";
import { Metadata } from "next";
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Test Templates | Admin",
};

export default async function TestTemplatesPage() {
  const [templatesRes, subjectsRes] = await Promise.all([
    getMasteryTemplates(false),
    getAllSubjects({
    limit: 100,
    sortBy: "order",
    sortOrder: "asc",
  }), // { success, data: { id, name, slug }[] }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Test Templates
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create reusable mocks — pick subjects & question counts. Learners get a
          new test each time they start.
        </p>
      </div>

      <TestTemplatesAdminClient
        initialTemplates={templatesRes.success ? templatesRes.data : []}
        subjects={
          subjectsRes.success
            ? (subjectsRes.data ?? []).map((s: any) => ({
                id: s.id,
                name: s.name,
              }))
            : []
        }
        error={!templatesRes.success ? templatesRes.message : undefined}
      />
    </div>
  );
}