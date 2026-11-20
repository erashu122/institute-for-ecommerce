import { afterAll, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
vi.mock("server-only", () => ({}));
const access = vi.hoisted(() => ({
  staff: { active: true, role: "ADMIN" } as {
    active: boolean;
    role: string;
  } | null,
}));
vi.mock("../../src/server/auth", () => ({
  currentStaff: async () => access.staff,
}));
import { getPrisma } from "../../src/server/db/client";
import {
  getContent,
  listContent,
  saveContent,
  publishContent,
  deleteContent,
} from "../../src/features/content/service";
import { uploadImage, readImage } from "../../src/features/media/service";
import type { ContentKind } from "../../src/features/content/schema";
if (process.env.INSTITUTE_TEST_DATABASE !== "1")
  throw new Error("Requires an isolated database.");
const db = getPrisma();
const prefix = "cms-test-" + Date.now();
const ids: { kind: ContentKind; id: string }[] = [];
const base = {
  slug: prefix,
  title: "CMS test",
  body: "Body",
  summary: "Summary",
  sortOrder: 0,
  details: {},
};
afterAll(async () => {
  access.staff = { active: true, role: "ADMIN" };
  for (const item of ids.reverse()) {
    const row = await getContent(item.kind, item.id, true);
    if (row) await deleteContent(item.kind, item.id, row.version);
  }
  await db.$disconnect();
});
describe.sequential("CMS PostgreSQL workflow", () => {
  it("creates, edits, publishes and deletes faculty", async () => {
    const input = {
      ...base,
      details: { position: "Mentor", qualifications: "Commerce" },
    };
    const id = await saveContent("faculty", null, 0, input);
    ids.push({ kind: "faculty", id });
    expect(await getContent("faculty", input.slug)).toBeNull();
    await expect(saveContent("faculty", null, 0, input)).rejects.toThrow(
      "slug",
    );
    const row = await getContent("faculty", id, true);
    await publishContent("faculty", id, row!.version, "PUBLISHED");
    expect((await getContent("faculty", input.slug))?.title).toBe("CMS test");
    const published = await getContent("faculty", id, true);
    await saveContent("faculty", id, published!.version, {
      ...input,
      title: "Edited mentor",
    });
    expect(await getContent("faculty", input.slug)).toBeNull();
    await expect(
      publishContent("faculty", id, published!.version, "PUBLISHED"),
    ).rejects.toThrow("changed");
    const latest = await getContent("faculty", id, true);
    await deleteContent("faculty", id, latest!.version);
    expect(await getContent("faculty", id, true)).toBeNull();
  });
  it("enforces blog slug uniqueness and category relationships", async () => {
    const category = await saveContent("blog-categories", null, 0, base);
    ids.push({ kind: "blog-categories", id: category });
    const input = {
      ...base,
      categoryId: category,
      details: { author: "Sample author" },
    };
    const id = await saveContent("blog", null, 0, input);
    ids.push({ kind: "blog", id });
    await expect(saveContent("blog", null, 0, input)).rejects.toThrow("slug");
    await publishContent("blog", id, 1, "PUBLISHED");
    expect((await listContent("blog", { category })).total).toBe(1);
    await expect(deleteContent("blog-categories", category, 1)).rejects.toThrow(
      "category",
    );
  });
  it("stores event instants in UTC and validates ranges", async () => {
    const id = await saveContent("events", null, 0, {
      ...base,
      details: {
        startsAt: "2030-01-01T10:00:00+05:30",
        endsAt: "2030-01-01T11:00:00+05:30",
        location: "Classroom",
      },
    });
    ids.push({ kind: "events", id });
    expect(
      (
        await db.event.findUniqueOrThrow({ where: { id } })
      ).startsAt.toISOString(),
    ).toBe("2030-01-01T04:30:00.000Z");
    await publishContent("events", id, 1, "PUBLISHED");
    expect(await getContent("events", base.slug)).not.toBeNull();
  });
  it("requires admin approval and resets testimonials to draft on edits", async () => {
    access.staff = { active: true, role: "EDITOR" };
    const id = await saveContent("testimonials", null, 0, {
      ...base,
      details: { personRole: "Learner" },
    });
    ids.push({ kind: "testimonials", id });
    expect(await getContent("testimonials", base.slug)).toBeNull();
    await expect(
      publishContent("testimonials", id, 1, "PUBLISHED"),
    ).rejects.toThrow("permission");
    access.staff = { active: true, role: "ADMIN" };
    await publishContent("testimonials", id, 1, "PUBLISHED");
    expect(await getContent("testimonials", base.slug)).not.toBeNull();
    access.staff = { active: true, role: "EDITOR" };
    await saveContent("testimonials", id, 2, {
      ...base,
      body: "Edited quote",
      details: { personRole: "Learner" },
    });
    expect(await getContent("testimonials", base.slug)).toBeNull();
    access.staff = { active: true, role: "ADMIN" };
  });
  it("orders and paginates FAQs and edits About", async () => {
    for (let index = 0; index < 9; index++) {
      const id = await saveContent("faqs", null, 0, {
        ...base,
        slug: prefix + "-" + index,
        sortOrder: 9 - index,
      });
      ids.push({ kind: "faqs", id });
      await publishContent("faqs", id, 1, "PUBLISHED");
    }
    const list = await listContent("faqs", { search: "CMS test" });
    expect(list.items).toHaveLength(8);
    expect(list.items[0].sortOrder).toBe(1);
    expect(
      (await listContent("faqs", { search: "CMS test", page: 2 })).items,
    ).toHaveLength(1);
    const about = await saveContent("pages", null, 0, {
      ...base,
      slug: "about",
      details: {
        mission: "Mission",
        vision: "Vision",
        leadership: "Leadership",
      },
    });
    ids.push({ kind: "pages", id: about });
    await publishContent("pages", about, 1, "PUBLISHED");
    expect((await getContent("pages", "about"))?.details.mission).toBe(
      "Mission",
    );
  });
  it("prevents unauthorized operations and unpublished image access", async () => {
    const png = await sharp({
      create: { width: 4, height: 4, channels: 3, background: "#fff" },
    })
      .png()
      .toBuffer();
    const image = await uploadImage(
      new File([new Uint8Array(png)], "sample.png", { type: "image/png" }),
      "Test image",
    );
    const id = await saveContent("faculty", null, 0, {
      ...base,
      slug: prefix + "-image",
      imageId: image.id,
      details: { position: "Mentor" },
    });
    ids.push({ kind: "faculty", id });
    access.staff = null;
    expect(await readImage(image.id)).toBeNull();
    await expect(saveContent("faqs", null, 0, base)).rejects.toThrow("sign-in");
    await expect(getContent("faculty", id, true)).rejects.toThrow("sign-in");
    await expect(deleteContent("faculty", id, 1)).rejects.toThrow("sign-in");
    access.staff = { active: false, role: "ADMIN" };
    await expect(publishContent("faculty", id, 1, "PUBLISHED")).rejects.toThrow(
      "permission",
    );
    access.staff = { active: true, role: "ADMIN" };
    await publishContent("faculty", id, 1, "PUBLISHED");
    access.staff = null;
    expect((await readImage(image.id))?.mimeType).toBe("image/webp");
    access.staff = { active: true, role: "ADMIN" };
    await publishContent("faculty", id, 2, "DRAFT");
    access.staff = null;
    expect(await readImage(image.id)).toBeNull();
    access.staff = { active: true, role: "ADMIN" };
  });
});

it("rejects malformed mutation identities before touching any row", async () => {
  await expect(
    deleteContent("faqs", undefined as unknown as string, 1),
  ).rejects.toThrow();
  await expect(
    publishContent("faqs", "not-a-record", 0, "PUBLISHED"),
  ).rejects.toThrow();
});
