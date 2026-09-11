/* eslint-disable @typescript-eslint/no-explicit-any */
import MasteryAdminClient from "@/components/modules/mastery/MasteryAdminClient";
import {
  getMasterySetupStatus,
  getMasteryTemplates,
} from "@/service/mastery/mastery.service"; // adjust path if needed
import { getAllSubjects } from "@/service/subject/subject.service";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Mastery Management | Admin",
};

export default async function MasteryManagementPage() {
  const [statusRes, templatesRes, subjectsRes] = await Promise.all([
    getMasterySetupStatus(),
    getMasteryTemplates(false),
    getAllSubjects(),
  ]);

  const status = statusRes.success ? statusRes.data : null;
  const templates = templatesRes.success ? templatesRes.data : [];
  const subjects =
    subjectsRes.success
      ? (subjectsRes.data ?? []).map((s: any) => ({
          id: s.id,
          name: s.name,
        }))
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Mastery Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of generation policy, content readiness, and subject-based
          test templates. Learners receive a fresh adaptive test every time.
        </p>
      </div>

      <MasteryAdminClient
        initialStatus={status}
        initialTemplates={templates}
        subjects={subjects}
        error={
          !statusRes.success
            ? statusRes.message
            : !templatesRes.success
              ? templatesRes.message
              : undefined
        }
      />
    </div>
  );
}