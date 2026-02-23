import { expect, test } from "@playwright/test";
import { attachCheckpointScreenshot, seedMutedAudioPreferences } from "./helpers";

const csvFixture = [
  "id,order,prizeName,itemName,imagePath,selected,memo",
  "p-1,0,一等,Switch,,false,",
  "p-2,1,二等,ギフトカード,,false,",
].join("\n");

test.beforeEach(async ({ page }) => {
  await seedMutedAudioPreferences(page);
});

test("T-06 smoke: CSV import reflects prize list in setting UI", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "設定" }).click();
  await expect(page.getByRole("button", { name: "CSV追加" })).toBeVisible();
  await attachCheckpointScreenshot(page, testInfo, "setting-before-csv-import");

  await page.locator("#csv-import").setInputFiles({
    name: "prizes-smoke.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csvFixture, "utf-8"),
  });

  await expect(page.locator('input[value="一等"]').first()).toBeVisible();
  await expect(page.locator('input[value="Switch"]').first()).toBeVisible();
  await attachCheckpointScreenshot(page, testInfo, "setting-after-csv-import");
});
