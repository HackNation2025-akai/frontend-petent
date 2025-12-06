import { test, expect } from "@playwright/test";

test("form page renders and shows header", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /dane podstawowe/i })).toBeVisible();
});

