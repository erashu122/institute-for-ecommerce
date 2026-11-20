import { z } from "zod";

export const contentKinds = [
  "faculty",
  "blog",
  "blog-categories",
  "events",
  "testimonials",
  "faqs",
  "pages",
] as const;
export const kindSchema = z.enum(contentKinds);
export type ContentKind = z.infer<typeof kindSchema>;
export const kindLabels: Record<ContentKind, string> = {
  faculty: "Faculty",
  blog: "Blog posts",
  "blog-categories": "Blog categories",
  events: "Events",
  testimonials: "Testimonials",
  faqs: "FAQs",
  pages: "About Us",
};
export const routes: Record<ContentKind, string> = {
  faculty: "/faculty",
  blog: "/blog",
  "blog-categories": "/blog",
  events: "/events",
  testimonials: "/testimonials",
  faqs: "/faqs",
  pages: "/about",
};
export const detailFields: Record<
  ContentKind,
  { name: string; label: string; required: boolean }[]
> = {
  faculty: [
    { name: "position", label: "Position", required: true },
    { name: "qualifications", label: "Qualifications", required: false },
  ],
  blog: [{ name: "author", label: "Author", required: true }],
  "blog-categories": [],
  events: [
    { name: "startsAt", label: "Start date and time (IST)", required: true },
    { name: "endsAt", label: "End date and time (IST)", required: false },
    {
      name: "location",
      label: "Venue or online meeting information",
      required: true,
    },
  ],
  testimonials: [
    {
      name: "personRole",
      label: "Person's role or affiliation",
      required: false,
    },
  ],
  faqs: [],
  pages: [
    { name: "mission", label: "Mission", required: true },
    { name: "vision", label: "Vision", required: true },
    { name: "leadership", label: "Leadership", required: true },
  ],
};

const requiredText = z.string().trim().min(1).max(4000);
const optionalText = z.string().trim().max(4000).default("");
const date = z.iso.datetime({ offset: true });
export const detailSchemas = {
  faculty: z.object({ position: requiredText, qualifications: optionalText }),
  blog: z.object({ author: requiredText }),
  "blog-categories": z.object({}),
  events: z
    .object({
      startsAt: date,
      endsAt: z.union([date, z.literal("")]).default(""),
      location: requiredText,
    })
    .refine(
      (value) =>
        !value.endsAt || new Date(value.endsAt) >= new Date(value.startsAt),
      { path: ["endsAt"], message: "End time must be at or after start time." },
    ),
  testimonials: z.object({ personRole: optionalText }),
  faqs: z.object({}),
  pages: z.object({
    mission: requiredText,
    vision: requiredText,
    leadership: requiredText,
  }),
};

export const contentInput = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase words separated by hyphens.",
    ),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(600).default(""),
  body: z.string().trim().min(1).max(50000),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  imageId: z.string().max(100).default(""),
  categoryId: z.string().max(100).default(""),
  details: z.record(z.string(), z.string()).default({}),
});
export function parseContent(kind: ContentKind, value: unknown) {
  const input = contentInput.parse(value);
  if (kind === "pages" && input.slug !== "about") {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["slug"],
        message: "The institutional page slug must be about.",
      },
    ]);
  }
  return {
    ...input,
    details: detailSchemas[kind].parse(input.details) as Record<string, string>,
  };
}
export const contentQuery = z.object({
  search: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  category: z.string().max(100).default(""),
});
export type ContentEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  details: Record<string, string>;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED";
  version: number;
  imageId: string | null;
  categoryId?: string | null;
  image: { id: string; alt: string } | null;
  createdAt: string;
  updatedAt: string;
};
export const contentPageSize = 8;
