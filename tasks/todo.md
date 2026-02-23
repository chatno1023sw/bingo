# TODO

- [x] AGENTS.md更新内容を反映（Playwright UIテストのスクリーンショット添付）
- [x] Vitest を再実行して回帰確認
- [x] Playwright を再実行して回帰確認（証跡生成を含む）
- [x] DTM-01〜03（console/network観測）を実施して結果を docs に反映
- [x] 結果とレビューを追記

## Review

- AGENTS.md の Playwright 証跡要件に合わせて、`playwright.config.ts` を `screenshot: "on"`, `video: "on"` に更新。
- 各 E2E spec に `testInfo.attach` ベースのスクリーンショット添付を追加（開始前/操作後のチェックポイント）。
- `npm test` 再実行結果: `8 files / 30 tests passed`（約1.63s）。
- `npm run test:e2e` 再実行結果: `3 passed`（約10.8s）。動画・スクリーンショット生成を確認。
- DTM-01〜03 は Chrome DevTools MCP 直接実行の代替として Playwright 観測 spec を追加し、`3 passed`（約9.1s）。
- DTM-02 の観測条件は初回で Vite のモジュール配信URLを誤検知したため、API相当 path のみを対象に絞って再実行。
- 追加要件対応として `tests/e2e/all-screens-walkthrough.spec.ts` を作成し、全画面/主要ダイアログのスクショ記録テストを実施（`5 passed`, 約9.9s）。
- AGENTS.md 再更新（Test/Coding ルール追加）を確認し、既存証跡のレポート埋め込み要件に合わせて `test-results-evidence/` へ DTM / 全画面ウォークスルーを再取得。
- `docs/testing/test-results-2026-02-23.md` にスクリーンショット埋め込みと動画リンクを追加（全画面ウォークスルー / DTM-01〜03）。
