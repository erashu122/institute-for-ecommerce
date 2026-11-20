import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { parseContent, contentQuery } from "../../src/features/content/schema";
import {
  normalizeImage,
  maxImageBytes,
} from "../../src/features/media/validation";

const base = {
  slug: "sample-entry",
  title: "Sample",
  body: "Content",
  details: {},
};
describe("CMS validation", () => {
  it("requires domain fields", () =>
    expect(() => parseContent("faculty", base)).toThrow());
  it("requires the fixed About slug and institutional sections", () => {
    expect(() =>
      parseContent("pages", {
        ...base,
        slug: "about",
        details: {
          mission: "Mission",
          vision: "Vision",
          leadership: "Leadership",
        },
      }),
    ).not.toThrow();
    expect(() => parseContent("pages", base)).toThrow();
  });
  it("validates event offsets and ordering", () => {
    expect(() =>
      parseContent("events", {
        ...base,
        details: {
          startsAt: "2030-01-01T10:00:00+05:30",
          endsAt: "2030-01-01T11:00:00+05:30",
          location: "Classroom",
        },
      }),
    ).not.toThrow();
    expect(() =>
      parseContent("events", {
        ...base,
        details: { startsAt: "2030-01-01T10:00:00", location: "Classroom" },
      }),
    ).toThrow();
    expect(() =>
      parseContent("events", {
        ...base,
        details: {
          startsAt: "2030-01-02T10:00:00Z",
          endsAt: "2030-01-01T10:00:00Z",
          location: "Classroom",
        },
      }),
    ).toThrow();
  });
  it("bounds FAQ ordering and pagination", () => {
    expect(() => parseContent("faqs", { ...base, sortOrder: -1 })).toThrow();
    expect(contentQuery.safeParse({ page: 0 }).success).toBe(false);
  });
});
describe("Image validation", () => {
  it("decodes and re-encodes a valid image", async () => {
    const png = await sharp({
      create: { width: 4, height: 4, channels: 3, background: "#fff" },
    })
      .png()
      .toBuffer();
    const result = await normalizeImage(
      new File([new Uint8Array(png)], "sample.png", { type: "image/png" }),
      "Sample image",
    );
    expect(result.width).toBe(4);
    expect((await sharp(result.buffer).metadata()).format).toBe("webp");
  });
  it("rejects oversized, unsupported and forged files", async () => {
    await expect(
      normalizeImage(
        new File([new Uint8Array(maxImageBytes + 1)], "large.png", {
          type: "image/png",
        }),
        "Large",
      ),
    ).rejects.toThrow();
    await expect(
      normalizeImage(
        new File(["<svg/>"], "unsafe.svg", { type: "image/svg+xml" }),
        "Unsafe",
      ),
    ).rejects.toThrow();
    await expect(
      normalizeImage(
        new File(["not a png"], "fake.png", { type: "image/png" }),
        "Fake",
      ),
    ).rejects.toThrow();
    const png = await sharp({
      create: { width: 4, height: 4, channels: 3, background: "#fff" },
    })
      .png()
      .toBuffer();
    await expect(
      normalizeImage(
        new File([new Uint8Array(png)], "fake.jpg", { type: "image/jpeg" }),
        "Mismatch",
      ),
    ).rejects.toThrow();
  });
});
