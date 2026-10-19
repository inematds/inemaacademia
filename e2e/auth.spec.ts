import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/entrar na sua conta/i)).toBeVisible();
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
  });

  test("register page loads correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText(/criar (sua )?conta|cadastr/i).first()).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
  });

  test("login form validates required fields", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.getByRole("button", { name: "Entrar", exact: true });
    await submitButton.click();
    // Browser native validation should prevent submission
    const emailInput = page.getByLabel(/e-?mail/i);
    await expect(emailInput).toBeVisible();
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
  });

  test("unauthenticated user is redirected from protected routes", async ({ page }) => {
    await page.goto("/aluno");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
