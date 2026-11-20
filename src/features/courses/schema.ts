import { z } from "zod";

export const modes = ["ONLINE", "CLASSROOM", "HYBRID"] as const;
export const slugSchema = z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.").refine(value => !["enquiry", "application"].includes(value), "This slug is reserved.");
const text = (max: number) => z.string().trim().min(1).max(max);

export const courseInput = z.object({
  title: text(160),
  slug: slugSchema,
  summary: text(400),
  description: text(20000),
  categoryId: text(100),
  duration: text(100),
  mode: z.enum(modes),
  eligibility: text(2000),
  curriculum: z.array(text(500)).min(1).max(50),
  outcomes: z.array(text(500)).min(1).max(50),
  fee: z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, "Enter a nonnegative fee with up to two decimal places."),
  image: z.union([z.literal(""), z.url({ protocol: /^https$/ }).max(2000)]),
});

export const courseQuery = z.object({
  search: z.string().trim().max(100).default(""),
  category: z.union([z.literal(""), slugSchema]).default(""),
  mode: z.union([z.literal(""), z.enum(modes)]).default(""),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});

export type CourseInput = z.infer<typeof courseInput>;
export type CourseQuery = z.infer<typeof courseQuery>;
export type CourseCard = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  duration: string;
  mode: typeof modes[number];
  fee: string;
  category: { id: string; name: string; slug: string };
};
export type CourseDetail = CourseCard & {
  description: string;
  eligibility: string;
  curriculum: string[];
  outcomes: string[];
  image: string | null;
  status: "DRAFT" | "PUBLISHED";
};
export const pageSize = 6;

