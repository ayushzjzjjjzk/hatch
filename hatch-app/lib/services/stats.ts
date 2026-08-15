import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [totalStartups, published, drafts, totalViews, totalLikes, totalClicks, totalSaved] =
    await Promise.all([
      prisma.startup.count(),
      prisma.startup.count({ where: { status: "PUBLISHED" } }),
      prisma.startup.count({ where: { status: "DRAFT" } }),
      prisma.view.count(),
      prisma.like.count(),
      prisma.websiteClick.count(),
      prisma.savedStartup.count()
    ]);

  const topBy = (orderBy: object) =>
    prisma.startup.findMany({
      orderBy,
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        _count: { select: { views: true, likes: true, saves: true, clicks: true } }
      }
    });

  const [mostViewed, mostLiked, mostSaved, mostClicked] = await Promise.all([
    topBy({ views: { _count: "desc" } }),
    topBy({ likes: { _count: "desc" } }),
    topBy({ saves: { _count: "desc" } }),
    topBy({ clicks: { _count: "desc" } })
  ]);

  return {
    totalStartups,
    published,
    drafts,
    totalViews,
    totalLikes,
    totalClicks,
    totalSaved,
    mostViewed,
    mostLiked,
    mostSaved,
    mostClicked
  };
}
