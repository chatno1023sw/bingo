## 概要
- 変更内容と対象タスク ID を記載してください。
- `docs/result/001-editorconfig-biome/<task-id>/` への証跡リンク（Chrome DevTools MCP / Playwright MCP / Biome CLI）を含めてください。

## チェックリスト
- [ ] EditorConfig (.editorconfig) のルールに従った差分のみか確認し、`git diff` スクリーンショットを証跡へ保存した
- [ ] `npm run lint` / `npm run format` / `npm run format:check` のログを `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_biome-*.log` として添付した
- [ ] 該当フォームの FormAdoptionChecklist を更新し、`docs/spec seed/requirements/form-adoption-checklist.md` と `docs/result/...` に評価結果と evidence_path を追記した
- [ ] `npm run typecheck` を lint/format 実行後に実施し、`docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_typecheck.log` を添付した
- [ ] Chrome DevTools MCP を用いた UI/機能確認ログ、必要に応じて Playwright MCP スクリーンショットを取得した

## 追加メモ
- リグレッション懸念、未対応事項、フォローアップチケットなどがあれば記載してください。
