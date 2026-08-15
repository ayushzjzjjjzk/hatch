import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to save startups" }, { status: 401 });

  await prisma.savedStartup.upsert({
    where: { userId_startupId: { userId: session.sub, startupId: params.id } },
    create: { userId: session.sub, startupId: params.id },
    update: {}
  });
  return NextResponse.json({ saved: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await prisma.savedStartup.deleteMany({ where: { userId: session.sub, startupId: params.id } });
  return NextResponse.json({ saved: false });
}
