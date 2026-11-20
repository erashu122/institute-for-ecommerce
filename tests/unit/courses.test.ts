import { describe, expect, it } from "vitest";
import { courseInput, courseQuery } from "../../src/features/courses/schema";
import { assertStaff } from "../../src/features/courses/permissions";

const valid = { title: "Retail", slug: "online-retail", summary: "Summary", description: "Description", categoryId: "retail", duration: "6 weeks", mode: "ONLINE", eligibility: "Computer skills", curriculum: ["Basics"], outcomes: ["Learn"], fee: "12000.50", image: "" };
describe("Course input", () => {
  it("accepts structured course data", () => expect(courseInput.parse(valid).fee).toBe("12000.50"));
  it.each([{ slug: "../admin" }, { fee: "-1" }, { fee: "Infinity" }, { curriculum: [] }, { image: "javascript:alert(1)" }, { title: " " }, { mode: "UNKNOWN" }])("rejects invalid input %j", change => expect(courseInput.safeParse({ ...valid, ...change }).success).toBe(false));
  it("rejects invalid filters", () => {
    expect(courseQuery.safeParse({ page: 0 }).success).toBe(false);
    expect(courseQuery.safeParse({ mode: "INVALID" }).success).toBe(false);
  });
});
describe("Staff permissions", () => {
  it("rejects anonymous access", () => expect(() => assertStaff(null)).toThrow("sign-in"));
  it("rejects disabled staff", () => expect(() => assertStaff({ active: false, role: "ADMIN" })).toThrow("permission"));
  it("rejects unknown roles", () => expect(() => assertStaff({ active: true, role: "STUDENT" })).toThrow("permission"));
  it("restricts publishing to admins", () => {
    expect(() => assertStaff({ active: true, role: "EDITOR" }, true)).toThrow("permission");
    expect(() => assertStaff({ active: true, role: "ADMIN" }, true)).not.toThrow();
  });
});
