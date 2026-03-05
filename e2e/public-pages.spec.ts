import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("about page loads", async ({ page }) => {
    await page.goto("/sobre");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("explore page loads", async ({ page }) => {
    await page.goto("/explorar");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("subjects page loads", async ({ page }) => {
    await page.goto("/materias");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    const response = await page.goto("/pagina-que-nao-existe");
    expect(response?.status()).toBe(404);
  });
});

test.describe("SEO", () => {
  test("sitemap is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("<urlset");
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("User-Agent");
  });

  test("manifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");
    expect(response?.status()).toBe(200);
  });
});
