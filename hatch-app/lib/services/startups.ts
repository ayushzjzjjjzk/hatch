import "server-only";
import { prisma } from "@/lib/prisma";
import type { StartupInput } from "@/lib/validations/startup";
import { Prisma, StartupStatus } from "@prisma/client";

const publicStartupInclude = {
  founders: { orderBy: { displayOrder: "asc" as const } },
  images: { orderBy: { displayOrder: "asc" as const } },
  categories: { include: { category: true } },
  _count: { select: { likes: true, saves: true, views: true, clicks: true } }
} satisfies Prisma.StartupInclude;

export type StartupWithRelations = Prisma.StartupGetPayload<{ include: typeof publicStartupInclude }>;

export interface StartupListParams {
  page?: number;
  limit?: number;
  category?: string; // category slug
  batch?: string;
  location?: string;
  employeeRange?: string;
  search?: string;
  sort?: "newest" | "popular" | "recent";
  status?: StartupStatus; // admin-only override; public callers must omit this
}

function buildWhere(params: StartupListParams, forcePublished: boolean): Prisma.StartupWhereInput {
  const where: Prisma.StartupWhereInput = {};

  where.status = forcePublished ? "PUBLISHED" : params.status;

  if (params.category) {
    where.categories = { some: { category: { slug: params.category } } };
  }
  if (params.batch) where.ycBatch = params.batch;
  if (params.location) where.location = { contains: params.location, mode: "insensitive" };
  if (params.employeeRange) where.employeeRange = params.employeeRange;

  if (params.search) {
    const q = params.search;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { ycBatch: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { founders: { some: { name: { contains: q, mode: "insensitive" } } } },
      { categories: { some: { category: { name: { contains: q, mode: "insensitive" } } } } }
    ];
  }

  return where;
}

function buildOrderBy(sort: StartupListParams["sort"]): Prisma.StartupOrderByWithRelationInput[] {
  switch (sort) {
    case "popular":
      return [{ likes: { _count: "desc" } }, { createdAt: "desc" }];
    case "recent":
      return [{ createdAt: "desc" }];
    case "newest":
    default:
      return [{ foundedYear: "desc" }, { createdAt: "desc" }];
  }
}

/** Public feed + explore grid. Always scoped to PUBLISHED, ordered by displayOrder first
 *  unless the caller asked for a specific sort (explore page). */
export async function getPublishedStartups(params: StartupListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 10));
  const where = buildWhere(params, true);
  const orderBy = params.sort ? buildOrderBy(params.sort) : [{ displayOrder: "asc" as const }, { createdAt: "desc" as const }];

  const [startups, total] = await Promise.all([
    prisma.startup.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: publicStartupInclude
    }),
    prisma.startup.count({ where })
  ]);

  return { startups, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Admin startup table: any status, admin-only callers. */
export async function getStartupsForAdmin(params: StartupListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const where = buildWhere(params, false);

  const [startups, total] = await Promise.all([
    prisma.startup.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: publicStartupInclude
    }),
    prisma.startup.count({ where })
  ]);

  return { startups, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getStartupBySlug(slug: string, includeUnpublished = false) {
  return prisma.startup.findFirst({
    where: { slug, ...(includeUnpublished ? {} : { status: "PUBLISHED" }) },
    include: publicStartupInclude
  });
}

export async function getStartupById(id: string) {
  return prisma.startup.findUnique({
    where: { id },
    include: publicStartupInclude
  });
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.startup.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true }
  });
  return !!existing;
}

function startupWriteData(data: StartupInput) {
  return {
    name: data.name,
    slug: data.slug,
    shortDescription: data.shortDescription,
    description: data.description,
    websiteUrl: data.websiteUrl,
    linkedinUrl: data.linkedinUrl ?? null,
    xUrl: data.xUrl ?? null,
    githubUrl: data.githubUrl ?? null,
    youtubeUrl: data.youtubeUrl ?? null,
    logoUrl: data.logoUrl ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    ycBatch: data.ycBatch,
    location: data.location ?? null,
    foundedYear: data.foundedYear ?? null,
    employeeRange: data.employeeRange ?? null,
    status: data.status,
    featured: data.featured,
    displayOrder: data.displayOrder
  };
}

export async function createStartup(data: StartupInput) {
  return prisma.startup.create({
    data: {
      ...startupWriteData(data),
      founders: {
        create: data.founders.map((f, i) => ({
          name: f.name,
          role: f.role,
          photoUrl: f.photoUrl ?? null,
          linkedinUrl: f.linkedinUrl ?? null,
          xUrl: f.xUrl ?? null,
          websiteUrl: f.websiteUrl ?? null,
          bio: f.bio ?? null,
          displayOrder: f.displayOrder ?? i
        }))
      },
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt ?? null,
          displayOrder: img.displayOrder ?? i
        }))
      },
      categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) }
    },
    include: publicStartupInclude
  });
}

/** Editing replaces founders/images/categories wholesale rather than diffing each row -
 *  simpler and correct for an admin form; fine at MVP scale. */
export async function updateStartup(id: string, data: StartupInput) {
  return prisma.$transaction(async (tx) => {
    await tx.founder.deleteMany({ where: { startupId: id } });
    await tx.startupImage.deleteMany({ where: { startupId: id } });
    await tx.startupCategory.deleteMany({ where: { startupId: id } });

    return tx.startup.update({
      where: { id },
      data: {
        ...startupWriteData(data),
        founders: {
          create: data.founders.map((f, i) => ({
            name: f.name,
            role: f.role,
            photoUrl: f.photoUrl ?? null,
            linkedinUrl: f.linkedinUrl ?? null,
            xUrl: f.xUrl ?? null,
            websiteUrl: f.websiteUrl ?? null,
            bio: f.bio ?? null,
            displayOrder: f.displayOrder ?? i
          }))
        },
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? null,
            displayOrder: img.displayOrder ?? i
          }))
        },
        categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) }
      },
      include: publicStartupInclude
    });
  });
}

export async function deleteStartup(id: string) {
  // cascades to founders, images, categories, likes, saves, views, clicks
  return prisma.startup.delete({ where: { id } });
}

export async function setStartupStatus(id: string, status: StartupStatus) {
  return prisma.startup.update({ where: { id }, data: { status } });
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getDistinctBatches() {
  const rows = await prisma.startup.findMany({
    where: { status: "PUBLISHED" },
    select: { ycBatch: true },
    distinct: ["ycBatch"]
  });
  return rows.map((r) => r.ycBatch).sort().reverse();
}

export async function getDistinctLocations() {
  const rows = await prisma.startup.findMany({
    where: { status: "PUBLISHED", location: { not: null } },
    select: { location: true },
    distinct: ["location"]
  });
  return rows.map((r) => r.location as string).sort();
}
