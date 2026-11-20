import { expect, test, type BrowserContext } from "@playwright/test";
import { encode } from "next-auth/jwt";
import sharp from "sharp";

async function staffSession(context: BrowserContext) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing test secret.");
  const token = await encode({
    token: { email: "admin@example.test", sub: "test-admin" },
    secret,
    salt: "authjs.session-token",
    maxAge: 3600,
  });
  await context.addCookies([
    {
      name: "authjs.session-token",
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
test.describe("Institutional CMS", () => {
  test.skip(
    process.env.INSTITUTE_TEST_CMS !== "1",
    "Requires isolated CMS fixtures.",
  );
  test("published institutional pages, FAQ keyboard interaction and search", async ({
    page,
    request,
  }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "About the institute", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mission", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Testimonials", exact: true }),
    ).toBeVisible();
    await page.goto("/faculty");
    await page
      .getByRole("link", { name: "Sample Faculty Profile", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Sample Faculty Profile",
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/blog?search=Planning");
    await page
      .getByRole("link", { name: "Planning a sample store", exact: true })
      .click();
    await expect(page).toHaveTitle(/Planning a sample store/);
    await page.goto("/events/sample-workshop");
    await expect(page.locator("time").first()).toContainText("10 June 2030");
    await page.goto("/faqs");
    const question = page.getByRole("button", {
      name: "Sample question 1",
      exact: true,
    });
    await question.press("Enter");
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("region", { name: "Sample question 1", exact: true }),
    ).toContainText("Sample answer for development.");
    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await page.goto("/blog?search=no-such-post-xyz");
    await expect(page.getByRole("status")).toContainText(
      "No published content",
    );
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).toBe(false);
    expect((await request.get("/api/content/blog?page=0")).status()).toBe(400);
    await page.goto("/admin/content");
    await expect(page).toHaveURL(/admin\/login/);
  });

  test("faculty editing, Markdown safety, image upload and publication", async ({
    page,
    context,
    request,
  }) => {
    await staffSession(context);
    const slug = "faculty-" + crypto.randomUUID();
    await page.goto("/admin/content/faculty/new");
    await page.locator("summary").filter({ hasText: "Upload image" }).click();
    const image = await sharp({
      create: { width: 8, height: 8, channels: 3, background: "#427e61" },
    })
      .png()
      .toBuffer();
    await page.getByLabel("Image file", { exact: true }).setInputFiles({
      name: "profile.png",
      mimeType: "image/png",
      buffer: image,
    });
    await page
      .getByLabel("Alternative text", { exact: true })
      .fill("Synthetic faculty portrait");
    await page
      .getByRole("button", { name: "Upload image", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Image uploaded and selected.",
    );
    await expect(
      page.getByRole("combobox", { name: "Image", exact: true }),
    ).not.toHaveValue("");
    const imageId = await page
      .getByRole("combobox", { name: "Image", exact: true })
      .inputValue();
    expect((await request.get("/api/media/" + imageId)).status()).toBe(404);
    await page
      .getByLabel("Name", { exact: true })
      .fill("Browser faculty profile");
    await page.getByLabel("Slug", { exact: true }).fill(slug);
    await page
      .getByLabel("Content", { exact: true })
      .fill("**Mentor biography**\n\n<script>window.cmsInjected=true</script>");
    await page.getByLabel("Position", { exact: true }).fill("Ecommerce mentor");
    await page
      .getByRole("button", { name: "Save content", exact: true })
      .click();
    await expect(
      page.getByText("Content saved as draft.", { exact: true }),
    ).toBeVisible();
    const editURL = page.url().split("?")[0];
    expect((await request.get("/api/content/faculty/" + slug)).status()).toBe(
      404,
    );
    await page
      .getByRole("link", { name: "Preview content", exact: true })
      .click();
    await expect(
      page.getByRole("img", { name: "Synthetic faculty portrait" }),
    ).toBeVisible();
    expect(await page.evaluate(() => "cmsInjected" in window)).toBe(false);
    await expect(page.locator("strong")).toContainText("Mentor biography");
    await page.goto(editURL);
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(
      page.getByText("Content published.", { exact: true }),
    ).toBeVisible();
    expect((await request.get("/api/media/" + imageId)).status()).toBe(200);
    await page.goto("/faculty/" + slug);
    await expect(
      page.getByRole("heading", {
        name: "Browser faculty profile",
        exact: true,
      }),
    ).toBeVisible();
    await page.goto(editURL);
    await page
      .getByLabel("Name", { exact: true })
      .fill("Edited browser faculty");
    await page
      .getByRole("button", { name: "Save content", exact: true })
      .click();
    await expect(
      page.getByText("Content saved as draft.", { exact: true }),
    ).toBeVisible();
    expect((await request.get("/api/media/" + imageId)).status()).toBe(404);
    await page.locator("summary").filter({ hasText: "Delete content" }).click();
    await page.getByLabel("Type DELETE to confirm").fill("DELETE");
    await page
      .getByRole("button", { name: "Permanently delete content", exact: true })
      .click();
    await expect(page).toHaveURL(/faculty\?deleted=1/);
  });

  test("testimonial approval and unpublication", async ({
    page,
    context,
    request,
  }) => {
    await staffSession(context);
    const slug = "testimonial-" + crypto.randomUUID();
    await page.goto("/admin/content/testimonials/new");
    await page
      .getByLabel("Name", { exact: true })
      .fill("Synthetic browser learner");
    await page.getByLabel("Slug", { exact: true }).fill(slug);
    await page
      .getByLabel("Testimonial", { exact: true })
      .fill("Synthetic review for workflow testing.");
    await page
      .getByRole("button", { name: "Save content", exact: true })
      .click();
    await expect(
      page.getByText("Content saved as draft.", { exact: true }),
    ).toBeVisible();
    expect(
      (await request.get("/api/content/testimonials/" + slug)).status(),
    ).toBe(404);
    await page
      .getByRole("button", { name: "Approve testimonial", exact: true })
      .click();
    await expect(
      page.getByText("Testimonial approved.", { exact: true }),
    ).toBeVisible();
    expect(
      (await request.get("/api/content/testimonials/" + slug)).status(),
    ).toBe(200);
    await page.getByRole("button", { name: "Unpublish", exact: true }).click();
    await expect(
      page.getByText("Content unpublished.", { exact: true }),
    ).toBeVisible();
    expect(
      (await request.get("/api/content/testimonials/" + slug)).status(),
    ).toBe(404);
  });
});
