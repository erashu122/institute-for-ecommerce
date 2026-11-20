import { expect, test } from "@playwright/test";

test("renders the public shell and lets visitors navigate by keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Institute for Ecommerce/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn how ecommerce works");
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("link", { name: "About the institute", exact: true }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole("region", { name: "About the institute" })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

