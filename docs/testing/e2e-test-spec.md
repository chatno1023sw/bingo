# E2Eテスト仕様書（Playwright）

## 実行対象

| 項目 | 内容 |
| --- | --- |
| テストランナー | Playwright (`chromium`) |
| 設定ファイル | `playwright.config.ts` |
| 実行コマンド | `npm run test:e2e` |
| 事前準備 | `npm run test:e2e:install`（初回） |
| 証跡 | failure時に screenshot / trace / video を保持 |

## シナリオ一覧（表）

| E2E ID | 対応チケット | ファイル | シナリオ | 判定 |
| --- | --- | --- | --- | --- |
| E2E-01 | T-05/T-06 | `tests/e2e/start-and-setting.spec.ts` | Start画面表示 → 設定画面遷移 | `CSV追加` / `戻る` が表示される |
| E2E-02 | T-07 | `tests/e2e/game-draw-smoke.spec.ts` | Game表示 → 抽選開始 → 残数更新 | `残り 74 / 75` → `残り 73 / 75` |
| E2E-03 | T-06 | `tests/e2e/setting-csv-import.spec.ts` | SettingでCSV import → 景品カード反映 | `一等` / `Switch` 入力欄が見える |

## テスト設計メモ

| 観点 | 方針 |
| --- | --- |
| 音声ダイアログ | `sessionStorage` を seed して初回ダイアログのブロックを回避 |
| 音声/BGM 由来の不安定性 | `localStorage` にミュート設定を seed して flaky を抑制 |
| Game画面への到達 | `sessionStorage` の `bingo.v1.activeView` を `game` に seed |
| データ準備 | `localStorage` に `gameState/prizes` を直接投入（スモーク目的） |

## CI運用案

| 頻度 | 実行対象 | 備考 |
| --- | --- | --- |
| PR | E2E-01, E2E-02（スモーク） | 時間優先 |
| PR（推奨） | E2E-03 | CSV取込の回帰検知 |
| nightly | 全E2E + trace保存 | 失敗解析を兼ねる |
