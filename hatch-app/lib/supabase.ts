import "server-only";
import { createClient } from "@supabase/supabase-js";

export const STORAGE_BUCKETS = {
  logos: "startup-logos",
  images: "startup-images",
  founders: "founder-images"
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to upload files."
    );
  }
  // service role key bypasses RLS - never send this to the browser
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function uploadToStorage(
  bucket: StorageBucket,
  file: File
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteFromStorage(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(bucket).remove([path]);
}
