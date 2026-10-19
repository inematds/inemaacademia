import { test, expect, devices } from "@playwright/test";

// defaultBrowserType nao pode ser usado dentro de describe (forca novo worker)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { defaultBrowserType, ...pixel5 } = devices["Pixel 5"];

test.describe("Mobile Responsiveness", () => {
  test.use(pixel5);

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
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
  });
});
