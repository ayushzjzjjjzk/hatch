import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getStartupBySlug, getAllCategories } from "@/lib/services/startups";
import { isLikedByUser, isSavedByUser } from "@/lib/services/interactions";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { StartupDetailContent } from "@/components/startup/StartupDetailContent";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const startup = await getStartupBySlug(params.slug);
  if (!startup) return {};

  return {
    title: `${startup.name} — YC ${startup.ycBatch}`,
    description: startup.shortDescription,
    openGraph: {
      title: `${startup.name} — YC ${startup.ycBatch} | Hatch`,
      description: startup.shortDescription,
      images: startup.coverImageUrl ? [{ url: startup.coverImageUrl }] : undefined
    }
  };
}

export default async function StartupDetailPage({ params }: PageProps) {
  const [startup, session, categories] = await Promise.all([
    getStartupBySlug(params.slug),
    getSession(),
    getAllCategories()
  ]);

  if (!startup) notFound();

  const [liked, saved] = await Promise.all([
    session ? isLikedByUser(session.sub, startup.id) : Promise.resolve(false),
    session ? isSavedByUser(session.sub, startup.id) : Promise.resolve(false)
  ]);

  return (
    <div className="flex">
      <DesktopSidebar categories={categories} />
      <main className="flex-1 px-5 pb-24 pt-8 sm:px-8 lg:pb-12" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
        <div className="mx-auto max-w-2xl">
          <Link href="/explore" className="focus-ring mb-6 inline-flex items-center gap-1 text-sm text-text-dim hover:text-text">
            <ChevronLeft className="h-4 w-4" />
            Back to Explore
          </Link>
          <StartupDetailContent startup={startup} isAuthenticated={!!session} liked={liked} saved={saved} />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
