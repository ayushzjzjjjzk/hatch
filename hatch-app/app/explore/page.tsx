import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getPublishedStartups, getAllCategories, getDistinctBatches, getDistinctLocations } from "@/lib/services/startups";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { SearchBar } from "@/components/filters/SearchBar";
import { FilterBar } from "@/components/filters/FilterBar";
import { CompactStartupCard } from "@/components/startup/CompactStartupCard";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    page?: string;
    category?: string;
    batch?: string;
    location?: string;
    employeeRange?: string;
    search?: string;
    sort?: string;
  };
}

export default async function ExplorePage({ searchParams }: PageProps) {
  await getSession(); // available for future personalization; not needed for this read-only page

  const [{ startups, page, totalPages, total }, categories, batches, locations] = await Promise.all([
    getPublishedStartups({
      page: searchParams.page ? Number(searchParams.page) : 1,
      limit: 12,
      category: searchParams.category,
      batch: searchParams.batch,
      location: searchParams.location,
      employeeRange: searchParams.employeeRange,
      search: searchParams.search,
      sort: (searchParams.sort as "newest" | "popular" | "recent") ?? "newest"
    }),
    getAllCategories(),
    getDistinctBatches(),
    getDistinctLocations()
  ]);

  return (
    <div className="flex">
      <DesktopSidebar categories={categories} />
      <main className="flex-1 px-5 pb-24 pt-8 sm:px-8 lg:pb-12" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-text">Explore Startups</h1>
          <p className="mb-6 text-sm text-text-dim">{total} published {total === 1 ? "startup" : "startups"}</p>

          <Suspense fallback={<Skeleton className="h-12 w-full" />}>
            <div className="mb-4">
              <SearchBar />
            </div>
            <div className="mb-8">
              <FilterBar categories={categories} batches={batches} locations={locations} />
            </div>
          </Suspense>

          {startups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border py-24 text-center">
              <p className="font-display text-lg font-bold text-text">No startups found</p>
              <p className="text-sm text-text-dim">Try a different search or clear your filters.</p>
              <Link href="/explore" className="focus-ring mt-2 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-text hover:bg-white/[0.05]">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {startups.map((s) => (
                <CompactStartupCard key={s.id} startup={s} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <PageLink searchParams={searchParams} page={page - 1} disabled={page <= 1}>
                Previous
              </PageLink>
              <span className="px-3 text-sm text-text-dim">
                Page {page} of {totalPages}
              </span>
              <PageLink searchParams={searchParams} page={page + 1} disabled={page >= totalPages}>
                Next
              </PageLink>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function PageLink({
  searchParams,
  page,
  disabled,
  children
}: {
  searchParams: PageProps["searchParams"];
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="cursor-not-allowed rounded-full border border-border px-4 py-2 text-sm text-text-faint">{children}</span>;
  }
  const params = new URLSearchParams(searchParams as Record<string, string>);
  params.set("page", String(page));
  return (
    <Link href={`/explore?${params.toString()}`} className="focus-ring rounded-full border border-border-strong px-4 py-2 text-sm text-text hover:bg-white/[0.05]">
      {children}
    </Link>
  );
}
