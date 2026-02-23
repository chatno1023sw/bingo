import { expect, test } from "@playwright/test";
import { attachCheckpointScreenshot, seedGameViewSession } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seedGameViewSession(page);
});

test("T-07 smoke: draw flow updates remaining count and history", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByText("残り 74 / 75")).toBeVisible();
  await expect(page.getByRole("button", { name: "抽選を開始！" })).toBeVisible();
  await attachCheckpointScreenshot(page, testInfo, "game-before-draw");

  await page.getByRole("button", { name: "抽選を開始！" }).click();

  await expect(page.getByText("残り 73 / 75")).toBeVisible({ timeout: 10_000 });
  await attachCheckpointScreenshot(page, testInfo, "game-after-draw");
});
