import type { Page, TestInfo } from "@playwright/test";

const now = "2026-02-23T00:00:00.000Z";

export const seedMutedAudioPreferences = async (page: Page): Promise<void> => {
  await page.addInitScript(
    ({ timestamp }) => {
      const disabledBgm = {
        enabled: true,
        volume: 0,
        updatedAt: timestamp,
      };
      const mutedSoundDetail = {
        voiceVolume: 0,
        drumrollVolumeScale: 0,
        cymbalVolumeScale: 0,
      };
      window.sessionStorage.setItem("bingo.v1.audioNoticeAck", "1");
      window.localStorage.setItem("bingo.v1.bgm", JSON.stringify(disabledBgm));
      window.localStorage.setItem("bingo.v1.bgm.start", JSON.stringify(disabledBgm));
      window.localStorage.setItem("bingo.v1.se", JSON.stringify(disabledBgm));
      window.localStorage.setItem("bingo.v1.soundDetail", JSON.stringify(mutedSoundDetail));
    },
    { timestamp: now },
  );
};

export const seedGameViewSession = async (page: Page): Promise<void> => {
  await page.addInitScript(
    ({ timestamp }) => {
      window.sessionStorage.setItem("bingo.v1.audioNoticeAck", "1");
      window.sessionStorage.setItem("bingo.v1.activeView", "game");
      window.localStorage.setItem(
        "bingo.v1.gameState",
        JSON.stringify({
          currentNumber: 1,
          drawHistory: [{ number: 1, sequence: 1, drawnAt: timestamp }],
          isDrawing: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      );
      window.localStorage.setItem("bingo.v1.prizes", JSON.stringify([]));
      window.localStorage.setItem(
        "bingo.v1.bgm",
        JSON.stringify({ enabled: true, volume: 0, updatedAt: timestamp }),
      );
      window.localStorage.setItem(
        "bingo.v1.se",
        JSON.stringify({ enabled: true, volume: 0, updatedAt: timestamp }),
      );
      window.localStorage.setItem(
        "bingo.v1.soundDetail",
        JSON.stringify({
          voiceVolume: 0,
          drumrollVolumeScale: 0,
          cymbalVolumeScale: 0,
        }),
      );
    },
    { timestamp: now },
  );
};

export const seedGameViewWithPrizesSession = async (
  page: Page,
  options: { selectedPrizeIds?: string[] } = {},
): Promise<void> => {
  const selectedPrizeIds = options.selectedPrizeIds ?? [];
  await page.addInitScript(
    ({ timestamp, selectedIds }) => {
      const prizes = Array.from({ length: 5 }, (_, index) => ({
        id: `p-${index + 1}`,
        order: index,
        prizeName: `${index + 1}等`,
        itemName: `景品${index + 1}`,
        imagePath: null,
        selected: selectedIds.includes(`p-${index + 1}`),
        memo: null,
      }));

      window.sessionStorage.setItem("bingo.v1.audioNoticeAck", "1");
      window.sessionStorage.setItem("bingo.v1.activeView", "game");
      window.localStorage.setItem(
        "bingo.v1.gameState",
        JSON.stringify({
          currentNumber: 1,
          drawHistory: [{ number: 1, sequence: 1, drawnAt: timestamp }],
          isDrawing: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      );
      window.localStorage.setItem("bingo.v1.prizes", JSON.stringify(prizes));
      window.localStorage.setItem(
        "bingo.v1.bgm",
        JSON.stringify({ enabled: true, volume: 0, updatedAt: timestamp }),
      );
      window.localStorage.setItem(
        "bingo.v1.se",
        JSON.stringify({ enabled: true, volume: 0, updatedAt: timestamp }),
      );
      window.localStorage.setItem(
        "bingo.v1.soundDetail",
        JSON.stringify({
          voiceVolume: 0,
          drumrollVolumeScale: 0,
          cymbalVolumeScale: 0,
        }),
      );
    },
    { timestamp: now, selectedIds: selectedPrizeIds },
  );
};

export const seedStoredGameStateForStartScreen = async (page: Page): Promise<void> => {
  await page.addInitScript(({ timestamp }) => {
    window.sessionStorage.setItem("bingo.v1.audioNoticeAck", "1");
    window.localStorage.setItem(
      "bingo.v1.gameState",
      JSON.stringify({
        currentNumber: 10,
        drawHistory: [{ number: 10, sequence: 1, drawnAt: timestamp }],
        isDrawing: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    );
    window.localStorage.setItem(
      "bingo.v1.bgm",
      JSON.stringify({ enabled: true, volume: 0, updatedAt: timestamp }),
    );
    window.localStorage.setItem(
      "bingo.v1.se",
      JSON.stringify({ enabled: true, volume: 0, updatedAt: timestamp }),
    );
    window.localStorage.setItem(
      "bingo.v1.soundDetail",
      JSON.stringify({
        voiceVolume: 0,
        drumrollVolumeScale: 0,
        cymbalVolumeScale: 0,
      }),
    );
  }, { timestamp: now });
};

export const dismissAudioNoticeIfVisible = async (page: Page): Promise<void> => {
  const dialog = page.getByRole("dialog", { name: "このゲームは音が流れるよ！" });
  if (await dialog.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "音なし" }).click();
  }
};

export const attachCheckpointScreenshot = async (
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<void> => {
  const body = await page.screenshot({ fullPage: true });
  await testInfo.attach(`${name}.png`, {
    body,
    contentType: "image/png",
  });
};
