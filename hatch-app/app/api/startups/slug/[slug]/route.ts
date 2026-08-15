import { NextRequest, NextResponse } from "next/server";
import { getStartupBySlug } from "@/lib/services/startups";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const startup = await getStartupBySlug(params.slug);
  if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ startup });
}
