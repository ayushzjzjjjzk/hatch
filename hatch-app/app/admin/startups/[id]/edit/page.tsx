import { notFound } from "next/navigation";
import { getStartupById, getAllCategories } from "@/lib/services/startups";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StartupForm } from "@/components/admin/StartupForm";
import type { StartupInput } from "@/lib/validations/startup";

export const dynamic = "force-dynamic";

export default async function EditStartupPage({ params }: { params: { id: string } }) {
  const [startup, categories] = await Promise.all([getStartupById(params.id), getAllCategories()]);
  if (!startup) notFound();

  const defaultValues: Partial<StartupInput> = {
    name: startup.name,
    slug: startup.slug,
    shortDescription: startup.shortDescription,
    description: startup.description,
    websiteUrl: startup.websiteUrl,
    linkedinUrl: startup.linkedinUrl ?? undefined,
    xUrl: startup.xUrl ?? undefined,
    githubUrl: startup.githubUrl ?? undefined,
    youtubeUrl: startup.youtubeUrl ?? undefined,
    logoUrl: startup.logoUrl ?? undefined,
    coverImageUrl: startup.coverImageUrl ?? undefined,
    ycBatch: startup.ycBatch,
    location: startup.location ?? undefined,
    foundedYear: startup.foundedYear ?? undefined,
    employeeRange: (startup.employeeRange as StartupInput["employeeRange"]) ?? undefined,
    status: startup.status,
    featured: startup.featured,
    displayOrder: startup.displayOrder,
    categoryIds: startup.categories.map((c) => c.categoryId),
    founders: startup.founders.map((f) => ({
      id: f.id,
      name: f.name,
      role: f.role,
      photoUrl: f.photoUrl ?? undefined,
      linkedinUrl: f.linkedinUrl ?? undefined,
      xUrl: f.xUrl ?? undefined,
      websiteUrl: f.websiteUrl ?? undefined,
      bio: f.bio ?? undefined,
      displayOrder: f.displayOrder
    })),
    images: startup.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt ?? undefined, displayOrder: img.displayOrder }))
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 px-6 py-8 lg:px-8">
        <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-text">Edit Startup</h1>
        <p className="mb-8 text-sm text-text-dim">{startup.name}</p>
        <StartupForm categories={categories} defaultValues={defaultValues} startupId={startup.id} />
      </main>
    </div>
  );
}
