import { NextRequest, NextResponse } from "next/server";
import { recordView } from "@/lib/services/interactions";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : undefined;

  await recordView(params.id, session?.sub, session ? undefined : sessionId);
  return NextResponse.json({ ok: true });
}
