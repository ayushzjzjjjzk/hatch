import { getAllCategories } from "@/lib/services/startups";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8">
        <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-text">Categories</h1>
        <p className="mb-8 text-sm text-text-dim">These power the category filter on Explore and the sidebar shortcuts.</p>
        <CategoryManager categories={categories} />
      </main>
    </div>
  );
}
