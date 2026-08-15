import Link from "next/link";
import Image from "next/image";
import { Rocket, CheckCircle2, FileEdit, Eye, Heart, MousePointerClick, Bookmark } from "lucide-react";
import { getAdminStats } from "@/lib/services/stats";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatCard } from "@/components/admin/StatCard";
import { initials, formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8">
        <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-text">Dashboard</h1>
        <p className="mb-8 text-sm text-text-dim">An overview of everything happening on Hatch.</p>

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Startups" value={stats.totalStartups} icon={Rocket} accent />
          <StatCard label="Published" value={stats.published} icon={CheckCircle2} />
          <StatCard label="Drafts" value={stats.drafts} icon={FileEdit} />
          <StatCard label="Total Views" value={formatCount(stats.totalViews)} icon={Eye} />
          <StatCard label="Total Likes" value={formatCount(stats.totalLikes)} icon={Heart} />
          <StatCard label="Website Clicks" value={formatCount(stats.totalClicks)} icon={MousePointerClick} />
          <StatCard label="Saved Startups" value={formatCount(stats.totalSaved)} icon={Bookmark} />
        </div>

        <div id="analytics" className="scroll-mt-8">
          <h2 className="mb-4 font-display text-lg font-bold text-text">Top performers</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopList title="Most Viewed" items={stats.mostViewed} metric="views" />
            <TopList title="Most Liked" items={stats.mostLiked} metric="likes" />
            <TopList title="Most Saved" items={stats.mostSaved} metric="saves" />
            <TopList title="Most Clicked" items={stats.mostClicked} metric="clicks" />
          </div>
        </div>
      </main>
    </div>
  );
}

type TopItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  _count: { views: number; likes: number; saves: number; clicks: number };
};

function TopList({ title, items, metric }: { title: string; items: TopItem[]; metric: keyof TopItem["_count"] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-faint">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-text-faint">No data yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <Link key={item.id} href={`/admin/startups/${item.id}/edit`} className="focus-ring flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 hover:bg-white/[0.04]">
              <div className="flex min-w-0 items-center gap-2.5">
                {item.logoUrl ? (
                  <Image src={item.logoUrl} alt="" width={24} height={24} className="h-6 w-6 rounded-md border border-border-strong object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-gradient text-[9px] font-bold text-white">{initials(item.name)}</div>
                )}
                <span className="truncate text-sm text-text">{item.name}</span>
              </div>
              <span className="shrink-0 font-mono text-xs text-text-faint">{formatCount(item._count[metric])}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
