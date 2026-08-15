import "server-only";
import { prisma } from "@/lib/prisma";

export async function toggleLike(userId: string, startupId: string): Promise<{ liked: boolean }> {
  const existing = await prisma.like.findUnique({
    where: { userId_startupId: { userId, startupId } }
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }
  await prisma.like.create({ data: { userId, startupId } });
  return { liked: true };
}

export async function toggleSave(userId: string, startupId: string): Promise<{ saved: boolean }> {
  const existing = await prisma.savedStartup.findUnique({
    where: { userId_startupId: { userId, startupId } }
  });
  if (existing) {
    await prisma.savedStartup.delete({ where: { id: existing.id } });
    return { saved: false };
  }
  await prisma.savedStartup.create({ data: { userId, startupId } });
  return { saved: true };
}

export async function recordView(startupId: string, userId?: string, sessionId?: string) {
  return prisma.view.create({ data: { startupId, userId, sessionId } });
}

export async function recordWebsiteClick(startupId: string, userId?: string) {
  return prisma.websiteClick.create({ data: { startupId, userId } });
}

export async function isLikedByUser(userId: string, startupId: string): Promise<boolean> {
  const row = await prisma.like.findUnique({ where: { userId_startupId: { userId, startupId } } });
  return !!row;
}

export async function isSavedByUser(userId: string, startupId: string): Promise<boolean> {
  const row = await prisma.savedStartup.findUnique({ where: { userId_startupId: { userId, startupId } } });
  return !!row;
}

export async function getUserLikedStartupIds(userId: string): Promise<string[]> {
  const rows = await prisma.like.findMany({ where: { userId }, select: { startupId: true } });
  return rows.map((r) => r.startupId);
}

export async function getUserSavedStartupIds(userId: string): Promise<string[]> {
  const rows = await prisma.savedStartup.findMany({ where: { userId }, select: { startupId: true } });
  return rows.map((r) => r.startupId);
}

const relatedStartupInclude = {
  founders: { orderBy: { displayOrder: "asc" as const } },
  images: { orderBy: { displayOrder: "asc" as const } },
  categories: { include: { category: true } },
  _count: { select: { likes: true, saves: true, views: true, clicks: true } }
};

export async function getUserSavedStartups(userId: string) {
  const rows = await prisma.savedStartup.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { startup: { include: relatedStartupInclude } }
  });
  return rows.map((r) => r.startup);
}

export async function getUserLikedStartups(userId: string) {
  const rows = await prisma.like.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { startup: { include: relatedStartupInclude } }
  });
  return rows.map((r) => r.startup);
}

export async function getUserRecentViews(userId: string, limit = 10) {
  const rows = await prisma.view.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { startup: { include: relatedStartupInclude } },
    distinct: ["startupId"]
  });
  return rows.map((r) => r.startup);
}
