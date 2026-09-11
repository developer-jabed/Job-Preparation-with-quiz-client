
import BookmarksClient from "@/components/modules/learnersManagement/bookmarkManagement/BookmarkClient";
import { getMyBookmarks } from "@/service/bookmarks/bookmarks.service";
import { Metadata } from "next";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "My Bookmarks | Learner",
  description: "Your saved questions for later practice",
};

export default async function BookmarksPage() {
  const result = await getMyBookmarks();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            My Bookmarks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Questions you’ve saved for later practice
          </p>
        </div>

        <BookmarksClient
          initialBookmarks={result.success ? result.data : []}
          initialError={!result.success ? result.message : undefined}
        />
      </div>
    </div>
  );
}