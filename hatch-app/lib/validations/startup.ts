import { z } from "zod";
import { founderSchema, optionalUrl } from "./founder";
import { EMPLOYEE_RANGES } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export const startupImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  alt: z.string().max(160).optional(),
  displayOrder: z.number().int().default(0)
});

export const startupSchema = z.object({
  name: z.string().trim().min(2, "Startup name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description should be at least 10 characters")
    .max(200, "Keep the short description under 200 characters"),
  description: z.string().trim().min(20, "Add a fuller description"),

  websiteUrl: z.string().trim().url("Enter a valid URL, including https://"),
  linkedinUrl: optionalUrl,
  xUrl: optionalUrl,
  githubUrl: optionalUrl,
  youtubeUrl: optionalUrl,

  logoUrl: optionalUrl,
  coverImageUrl: optionalUrl,

  ycBatch: z.string().trim().min(2, "e.g. W26, S26").max(10),
  location: z.string().trim().max(100).optional().or(z.literal("")).transform((v) => v || undefined),
  foundedYear: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) => (v === undefined || Number.isNaN(v) ? undefined : v))
    .refine((v) => v === undefined || (v >= 1990 && v <= currentYear + 1), {
      message: "Enter a realistic founding year"
    }),
  employeeRange: z.enum(EMPLOYEE_RANGES).optional(),

  categoryIds: z.array(z.string()).min(1, "Select at least one category"),

  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),

  founders: z.array(founderSchema).min(1, "Add at least one founder"),
  images: z.array(startupImageSchema).optional().default([])
});

export type StartupInput = z.infer<typeof startupSchema>;
