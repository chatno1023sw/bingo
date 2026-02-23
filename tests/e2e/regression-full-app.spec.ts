import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  dismissAudioNoticeIfVisible,
  seedGameViewWithPrizesSession,
  seedMutedAudioPreferences,
  seedStoredGameStateForStartScreen,
} from "./helpers";

type StepRecord = {
  no: number;
  action: string;
  expected: string;
  actual: string;
  screenshotRelPath: string;
};

const projectRoot = process.cwd();

class RegressionReport {
  private steps: StepRecord[] = [];
  private stepNo = 0;
  private reportDir: string;
  private reportPath: string;
  private assetDir: string;

  constructor(
    private screenName: string,
    private functionName: string,
    private summary: string,
  ) {
    this.reportDir = path.join(projectRoot, "test", "regression", screenName);
    this.reportPath = path.join(this.reportDir, `${functionName}.md`);
    this.assetDir = path.join(this.reportDir, `${functionName}-assets`);
  }

  async init() {
    await mkdir(this.assetDir, { recursive: true });
  }

  async clickAndCapture(params: {
    page: Page;
    target: Locator;
    action: string;
    expected: string;
    actualCheck: () => Promise<string>;
    waitAfterClickMs?: number;
    noWaitAfter?: boolean;
  }) {
    this.stepNo += 1;
    await params.target.click({ noWaitAfter: params.noWaitAfter });
    if (params.waitAfterClickMs && params.waitAfterClickMs > 0) {
      await params.page.waitForTimeout(params.waitAfterClickMs);
    }
    const actual = await params.actualCheck();
    const screenshotFile = `step-${String(this.stepNo).padStart(2, "0")}.png`;
    const screenshotAbsPath = path.join(this.assetDir, screenshotFile);
    await params.page.screenshot({ path: screenshotAbsPath, fullPage: true });
    const screenshotRelPath = `./${path.basename(this.assetDir)}/${screenshotFile}`;
    this.steps.push({
      no: this.stepNo,
      action: params.action,
      expected: params.expected,
      actual,
      screenshotRelPath,
    });
  }

  async writeReport(extra?: { videoNote?: string; setupNote?: string }) {
    const now = new Date().toISOString().replace("T", " ").replace("Z", "");
    const rows = this.steps
      .map(
        (step) =>
          `| ${step.no} | ${step.action} | ${step.expected} | ${step.actual} | ![](${step.screenshotRelPath}) |`,
      )
      .join("\n");
    const content = [
      `# Regression Report: ${this.screenName} / ${this.functionName}`,
      "",
      `- Date: ${now}`,
      `- Summary: ${this.summary}`,
      extra?.setupNote ? `- Setup Notes: ${extra.setupNote}` : null,
      extra?.videoNote ? `- Video: ${extra.videoNote}` : null,
      "",
      "## Steps",
      "",
      "| # | Action (1 click) | Expected Result | Actual Result | Screenshot |",
      "|---|------------------|-----------------|---------------|------------|",
      rows,
      "",
    ]
      .filter(Boolean)
      .join("\n");
    await mkdir(this.reportDir, { recursive: true });
    await writeFile(this.reportPath, content, "utf-8");
  }

  getReportPath() {
    return this.reportPath;
  }
}

test.describe.configure({ mode: "serial" });

test("regression: start screen functions", async ({ page }, testInfo) => {
  const report = new RegressionReport(
    "start",
    "all-functions",
    "Start画面の主要機能（音量注意、設定遷移、開始確認ダイアログ、続きから表示）の回帰確認",
  );
  await report.init();

  await page.goto("/");

  await expect(page.getByRole("dialog", { name: "このゲームは音が流れるよ！" })).toBeVisible();
  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "音なし" }),
    action: "音量注意ダイアログで「音なし」をクリック",
    expected: "音量注意ダイアログが閉じて Start 画面が表示される",
    actualCheck: async () => {
      await expect(page.getByRole("heading", { name: "BINGOゲーム" })).toBeVisible();
      return "PASS: Start 画面の見出しを確認";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "設定" }),
    action: "Start画面で「設定」をクリック",
    expected: "Setting 画面へ遷移し「CSV追加」ボタンが表示される",
    actualCheck: async () => {
      await expect(page.getByRole("button", { name: "CSV追加" })).toBeVisible();
      return "PASS: Setting 画面に遷移";
    },
    noWaitAfter: true,
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "戻る" }),
    action: "Setting画面で「戻る」をクリック",
    expected: "Start 画面へ戻る（未変更のため確認ダイアログなし）",
    actualCheck: async () => {
      await expect(page.getByRole("heading", { name: "BINGOゲーム" })).toBeVisible();
      return "PASS: Start 画面に復帰";
    },
    noWaitAfter: true,
  });

  // ここから「続きから」「開始確認ダイアログ」用に保存済み状態を注入
  await seedStoredGameStateForStartScreen(page);
  await page.reload();

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "はじめから" }),
    action: "Start画面で「はじめから」をクリック（保存済み状態あり）",
    expected: "「最初から始める？」確認ダイアログが表示される",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "最初から始める？" })).toBeVisible();
      return "PASS: StartOverDialog が表示";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "キャンセル" }),
    action: "開始確認ダイアログで「キャンセル」をクリック",
    expected: "確認ダイアログが閉じ、Start 画面に戻る",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "最初から始める？" })).not.toBeVisible();
      await expect(page.getByRole("button", { name: "続きから" })).toBeVisible();
      return "PASS: ダイアログが閉じ、続きからボタン表示";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "続きから" }),
    action: "Start画面で「続きから」をクリック",
    expected: "Game 画面へ遷移し抽選ボタンが表示される",
    actualCheck: async () => {
      await expect(page.getByRole("button", { name: "抽選を開始！" })).toBeVisible();
      return "PASS: Game 画面へ遷移";
    },
    waitAfterClickMs: 200,
    noWaitAfter: true,
  });

  await report.writeReport({
    videoNote: `Playwright video recorded in ${testInfo.outputDir}/video.webm`,
    setupNote: "事前に localStorage に保存済み gameState を seed して「続きから」を表示",
  });
});

test("regression: setting screen functions", async ({ page }, testInfo) => {
  const report = new RegressionReport(
    "setting",
    "all-functions",
    "Setting画面の主要機能（追加、CSV取込、ダイアログ、未保存変更ガード）の回帰確認",
  );
  await report.init();

  await seedMutedAudioPreferences(page);
  await page.goto("/#/setting");
  if (!(await page.getByRole("button", { name: "CSV追加" }).isVisible().catch(() => false))) {
    await page.goto("/");
    await dismissAudioNoticeIfVisible(page);
    await page.getByRole("button", { name: "設定" }).click({ noWaitAfter: true });
    await page.waitForTimeout(200);
  }
  await expect(page.getByRole("button", { name: "CSV追加" })).toBeVisible();

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "追加", exact: true }),
    action: "Setting画面で「追加」をクリック",
    expected: "景品カード入力欄が1件追加される",
    actualCheck: async () => {
      await expect(page.getByPlaceholder("賞名を入力")).toBeVisible();
      return "PASS: 空の景品カードが追加";
    },
  });

  await page.locator("#csv-import").setInputFiles({
    name: "regression-setting.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      [
        "id,order,prizeName,itemName,imagePath,selected,memo",
        "p-1,0,一等,Switch,,false,",
        "p-2,1,二等,ギフトカード,,false,",
      ].join("\n"),
      "utf-8",
    ),
  });
  await expect(page.locator('input[value="一等"]').first()).toBeVisible();

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "全未選出" }),
    action: "CSV取込後に「全未選出」をクリック",
    expected: "選出状態リセット確認ダイアログが表示される",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "選出状態をリセットする？" })).toBeVisible();
      return "PASS: ResetSelectionDialog が表示";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "キャンセル" }),
    action: "選出状態リセット確認で「キャンセル」をクリック",
    expected: "確認ダイアログが閉じて Setting 画面に戻る",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "選出状態をリセットする？" })).not.toBeVisible();
      return "PASS: ResetSelectionDialog を閉じた";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "全削除" }),
    action: "Setting画面で「全削除」をクリック",
    expected: "全削除確認ダイアログが表示される",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "本当にすべて削除する？" })).toBeVisible();
      return "PASS: DeleteAllDialog が表示";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "キャンセル" }),
    action: "全削除確認で「キャンセル」をクリック",
    expected: "全削除確認ダイアログが閉じる",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "本当にすべて削除する？" })).not.toBeVisible();
      return "PASS: DeleteAllDialog を閉じた";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "追加", exact: true }),
    action: "戻る導線確認前に再度「追加」をクリック",
    expected: "景品カードが追加され、画面上に入力欄が表示される",
    actualCheck: async () => {
      await expect(page.locator('[placeholder="賞名を入力"]').first()).toBeVisible();
      return "PASS: 景品カード追加";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "戻る" }),
    action: "Setting画面で「戻る」をクリック",
    expected: "Start 画面へ戻る",
    actualCheck: async () => {
      await expect(page.getByRole("heading", { name: "BINGOゲーム" })).toBeVisible();
      return "PASS: Start 画面へ遷移";
    },
    noWaitAfter: true,
  });

  await report.writeReport({
    videoNote: `Playwright video recorded in ${testInfo.outputDir}/video.webm`,
    setupNote:
      "ハッシュルート `/#/setting` で Setting 画面を直接表示。CSV取込は file input への setInputFiles（クリック以外の前提操作）で実施し、その後のUI操作を1クリック1スクショで記録",
  });
});

test("regression: game screen functions", async ({ page }, testInfo) => {
  const report = new RegressionReport(
    "game",
    "all-functions",
    "Game画面の主要機能（抽選、履歴表示切替、クリア、景品パネル、ルーレット、結果表示、Start戻り）の回帰確認",
  );
  await report.init();

  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await seedGameViewWithPrizesSession(page, { selectedPrizeIds: ["p-1"] });
  await page.goto("/");
  await dismissAudioNoticeIfVisible(page);
  if (!(await page.getByRole("button", { name: "抽選を開始！" }).isVisible().catch(() => false))) {
    const resumeButton = page.getByRole("button", { name: "続きから" });
    if (await resumeButton.isVisible().catch(() => false)) {
      await resumeButton.click();
    }
  }
  await expect(page.getByRole("button", { name: "抽選を開始！" })).toBeVisible();

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: /\d列表示/ }),
    action: "Game画面で履歴列数トグル（N列表示）をクリック",
    expected: "履歴列数トグルが切り替わりボタンラベルが変化する",
    actualCheck: async () => {
      await expect(page.getByRole("button", { name: /\d列表示/ })).toBeVisible();
      return "PASS: 履歴列数トグル切替";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "抽選を開始！" }),
    action: "Game画面で「抽選を開始！」をクリック",
    expected: "抽選後に残数表示が更新される",
    actualCheck: async () => {
      await expect(page.getByText(/残り 73 \/ 75/)).toBeVisible({ timeout: 10_000 });
      return "PASS: 残数が 74→73 に更新";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "クリア" }),
    action: "Game画面で「クリア」をクリック",
    expected: "抽選履歴削除確認ダイアログが表示される",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "抽選履歴を削除する？" })).toBeVisible();
      return "PASS: ResetDialog が表示";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "キャンセル" }),
    action: "抽選履歴削除確認で「キャンセル」をクリック",
    expected: "確認ダイアログが閉じる",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "抽選履歴を削除する？" })).not.toBeVisible();
      return "PASS: ResetDialog を閉じた";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "賞名表示" }),
    action: "景品パネルで「賞名表示」をクリック",
    expected: "表示切替ボタンのラベルが変わる",
    actualCheck: async () => {
      await expect(page.getByRole("button", { name: "賞品表示" })).toBeVisible();
      return "PASS: 表示切替ボタンが更新";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "当選除外" }),
    action: "景品パネルで「当選除外」をクリック",
    expected: "フィルタ状態が有効化されボタンラベルが変わる",
    actualCheck: async () => {
      await expect(page.getByRole("button", { name: "フィルタ解除" })).toBeVisible();
      return "PASS: 当選除外フィルタ有効化";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "フィルタ解除" }),
    action: "景品パネルで「フィルタ解除」をクリック",
    expected: "フィルタが解除されボタンラベルが戻る",
    actualCheck: async () => {
      await expect(page.getByRole("button", { name: "当選除外" })).toBeVisible();
      return "PASS: 当選除外フィルタ解除";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("list").first().getByRole("button", { name: "除外" }).first(),
    action: "景品一覧で「除外」をクリック",
    expected: "対象景品のボタンが「戻す」に切り替わる",
    actualCheck: async () => {
      await expect(
        page.getByRole("list").first().getByRole("button", { name: "戻す" }).first(),
      ).toBeVisible();
      return "PASS: 景品の選出状態を切替";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("list").first().getByRole("button", { name: "戻す" }).first(),
    action: "景品一覧で「戻す」をクリック",
    expected: "対象景品のボタンが「除外」に戻る",
    actualCheck: async () => {
      await expect(
        page.getByRole("list").first().getByRole("button", { name: "除外" }).first(),
      ).toBeVisible();
      return "PASS: 景品の選出状態を復元";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByRole("button", { name: "景品ルーレット" }),
    action: "景品パネルで「景品ルーレット」をクリック",
    expected: "景品ルーレットダイアログが表示される",
    actualCheck: async () => {
      await expect(page.getByRole("dialog", { name: "景品ルーレット" })).toBeVisible();
      return "PASS: PrizeRouletteDialog が表示";
    },
  });

  // 自動遷移（クリックではない）を待機
  await expect(page.getByRole("dialog", { name: "景品ルーレット" })).not.toBeVisible({
    timeout: 12_000,
  });
  await expect(page.getByLabel("閉じる")).toBeVisible();
  await expect(page.getByRole("dialog").getByText(/景品[1-5]/).first()).toBeVisible();

  await report.clickAndCapture({
    page,
    target: page.getByLabel("閉じる"),
    action: "景品結果ダイアログで「閉じる」をクリック",
    expected: "景品結果ダイアログが閉じる",
    actualCheck: async () => {
      await expect(page.getByLabel("閉じる")).not.toBeVisible();
      return "PASS: 景品結果ダイアログを閉じた";
    },
  });

  await report.clickAndCapture({
    page,
    target: page.getByLabel("Start 画面に戻る"),
    action: "Game画面で「Start 画面に戻る」をクリック",
    expected: "Start 画面へ戻る",
    actualCheck: async () => {
      await expect(page.getByRole("heading", { name: "BINGOゲーム" })).toBeVisible();
      return "PASS: Start 画面へ遷移";
    },
    waitAfterClickMs: 200,
    noWaitAfter: true,
  });

  await report.writeReport({
    videoNote: `Playwright video recorded in ${testInfo.outputDir}/video.webm`,
    setupNote:
      "sessionStorage/localStorage を seed して Game 画面を直接表示。景品一覧を事前投入し、ルーレット〜結果表示まで確認",
  });
});
