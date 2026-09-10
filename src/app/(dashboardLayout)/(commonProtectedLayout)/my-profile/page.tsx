import { getUserInfo } from "@/service/auth/getUserInfo";
import ProfileClient from "@/components/modules/MyProfile/MyProfile";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const user = await getUserInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Profile
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage your account information
          </p>
        </div>

        <ProfileClient initialUser={user} />
      </div>
    </div>
  );
}