import { getAllCategories } from "@/lib/services/startups";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StartupForm } from "@/components/admin/StartupForm";

export const dynamic = "force-dynamic";

export default async function NewStartupPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 px-6 py-8 lg:px-8">
        <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-text">Add Startup</h1>
        <p className="mb-8 text-sm text-text-dim">Fill in as much as you have - you can always come back and edit it later.</p>
        <StartupForm categories={categories} />
      </main>
    </div>
  );
}
