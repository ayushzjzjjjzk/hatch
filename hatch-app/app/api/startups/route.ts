import { NextRequest, NextResponse } from "next/server";
import { getPublishedStartups, createStartup, isSlugTaken } from "@/lib/services/startups";
import { startupSchema } from "@/lib/validations/startup";
import { requireAdminSession } from "@/lib/auth";

// GET /api/startups?page=&limit=&category=&batch=&location=&employeeRange=&search=&sort=
// Public - always scoped to PUBLISHED startups.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const result = await getPublishedStartups({
    page: params.get("page") ? Number(params.get("page")) : undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    category: params.get("category") ?? undefined,
    batch: params.get("batch") ?? undefined,
    location: params.get("location") ?? undefined,
    employeeRange: params.get("employeeRange") ?? undefined,
    search: params.get("search") ?? undefined,
    sort: (params.get("sort") as "newest" | "popular" | "recent" | null) ?? undefined
  });

  return NextResponse.json(result);
}

// POST /api/startups - admin only
export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = startupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  if (await isSlugTaken(parsed.data.slug)) {
    return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
  }

  const startup = await createStartup(parsed.data);
  return NextResponse.json({ startup }, { status: 201 });
}
