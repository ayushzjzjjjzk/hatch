import Link from "next/link";
import { Plus } from "lucide-react";
import { getStartupsForAdmin, getAllCategories, getDistinctBatches } from "@/lib/services/startups";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StartupTable } from "@/components/admin/StartupTable";
import { Select } from "@/components/ui/form-fields";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { search?: string; batch?: string; category?: string; status?: "DRAFT" | "PUBLISHED" };
}

export default async function AdminStartupsPage({ searchParams }: PageProps) {
  const [{ startups, total }, categories, batches] = await Promise.all([
    getStartupsForAdmin({
      search: searchParams.search,
      batch: searchParams.batch,
      category: searchParams.category,
      status: searchParams.status,
      limit: 50
    }),
    getAllCategories(),
    getDistinctBatches()
  ]);

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-text">Startups</h1>
            <p className="text-sm text-text-dim">{total} total</p>
          </div>
          <Link href="/admin/startups/new" className="focus-ring flex items-center gap-2 rounded-full bg-violet-gradient px-4 py-2.5 text-sm font-medium text-white hover:brightness-110">
            <Plus className="h-4 w-4" />
            Add Startup
          </Link>
        </div>

        <form method="get" className="mb-6 flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search startups..."
            className="focus-ring w-56 rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-violet/60"
          />
          <Select name="batch" defaultValue={searchParams.batch ?? ""} className="w-auto">
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={searchParams.category ?? ""} className="w-auto">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={searchParams.status ?? ""} className="w-auto">
            <option value="">Any status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </Select>
          <button type="submit" className="focus-ring rounded-lg border border-border-strong px-3.5 py-2.5 text-sm text-text hover:bg-white/[0.05]">
            Filter
          </button>
        </form>

        {startups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border py-24 text-center">
            <p className="font-display text-lg font-bold text-text">No startups yet.</p>
            <Link href="/admin/startups/new" className="focus-ring mt-2 rounded-full bg-violet-gradient px-5 py-2.5 text-sm font-medium text-white hover:brightness-110">
              Add Startup
            </Link>
          </div>
        ) : (
          <StartupTable startups={startups} />
        )}
      </main>
    </div>
  );
}
