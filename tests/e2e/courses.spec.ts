import { expect, test } from "@playwright/test";
import { encode } from "next-auth/jwt";

test.describe("Course workflows", () => {
  test.skip(process.env.INSTITUTE_TEST_DATABASE !== "1", "Requires the isolated course test environment.");

  test("catalog search, filters, pagination and private drafts", async ({ page, request }) => {
    await page.goto("/courses");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find your next course");
    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await page.getByLabel("Search courses").fill("Ecommerce Foundations");
    await page.getByRole("button", { name: "Find courses" }).click();
    await expect(page.getByRole("heading", { name: "Ecommerce Foundations" })).toBeVisible();
    await page.getByRole("link", { name: "View course — Ecommerce Foundations" }).click();
    await expect(page).toHaveTitle(/Ecommerce Foundations/);
    await expect(page.getByRole("heading", { name: "Curriculum", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Apply Now" })).toBeVisible();
    await page.goto("/courses?category=digital-marketing&mode=CLASSROOM");
    await expect(page.getByRole("heading", { name: "No courses found" })).toBeVisible();
    await page.goto("/courses?search=zzzzzzzz");
    await expect(page.getByRole("heading", { name: "No courses found" })).toBeVisible();
    const draft = await request.get("/api/courses/campaign-planning");
    expect(draft.status()).toBe(404);
    const invalid = await request.get("/api/courses?page=0");
    expect(invalid.status()).toBe(400);
    await page.goto("/admin/courses");
    await expect(page).toHaveURL(/admin\/login/);
  });

  test("staff create, edit, preview, publish, unpublish and delete", async ({ page, context, request }) => {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("Missing test secret.");
    const token = await encode({ token: { email: "admin@example.test", name: "Test Admin", sub: "test-admin" }, secret, salt: "authjs.session-token", maxAge: 3600 });
    await context.addCookies([{ name: "authjs.session-token", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
    const slug = "browser-" + crypto.randomUUID();
    await page.goto("/admin/courses/new");
    await page.getByLabel("Title", { exact: true }).fill("Browser workflow");
    await page.getByLabel("Slug", { exact: true }).fill(slug);
    await page.getByLabel("Duration", { exact: true }).fill("5 weeks");
    await page.getByLabel("Fee in INR").fill("1500.00");
    await page.getByRole("combobox", { name: "Category", exact: true }).selectOption({ label: "Online retail" });
    await page.getByLabel("Summary", { exact: true }).fill("Browser test summary");
    await page.getByLabel("Description", { exact: true }).fill("Browser test description");
    await page.getByLabel("Eligibility", { exact: true }).fill("Computer basics");
    await page.getByLabel("Curriculum (one item per line)").fill("Unit one\nUnit two");
    await page.getByLabel("Learning outcomes (one item per line)").fill("Build a store");
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByText("Course saved.", { exact: true })).toBeVisible();
    expect((await request.get("/api/courses/" + slug)).status()).toBe(404);
    const editURL = page.url().split("?")[0];
    await page.getByLabel("Title", { exact: true }).fill("Updated browser course");
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Updated browser course");
    await page.getByRole("link", { name: "Preview course" }).click();
    await expect(page.getByRole("heading", { name: "Updated browser course" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
    await page.goto(editURL);
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Course published.", { exact: true })).toBeVisible();
    expect((await request.get("/api/courses/" + slug)).status()).toBe(200);
    await page.getByRole("button", { name: "Unpublish", exact: true }).click();
    await expect(page.getByText("Course unpublished.", { exact: true })).toBeVisible();
    expect((await request.get("/api/courses/" + slug)).status()).toBe(404);
    await page.getByText("Delete course", { exact: true }).click();
    await page.getByLabel("Confirmation").fill("DELETE");
    await page.getByRole("button", { name: "Permanently delete course" }).click();
    await expect(page).toHaveURL(/admin\/courses\?deleted=1/);
  });
});


