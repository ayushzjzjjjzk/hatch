import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { imageFileSchema, uploadBucketSchema } from "@/lib/validations/upload";
import { uploadToStorage, STORAGE_BUCKETS, type StorageBucket } from "@/lib/supabase";

const BUCKET_MAP: Record<string, StorageBucket> = {
  logos: STORAGE_BUCKETS.logos,
  images: STORAGE_BUCKETS.images,
  founders: STORAGE_BUCKETS.founders
};

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });

  const bucketParsed = uploadBucketSchema.safeParse(formData.get("bucket"));
  if (!bucketParsed.success) {
    return NextResponse.json({ error: "bucket must be one of: logos, images, founders" }, { status: 400 });
  }

  const fileParsed = imageFileSchema.safeParse(formData.get("file"));
  if (!fileParsed.success) {
    return NextResponse.json({ error: fileParsed.error.issues[0]?.message ?? "Invalid file" }, { status: 400 });
  }

  try {
    const { url } = await uploadToStorage(BUCKET_MAP[bucketParsed.data], fileParsed.data);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
