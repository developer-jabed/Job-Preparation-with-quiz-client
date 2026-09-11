import { MyAttemptsClient } from "@/components/modules/learnersManagement/attemptsManagement/my-attempts-client";
import { getMyAttempts } from "@/service/test-attempt/testAttempt.service";
export const dynamic = "force-dynamic";



export default async function MyAttemptsPage() {
  const result = await getMyAttempts();

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <MyAttemptsClient
          initialAttempts={result.data ?? []}
          initialError={result.success ? null : result.message ?? "Failed to load attempts"}
        />
      </div>
    </div>
  );
}