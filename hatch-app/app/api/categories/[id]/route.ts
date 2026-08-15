import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  // startups keep their other categories - this only removes the join rows for this one
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
