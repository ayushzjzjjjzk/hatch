import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to like startups" }, { status: 401 });

  await prisma.like.upsert({
    where: { userId_startupId: { userId: session.sub, startupId: params.id } },
    create: { userId: session.sub, startupId: params.id },
    update: {}
  });
  const count = await prisma.like.count({ where: { startupId: params.id } });
  return NextResponse.json({ liked: true, count });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await prisma.like.deleteMany({ where: { userId: session.sub, startupId: params.id } });
  const count = await prisma.like.count({ where: { startupId: params.id } });
  return NextResponse.json({ liked: false, count });
}
