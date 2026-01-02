# Quickstart: コードスタイル指針とフォーム運用

1. **依存インストール**: `npm install` で React Router / Biome / react-hook-form など全依存を取得する。react-hook-form は既に `package.json` へ追加済みであることを確認し、必要に応じて `npm install react-hook-form --legacy-peer-deps` を再実行する。  
2. **EditorConfig 適用**: VSCode 拡張（EditorConfig for VS Code）を有効化し、保存時に 2 スペース/LF/UTF-8/末尾改行が適用されることを確認。`git diff` のスクリーンショットを `docs/result/001-editorconfig-biome/<task>/YYYYMMDD-HHMM_chromedevtools.png` へ保存。  
3. **Lint/Format/Typecheck**: `npm run lint` → `npm run format` → `npm run format:check` を順に実行し、各ログを `docs/result/001-editorconfig-biome/<task>/YYYYMMDD-HHMM_biome-*.log` へ保存。完了後に `npm run typecheck` を実行し、`YYYYMMDD-HHMM_typecheck.log` を同フォルダへ追加する。  
4. **フォーム評価**: `docs/spec seed/requirements/form-adoption-checklist.md` を複製し、Start/Game/Setting それぞれの `form_id` 単位で Checklist JSON を作成する。`evidence_path` と `typecheck_log` に保存先（例: `docs/result/.../20250201-1015_form-setting.json`）を明記し、score に応じて react-hook-form 導入可否を決定する。  
5. **UI 証跡（Chrome DevTools MCP / Playwright MCP）**: Checklist 記入時と同じタスクフォルダへ UI 操作ログやスクリーンショットを保存し、PR には `evidence_path` とスクリーンショット双方のパスを記載する。  
6. **README/AGENTS 更新**: 新しいルールへ導線があるか確認し、差分を spec seed / spec by kiro / README / AGENTS に反映。インターフェース更新時は `app/interface/<domain>` のエクスポートと整合させる。  
7. **Cipher MCP 更新**: すべての成果物完成後に byterover-cipher メモリーへ要約を追記し、ID を spec/plan に記入。
