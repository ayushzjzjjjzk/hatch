import { getSession } from "@/lib/auth";
import { getPublishedStartups, getAllCategories } from "@/lib/services/startups";
import { getUserLikedStartupIds, getUserSavedStartupIds } from "@/lib/services/interactions";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { Header } from "@/components/navigation/Header";
import { MobileNav } from "@/components/navigation/MobileNav";
import { StartupFeed } from "@/components/startup/StartupFeed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  const [{ startups }, categories, likedIds, savedIds] = await Promise.all([
    // NOTE: the swipe feed loads its first 20 published startups up front rather
    // than paging - true infinite-scroll pagination for the vertical feed
    // (loading the next batch as the user nears the end) is a natural next
    // step once you have more than ~20 published startups. /explore already
    // paginates properly since it's grid-based, not swipe-based.
    getPublishedStartups({ limit: 20 }),
    getAllCategories(),
    session ? getUserLikedStartupIds(session.sub) : Promise.resolve([] as string[]),
    session ? getUserSavedStartupIds(session.sub) : Promise.resolve([] as string[])
  ]);

  return (
    <div className="flex">
      <DesktopSidebar categories={categories} />
      <Header />
      <StartupFeed startups={startups} isAuthenticated={!!session} likedIds={likedIds} savedIds={savedIds} />
      <MobileNav />
    </div>
  );
}
