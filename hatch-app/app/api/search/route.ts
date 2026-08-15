import { NextRequest, NextResponse } from "next/server";
import { getPublishedStartups } from "@/lib/services/startups";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ startups: [], total: 0 });

  const result = await getPublishedStartups({ search: q, limit: 20, sort: "popular" });
  return NextResponse.json(result);
}
