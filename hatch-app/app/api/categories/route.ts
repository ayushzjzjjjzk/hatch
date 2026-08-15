import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllCategories } from "@/lib/services/startups";
import { requireAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json({ categories });
}

const createCategorySchema = z.object({ name: z.string().trim().min(2).max(50) });

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const existing = await prisma.category.findFirst({ where: { OR: [{ name: parsed.data.name }, { slug }] } });
  if (existing) return NextResponse.json({ error: "That category already exists" }, { status: 409 });

  const category = await prisma.category.create({ data: { name: parsed.data.name, slug } });
  return NextResponse.json({ category }, { status: 201 });
}
