import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validations/upload";

export type UploadBucket = "logos" | "images" | "founders";

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG, and WEBP images are allowed";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return "Images must be 5MB or smaller";
  return null;
}

export async function uploadImage(bucket: UploadBucket, file: File): Promise<string> {
  const clientError = validateImageFile(file);
  if (clientError) throw new Error(clientError);

  const formData = new FormData();
  formData.append("bucket", bucket);
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Upload failed");
  }
  const data = await res.json();
  return data.url as string;
}
