import { expect, test } from "@playwright/test";
import {
  attachCheckpointScreenshot,
  dismissAudioNoticeIfVisible,
  seedGameViewSession,
  seedGameViewWithPrizesSession,
  seedMutedAudioPreferences,
  seedStoredGameStateForStartScreen,
} from "./helpers";

const csvFixture = [
  "id,order,prizeName,itemName,imagePath,selected,memo",
  "p-1,0,一等,Switch,,false,",
  "p-2,1,二等,ギフトカード,,false,",
].join("\n");

test.describe("all screens walkthrough screenshots", () => {
  test("Start screens and dialogs", async ({ page }, testInfo) => {
    await page.goto("/");

    await expect(page.getByRole("dialog", { name: "このゲームは音が流れるよ！" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "start-audio-notice-dialog");
    await page.getByRole("button", { name: "音なし" }).click();

    await expect(page.getByRole("heading", { name: "BINGOゲーム" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "start-main-screen");
  });

  test("Start resume/start-over dialog", async ({ page }, testInfo) => {
    await seedStoredGameStateForStartScreen(page);
    await page.goto("/");
    await dismissAudioNoticeIfVisible(page);

    await expect(page.getByRole("button", { name: "続きから" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "start-with-resume");

    await page.getByRole("button", { name: "はじめから" }).click();
    await expect(page.getByRole("dialog", { name: "最初から始める？" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "start-over-dialog");
    await page.getByRole("button", { name: "キャンセル" }).click();
  });

  test("Setting screens (empty and after CSV import)", async ({ page }, testInfo) => {
    await seedMutedAudioPreferences(page);
    await page.goto("/");
    await page.getByRole("button", { name: "設定" }).click();

    await expect(page.getByRole("button", { name: "CSV追加" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "setting-empty-screen");

    await page.locator("#csv-import").setInputFiles({
      name: "walkthrough-prizes.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvFixture, "utf-8"),
    });

    await expect(page.locator('input[value="一等"]').first()).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "setting-after-csv-import");
  });

  test("Game main and reset dialog", async ({ page }, testInfo) => {
    await seedGameViewSession(page);
    await page.goto("/");

    await expect(page.getByRole("button", { name: "抽選を開始！" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "game-main-screen");

    await page.getByRole("button", { name: "クリア" }).click();
    await expect(page.getByRole("dialog", { name: "抽選履歴を削除する？" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "game-reset-dialog");
    await page.getByRole("button", { name: "キャンセル" }).click();
  });

  test("Game prize roulette and prize result dialogs", async ({ page }, testInfo) => {
    await seedGameViewWithPrizesSession(page, { selectedPrizeIds: ["p-1", "p-2", "p-3", "p-4"] });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "景品ルーレット" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "game-with-prizes");

    await page.getByRole("button", { name: "景品ルーレット" }).click();
    await expect(page.getByRole("dialog", { name: "景品ルーレット" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "prize-roulette-dialog");

    // 無音設定時は fallback timeout で結果画面へ遷移する
    await expect(page.getByRole("dialog", { name: "景品ルーレット" })).not.toBeVisible({
      timeout: 12_000,
    });
    await expect(page.getByText("5等")).toBeVisible();
    await expect(page.locator('[role="dialog"] p').filter({ hasText: "景品5" })).toBeVisible();
    await attachCheckpointScreenshot(page, testInfo, "prize-result-dialog");
  });
});
