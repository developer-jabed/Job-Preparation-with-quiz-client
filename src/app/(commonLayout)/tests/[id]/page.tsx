// app/(learner)/tests/[id]/page.tsx
import AttemptClient from "@/components/modules/attempts-test/AttemptClient";
import { getAttemptById } from "@/service/test-attempt/testAttempt.service";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Attempt | Practice",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TestAttemptPage({ params }: PageProps) {
  const { id } = await params;

  const res = await getAttemptById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const attempt = res.data;

  // Finished attempts go straight to the result page
  if (attempt.status === "COMPLETED" || attempt.status === "TIMED_OUT") {
    redirect(`/tests/${id}/result`);
  }

  return <AttemptClient attempt={attempt} />;
}