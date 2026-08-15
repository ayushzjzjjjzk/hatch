import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/services/stats";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
