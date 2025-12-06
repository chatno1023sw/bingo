# Quickstart: コードスタイル指針とフォーム運用

1. **依存インストール**: `npm install react-hook-form --legacy-peer-deps` を実行し、Biome CLI は devDependencies に含まれていることを確認する（`@types/react-hook-form` は不要）。  
2. **EditorConfig 適用**: VSCode 拡張（EditorConfig for VS Code）を有効化し、ファイル保存時に 2 スペース/LF を確認。  
3. **Lint/Format**: `npm run lint` / `npm run format` / `npm run format:check` を実行し、`docs/result/001-editorconfig-biome/<task>/YYYYMMDD-HHMM_biome-*.log` を保存。  
4. **フォーム評価**: `docs/spec seed/requirements/form-adoption-checklist.md` のテンプレートを複製して Start/Game/Setting を評価し、score に応じて react-hook-form の導入有無を決定。評価ファイルと MCP 証跡は `docs/result/001-editorconfig-biome/<task>/` へ保存。  
5. **Chrome DevTools MCP / Playwright MCP**: lint/format 実行ログ＋フォーム UI スクショを MCP 経由で取得し、保存パスを PR に記載。  
6. **README/AGENTS 更新**: 新しいルールへ導線があるか確認し、差分を spec seed / spec by kiro / README / AGENTS に反映。  
7. **Cipher MCP 更新**: すべての成果物完成後に byterover-cipher メモリーへ要約を追記し、ID を spec/plan に記入。
