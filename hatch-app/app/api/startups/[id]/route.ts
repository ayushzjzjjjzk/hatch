import { NextRequest, NextResponse } from "next/server";
import { getStartupById, updateStartup, deleteStartup, isSlugTaken, setStartupStatus } from "@/lib/services/startups";
import { startupSchema } from "@/lib/validations/startup";
import { requireAdminSession } from "@/lib/auth";

// GET /api/startups/[id] - admin only (public detail page uses the slug route instead)
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const startup = await getStartupById(params.id);
  if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ startup });
}

// PATCH /api/startups/[id] - admin only. Supports either a full form payload
// (validated against startupSchema) or a lightweight { status } toggle.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const body = await request.json().catch(() => null);

  if (body && typeof body === "object" && Object.keys(body).length === 1 && "status" in body) {
    if (body.status !== "DRAFT" && body.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const startup = await setStartupStatus(params.id, body.status);
    return NextResponse.json({ startup });
  }

  const parsed = startupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  if (await isSlugTaken(parsed.data.slug, params.id)) {
    return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
  }

  const startup = await updateStartup(params.id, parsed.data);
  return NextResponse.json({ startup });
}

// DELETE /api/startups/[id] - admin only. Cascades to founders/images/categories/likes/saves/views/clicks.
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  await deleteStartup(params.id);
  return NextResponse.json({ ok: true });
}
