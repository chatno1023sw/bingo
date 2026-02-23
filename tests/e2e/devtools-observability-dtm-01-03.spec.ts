import { expect, test, type Page, type TestInfo } from "@playwright/test";
import {
  attachCheckpointScreenshot,
  dismissAudioNoticeIfVisible,
  seedGameViewSession,
  seedMutedAudioPreferences,
} from "./helpers";

type RequestLog = {
  url: string;
  method: string;
  resourceType: string;
  status: number | null;
  failed: boolean;
};

type ConsoleLog = {
  type: string;
  text: string;
};

const attachObservability = async (
  page: Page,
  testInfo: TestInfo,
  label: string,
) => {
  const consoleLogs: ConsoleLog[] = [];
  const requestLogs: RequestLog[] = [];
  const seen = new Map<string, RequestLog>();

  page.on("console", (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  page.on("requestfinished", async (request) => {
    const response = await request.response();
    const key = `${request.method()} ${request.url()}`;
    seen.set(key, {
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      status: response?.status() ?? null,
      failed: false,
    });
  });

  page.on("requestfailed", (request) => {
    const key = `${request.method()} ${request.url()}`;
    seen.set(key, {
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      status: null,
      failed: true,
    });
  });

  return async () => {
    requestLogs.push(...seen.values());
    await testInfo.attach(`${label}-console.json`, {
      body: Buffer.from(JSON.stringify(consoleLogs, null, 2)),
      contentType: "application/json",
    });
    await testInfo.attach(`${label}-network.json`, {
      body: Buffer.from(JSON.stringify(requestLogs, null, 2)),
      contentType: "application/json",
    });
    return { consoleLogs, requestLogs };
  };
};

test("DTM-01 equivalent: Start→Setting console観測", async ({ page }, testInfo) => {
  await seedMutedAudioPreferences(page);
  const finalize = await attachObservability(page, testInfo, "dtm-01");

  await page.goto("/");
  await dismissAudioNoticeIfVisible(page);
  await page.getByRole("button", { name: "設定" }).click();
  await expect(page.getByRole("button", { name: "CSV追加" })).toBeVisible();
  await attachCheckpointScreenshot(page, testInfo, "dtm-01-setting");

  const { consoleLogs, requestLogs } = await finalize();
  const severeConsole = consoleLogs.filter((log) => ["error"].includes(log.type));
  const failedRequests = requestLogs.filter((req) => req.failed);

  expect(severeConsole).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test("DTM-02 equivalent: CSV取込時のnetwork観測", async ({ page }, testInfo) => {
  await seedMutedAudioPreferences(page);
  const finalize = await attachObservability(page, testInfo, "dtm-02");

  await page.goto("/");
  await page.getByRole("button", { name: "設定" }).click();
  await expect(page.getByRole("button", { name: "CSV追加" })).toBeVisible();

  const csv = [
    "id,order,prizeName,itemName,imagePath,selected,memo",
    "p-1,0,一等,Switch,,false,",
    "p-2,1,二等,ギフトカード,,false,",
  ].join("\n");

  await page.locator("#csv-import").setInputFiles({
    name: "dtm-02.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf-8"),
  });

  await expect(page.locator('input[value="一等"]').first()).toBeVisible();
  await attachCheckpointScreenshot(page, testInfo, "dtm-02-after-import");

  const { consoleLogs, requestLogs } = await finalize();
  const severeConsole = consoleLogs.filter((log) => ["error"].includes(log.type));
  const failedRequests = requestLogs.filter((req) => req.failed);
  const appApiLikeRequests = requestLogs.filter((req) => {
    const url = new URL(req.url);
    const path = url.pathname;
    return path.startsWith("/api/") || path === "/session" || path.startsWith("/session/") || path === "/prizes" || path.startsWith("/prizes/");
  });

  expect(severeConsole).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(appApiLikeRequests).toEqual([]);
});

test("DTM-03 equivalent: 抽選導線のconsole/network観測", async ({ page }, testInfo) => {
  await seedGameViewSession(page);
  const finalize = await attachObservability(page, testInfo, "dtm-03");

  await page.goto("/");
  await expect(page.getByRole("button", { name: "抽選を開始！" })).toBeVisible();
  await page.getByRole("button", { name: "抽選を開始！" }).click();
  await expect(page.getByText("残り 73 / 75")).toBeVisible({ timeout: 10_000 });
  await attachCheckpointScreenshot(page, testInfo, "dtm-03-after-draw");

  const { consoleLogs, requestLogs } = await finalize();
  const severeConsole = consoleLogs.filter((log) => ["error"].includes(log.type));
  const failedRequests = requestLogs.filter((req) => req.failed);

  expect(severeConsole).toEqual([]);
  expect(failedRequests).toEqual([]);
});
