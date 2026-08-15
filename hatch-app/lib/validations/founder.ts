import { z } from "zod";

const optionalUrl = z
  .union([z.string().url(), z.literal("")])
  .optional()
  .transform((v) => (v ? v : undefined));

export const founderSchema = z.object({
  id: z.string().optional(), // present when editing an existing founder
  name: z.string().trim().min(2, "Founder name is required").max(80),
  role: z.string().trim().min(2, "Role is required").max(60),
  photoUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  xUrl: optionalUrl,
  websiteUrl: optionalUrl,
  bio: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
  displayOrder: z.number().int().default(0)
});

export type FounderInput = z.infer<typeof founderSchema>;
export { optionalUrl };
