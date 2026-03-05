import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load and show hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/INEMA Academia/i);
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /entrar/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /cadastr/i })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /cadastr/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("should navigate to explore page", async ({ page }) => {
    await page.goto("/");
    const exploreLink = page.getByRole("link", { name: /explorar/i });
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await expect(page).toHaveURL(/\/explorar/);
    }
  });
});
