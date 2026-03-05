import { test, expect, devices } from "@playwright/test";

test.describe("Mobile Responsiveness", () => {
  test.use(devices["Pixel 5"]);

  test("landing page renders on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    // No horizontal overflow
    const body = page.locator("body");
    const box = await body.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(393 + 1); // Pixel 5 width
  });

  test("login page renders on mobile", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
  });
});
