import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getUserSavedStartups } from "@/lib/services/interactions";
import { getAllCategories } from "@/lib/services/startups";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { CompactStartupCard } from "@/components/startup/CompactStartupCard";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const session = await getSession();
  const categories = await getAllCategories();
  const startups = session ? await getUserSavedStartups(session.sub) : [];

  return (
    <div className="flex">
      <DesktopSidebar categories={categories} />
      <main className="flex-1 px-5 pb-24 pt-8 sm:px-8 lg:pb-12" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight text-text">Saved</h1>

          {!session ? (
            <EmptyState
              title="Sign in to see your saved startups"
              subtitle="Create a free account to start building your list."
              cta={{ href: "/login", label: "Log in" }}
            />
          ) : startups.length === 0 ? (
            <EmptyState
              title="You haven't saved any startups yet."
              subtitle="Bookmark anything interesting as you scroll."
              cta={{ href: "/explore", label: "Explore Startups" }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {startups.map((s) => (
                <CompactStartupCard key={s.id} startup={s} />
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function EmptyState({ title, subtitle, cta }: { title: string; subtitle: string; cta: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border py-24 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
        <Bookmark className="h-5 w-5 text-text-faint" />
      </div>
      <p className="font-display text-lg font-bold text-text">{title}</p>
      <p className="max-w-xs text-sm text-text-dim">{subtitle}</p>
      <Link href={cta.href} className="focus-ring mt-2 rounded-full bg-violet-gradient px-5 py-2.5 text-sm font-medium text-white hover:brightness-110">
        {cta.label}
      </Link>
    </div>
  );
}
