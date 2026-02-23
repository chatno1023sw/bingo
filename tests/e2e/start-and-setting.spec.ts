import { expect, test } from "@playwright/test";
import {
  attachCheckpointScreenshot,
  dismissAudioNoticeIfVisible,
  seedMutedAudioPreferences,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await seedMutedAudioPreferences(page);
});

test("T-05/T-06 smoke: start screen to setting screen", async ({ page }, testInfo) => {
  await page.goto("/");
  await dismissAudioNoticeIfVisible(page);

  await expect(page.getByRole("heading", { name: "BINGOゲーム" })).toBeVisible();
  await attachCheckpointScreenshot(page, testInfo, "start-screen");
  await page.getByRole("button", { name: "設定" }).click();

  await expect(page.getByRole("button", { name: "CSV追加" })).toBeVisible();
  await expect(page.getByRole("button", { name: "戻る" })).toBeVisible();
  await attachCheckpointScreenshot(page, testInfo, "setting-screen");
});
