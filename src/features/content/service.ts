import "server-only";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client";
import { getPrisma } from "../../server/db/client";
import { currentStaff } from "../../server/auth";
import { assertStaff, CourseError } from "../courses/permissions";
import {
  contentQuery,
  contentPageSize,
  kindSchema,
  parseContent,
  type ContentKind,
  type ContentEntry,
} from "./schema";

const entityIdentity = z.object({
  id: z.string().min(1).max(100),
  version: z.number().int().positive(),
});

type ContentRow = Omit<ContentEntry, "createdAt" | "updatedAt" | "details"> & {
  details: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};
type Where = {
  id?: string;
  slug?: string;
  imageId?: string;
  status?: "DRAFT" | "PUBLISHED";
  version?: number;
  categoryId?: string;
  OR?: {
    title?: { contains: string; mode: "insensitive" };
    summary?: { contains: string; mode: "insensitive" };
  }[];
};
type WriteData = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  details: Prisma.InputJsonValue;
  sortOrder: number;
  imageId: string | null;
  categoryId?: string | null;
  startsAt?: Date;
  endsAt?: Date | null;
  status: "DRAFT" | "PUBLISHED";
};
type Store = {
  findMany(args: {
    where: Where;
    include: { image: true };
    orderBy: ({ sortOrder: "asc" } | { createdAt: "desc" } | { id: "asc" })[];
    skip: number;
    take: number;
  }): Promise<ContentRow[]>;
  findFirst(args: {
    where: Where;
    include: { image: true };
  }): Promise<ContentRow | null>;
  count(args: { where: Where }): Promise<number>;
  create(args: { data: WriteData }): Promise<{ id: string }>;
  updateMany(args: {
    where: Where;
    data: Partial<WriteData> & { version: { increment: number } };
  }): Promise<{ count: number }>;
  deleteMany(args: { where: Where }): Promise<{ count: number }>;
};
function store(input: ContentKind): Store {
  const kind = kindSchema.parse(input);
  const db = getPrisma();
  // The CMS tables share these scalar fields and the image relation. Domain details
  // are validated separately for each kind before crossing this ORM boundary.
  const stores = {
    faculty: db.faculty,
    blog: db.blogPost,
    "blog-categories": db.blogCategory,
    events: db.event,
    testimonials: db.testimonial,
    faqs: db.fAQ,
    pages: db.institutionalContent,
  };
  return stores[kind] as unknown as Store;
}
function serialize(row: ContentRow): ContentEntry {
  return {
    ...row,
    details: row.details as Record<string, string>,
    image: row.image ? { id: row.image.id, alt: row.image.alt } : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
export async function listContent(
  kind: ContentKind,
  input: unknown = {},
  admin = false,
) {
  if (admin) assertStaff(await currentStaff());
  const query = contentQuery.parse(input);
  const where: Where = {
    ...(admin ? {} : { status: "PUBLISHED" }),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { summary: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(kind === "blog" && query.category
      ? { categoryId: query.category }
      : {}),
  };
  const repo = store(kind);
  const [total, rows] = await Promise.all([
    repo.count({ where }),
    repo.findMany({
      where,
      include: { image: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * contentPageSize,
      take: contentPageSize,
    }),
  ]);
  return {
    items: rows.map(serialize),
    total,
    page: query.page,
    totalPages: Math.ceil(total / contentPageSize),
  };
}
export async function getContent(
  kind: ContentKind,
  key: string,
  admin = false,
) {
  if (admin) assertStaff(await currentStaff());
  z.string().min(1).max(120).parse(key);
  const row = await store(kind).findFirst({
    where: admin ? { id: key } : { slug: key, status: "PUBLISHED" },
    include: { image: true },
  });
  return row ? serialize(row) : null;
}
export async function saveContent(
  kind: ContentKind,
  id: string | null,
  version: number,
  raw: unknown,
) {
  assertStaff(await currentStaff());
  if (id !== null) entityIdentity.parse({ id, version });
  const input = parseContent(kind, raw);
  const db = getPrisma();
  if (
    input.imageId &&
    !(await db.mediaAsset.findUnique({ where: { id: input.imageId } }))
  )
    throw new CourseError("INVALID", "Choose an existing uploaded image.");
  if (
    kind === "blog" &&
    input.categoryId &&
    !(await db.blogCategory.findUnique({ where: { id: input.categoryId } }))
  )
    throw new CourseError("INVALID", "Choose an existing blog category.");
  const data: WriteData = {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    details: input.details,
    sortOrder: input.sortOrder,
    imageId: input.imageId || null,
    status: "DRAFT",
    ...(kind === "blog" ? { categoryId: input.categoryId || null } : {}),
    ...(kind === "events"
      ? {
          startsAt: new Date(input.details.startsAt),
          endsAt: input.details.endsAt ? new Date(input.details.endsAt) : null,
        }
      : {}),
  };
  try {
    if (!id) return (await store(kind).create({ data })).id;
    const updated = await store(kind).updateMany({
      where: { id, version },
      data: { ...data, version: { increment: 1 } },
    });
    if (!updated.count)
      throw new CourseError(
        "CONFLICT",
        "Content changed or was removed. Reload before saving.",
      );
    return id;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    )
      throw new CourseError("CONFLICT", "This slug is already in use.");
    throw error;
  }
}
export async function publishContent(
  kind: ContentKind,
  id: string,
  version: number,
  status: "DRAFT" | "PUBLISHED",
) {
  assertStaff(await currentStaff(), true);
  entityIdentity.parse({ id, version });
  if (status !== "DRAFT" && status !== "PUBLISHED")
    throw new CourseError("INVALID", "Invalid publication status.");
  const current = await getContent(kind, id, true);
  if (!current) throw new CourseError("NOT_FOUND", "Content was not found.");
  if (status === "PUBLISHED")
    parseContent(kind, {
      ...current,
      imageId: current.imageId ?? "",
      categoryId: current.categoryId ?? "",
    });
  const result = await store(kind).updateMany({
    where: { id, version },
    data: { status, version: { increment: 1 } },
  });
  if (!result.count)
    throw new CourseError(
      "CONFLICT",
      "Content changed. Reload before publishing.",
    );
}
export async function deleteContent(
  kind: ContentKind,
  id: string,
  version: number,
) {
  assertStaff(await currentStaff(), true);
  entityIdentity.parse({ id, version });
  try {
    const result = await store(kind).deleteMany({ where: { id, version } });
    if (!result.count)
      throw new CourseError(
        "CONFLICT",
        "Content changed or was removed. Reload before deleting.",
      );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2003"
    )
      throw new CourseError(
        "CONFLICT",
        "Remove this category from its blog posts before deleting it.",
      );
    throw error;
  }
}

export async function blogCategoryOptions(admin = false) {
  if (admin) assertStaff(await currentStaff());
  return getPrisma().blogCategory.findMany({
    where: admin ? {} : { status: "PUBLISHED" },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}

