import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getUserSavedStartups, getUserLikedStartups, getUserRecentViews } from "@/lib/services/interactions";
import { getAllCategories } from "@/lib/services/startups";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { LogoutButton } from "@/components/navigation/LogoutButton";
import { CompactStartupCard } from "@/components/startup/CompactStartupCard";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");

  const [categories, saved, liked, recentViews] = await Promise.all([
    getAllCategories(),
    getUserSavedStartups(session.sub),
    getUserLikedStartups(session.sub),
    getUserRecentViews(session.sub, 8)
  ]);

  return (
    <div className="flex">
      <DesktopSidebar categories={categories} />
      <main className="flex-1 px-5 pb-24 pt-8 sm:px-8 lg:pb-12" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-gradient font-display text-xl font-bold text-white">
              {initials(session.name)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-text">{session.name}</h1>
              <p className="text-sm text-text-dim">{session.email}</p>
            </div>
          </div>

          <ProfileSection title="Saved" emptyText="Nothing saved yet." seeAllHref="/saved" startups={saved.slice(0, 3)} />
          <ProfileSection title="Liked" emptyText="Nothing liked yet." startups={liked.slice(0, 3)} />
          <ProfileSection title="Recently viewed" emptyText="Startups you view will show up here." startups={recentViews} />

          <section id="settings" className="mt-4 scroll-mt-8 rounded-2xl border border-border p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-faint">Settings</p>
            <p className="mb-4 text-sm text-text-dim">Signed in as {session.email}</p>
            <LogoutButton />
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function ProfileSection({
  title,
  emptyText,
  seeAllHref,
  startups
}: {
  title: string;
  emptyText: string;
  seeAllHref?: string;
  startups: Parameters<typeof CompactStartupCard>[0]["startup"][];
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-text">{title}</h2>
        {seeAllHref && startups.length > 0 && (
          <Link href={seeAllHref} className="text-xs font-medium text-violet-light hover:underline">
            See all
          </Link>
        )}
      </div>
      {startups.length === 0 ? (
        <p className="text-sm text-text-faint">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((s) => (
            <CompactStartupCard key={s.id} startup={s} />
          ))}
        </div>
      )}
    </section>
  );
}
