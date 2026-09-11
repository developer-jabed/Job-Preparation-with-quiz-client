
import ResultModal from "@/components/modules/attempts-test/attemptResult";
import { getAttemptResult } from "@/service/test-attempt/testAttempt.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "ফলাফল | JobPrep",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TestResultPage({ params }: PageProps) {
  const { id } = await params;

  const res = await getAttemptResult(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <ResultModal attempt={res.data} closeHref="/tests" />;
}