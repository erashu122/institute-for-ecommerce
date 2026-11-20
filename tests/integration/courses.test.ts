import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const access = vi.hoisted(() => ({ staff: { active: true, role: "ADMIN" } as { active: boolean; role: string } | null }));
vi.mock("../../src/server/auth", () => ({ currentStaff: async () => access.staff }));
import { getPrisma } from "../../src/server/db/client";
import { listCourses, getPublicCourse, saveCourse, changeCourseStatus, deleteCourse } from "../../src/features/courses/service";

if (process.env.INSTITUTE_TEST_DATABASE !== "1") throw new Error("Run only with an isolated test database.");
const db = getPrisma();
const prefix = "test-" + Date.now();
const category = await db.courseCategory.create({ data: { name: prefix, slug: prefix } });
const data = { title: "Workflow course", slug: prefix, summary: "Integration test", description: "Full description", categoryId: category.id, duration: "4 weeks", mode: "ONLINE", eligibility: "None", curriculum: ["Basics"], outcomes: ["Learn"], fee: "500.00", image: "" };
let id: string;
afterAll(async () => {
  await db.course.deleteMany({ where: { categoryId: category.id } });
  await db.courseCategory.delete({ where: { id: category.id } });
  await db.$disconnect();
});
describe.sequential("Course workflow on PostgreSQL", () => {
  it("creates draft courses and keeps them private", async () => {
    id = await saveCourse(null, data);
    expect(await getPublicCourse(data.slug)).toBeNull();
    expect((await listCourses({ category: category.slug })).total).toBe(0);
  });
  it("enforces unique slugs", async () => {
    await expect(saveCourse(null, data)).rejects.toThrow("slug is already");
  });
  it("validates before writing", async () => {
    await expect(saveCourse(id, { ...data, fee: "-1" })).rejects.toThrow();
    expect((await db.course.findUniqueOrThrow({ where: { id } })).fee.toFixed(2)).toBe("500.00");
  });
  it("edits, publishes, searches and filters", async () => {
    await saveCourse(id, { ...data, title: "Updated workflow" });
    await changeCourseStatus(id, "PUBLISHED");
    expect((await getPublicCourse(data.slug))?.title).toBe("Updated workflow");
    expect((await listCourses({ search: "updated", category: category.slug, mode: "ONLINE" })).total).toBe(1);
    expect((await listCourses({ category: category.slug, mode: "HYBRID" })).total).toBe(0);
    for (let index = 0; index < 6; index++) {
      const next = await saveCourse(null, { ...data, slug: data.slug + "-" + index });
      await changeCourseStatus(next, "PUBLISHED");
    }
    expect((await listCourses({ category: category.slug })).items).toHaveLength(6);
    expect((await listCourses({ category: category.slug, page: 2 })).items).toHaveLength(1);
  });
  it("rejects anonymous, disabled and unauthorized mutations", async () => {
    access.staff = null;
    await expect(saveCourse(id, data)).rejects.toThrow("sign-in");
    await expect(deleteCourse(id)).rejects.toThrow("sign-in");
    access.staff = { active: false, role: "ADMIN" };
    await expect(changeCourseStatus(id, "DRAFT")).rejects.toThrow("permission");
    access.staff = { active: true, role: "EDITOR" };
    await expect(changeCourseStatus(id, "DRAFT")).rejects.toThrow("permission");
    await expect(deleteCourse(id)).rejects.toThrow("permission");
    access.staff = { active: true, role: "ADMIN" };
  });
  it("unpublishes and deletes", async () => {
    await changeCourseStatus(id, "DRAFT");
    expect(await getPublicCourse(data.slug)).toBeNull();
    await deleteCourse(id);
    expect(await db.course.findUnique({ where: { id } })).toBeNull();
  });
});
