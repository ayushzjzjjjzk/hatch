import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), {
    message: "Only JPG, PNG, and WEBP images are allowed"
  })
  .refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, {
    message: "Images must be 5MB or smaller"
  });

// maps 1:1 to the Supabase Storage buckets in lib/supabase.ts
export const uploadBucketSchema = z.enum(["logos", "images", "founders"]);
