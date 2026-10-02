import { test, expect } from "@playwright/test";

test("content list renders and baseline vote UI responds", async ({ page }) => {
  await page.goto("/contents");
  await expect(page.getByRole("heading", { name: "오늘의 이미지" })).toBeVisible();
  await page.getByRole("button", { name: "좋아요 투표" }).first().click();
  await expect(page.getByText("투표 완료").first()).toBeVisible();
});
