import "server-only";
import { getPrisma } from "../../server/db/client";
import { currentStaff } from "../../server/auth";
import { Prisma } from "../../generated/prisma/client";
import { courseInput, courseQuery, pageSize, slugSchema } from "./schema";
import { assertStaff, CourseError } from "./permissions";

const db = getPrisma;
function serialize(course: Prisma.CourseGetPayload<{ include: { category: true } }>) {
  return { ...course, fee: course.fee.toFixed(2), createdAt: course.createdAt.toISOString(), updatedAt: course.updatedAt.toISOString() };
}

export async function listCourses(input: unknown, admin = false) {
  if (admin) assertStaff(await currentStaff());
  const query = courseQuery.parse(input);
  const where: Prisma.CourseWhereInput = {
    ...(admin ? {} : { status: "PUBLISHED" }),
    ...(query.search ? { OR: [{ title: { contains: query.search, mode: "insensitive" } }, { summary: { contains: query.search, mode: "insensitive" } }] } : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.mode ? { mode: query.mode } : {}),
  };
  const [total, courses] = await db().$transaction([
    db().course.count({ where }),
    db().course.findMany({ where, include: { category: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: pageSize, skip: (query.page - 1) * pageSize }),
  ]);
  return { items: courses.map(serialize), total, page: query.page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getPublicCourse(slug: string) {
  if (!slugSchema.safeParse(slug).success) return null;
  const course = await db().course.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } });
  return course ? serialize(course) : null;
}

export async function getAdminCourse(id: string) {
  assertStaff(await currentStaff());
  const course = await db().course.findUnique({ where: { id }, include: { category: true } });
  return course ? serialize(course) : null;
}

export async function categories(admin = false) {
  if (admin) assertStaff(await currentStaff());
  return db().courseCategory.findMany({
    where: admin ? {} : { courses: { some: { status: "PUBLISHED" } } },
    orderBy: { name: "asc" },
  });
}

export async function saveCourse(id: string | null, input: unknown) {
  assertStaff(await currentStaff());
  const parsed = courseInput.parse(input);
  const data = { ...parsed, image: parsed.image || null };
  try {
    if (!await db().courseCategory.findUnique({ where: { id: data.categoryId } })) {
      throw new CourseError("INVALID", "Choose an existing category.");
    }
    const course = id
      ? await db().course.update({ where: { id }, data })
      : await db().course.create({ data });
    return course.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new CourseError("CONFLICT", "This slug is already in use.");
      if (error.code === "P2025") throw new CourseError("NOT_FOUND", "Course was not found.");
    }
    throw error;
  }
}

export async function changeCourseStatus(id: string, status: "DRAFT" | "PUBLISHED") {
  assertStaff(await currentStaff(), true);
  const course = await db().course.findUnique({ where: { id } });
  if (!course) throw new CourseError("NOT_FOUND", "Course was not found.");
  if (status === "PUBLISHED") courseInput.parse({ ...course, fee: course.fee.toFixed(2), image: course.image ?? "" });
  await db().course.update({ where: { id }, data: { status } });
}

export async function deleteCourse(id: string) {
  assertStaff(await currentStaff(), true);
  await db().course.delete({ where: { id } });
}

