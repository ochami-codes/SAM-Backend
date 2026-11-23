import { z } from "zod";

export const resolveContentSeoSchema = z.object({
  section: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(300).optional(),
  heroImage: z.string().max(2048).optional(),
  source: z.enum(["managed", "static"]),
  seo: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(300).optional(),
    image: z.string().trim().min(1).max(2048).optional(),
  }).strict().optional(),
}).strict();

export const resolveSectionSeoSchema = z.object({
  section: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(300).optional(),
  heroImage: z.string().max(2048).optional(),
}).strict();

export const resolveCategorySeoSchema = z.object({
  section: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(300).optional(),
}).strict();