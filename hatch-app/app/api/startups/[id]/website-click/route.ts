import { NextRequest, NextResponse } from "next/server";
import { recordWebsiteClick } from "@/lib/services/interactions";
import { getSession } from "@/lib/auth";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  await recordWebsiteClick(params.id, session?.sub);
  return NextResponse.json({ ok: true });
}
