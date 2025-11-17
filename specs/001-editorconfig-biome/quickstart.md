# Quickstart: コードスタイル指針とフォーム運用

1. **依存インストール**: `npm install biome @types/react-hook-form react-hook-form`（必要に応じて）。  
2. **EditorConfig 適用**: VSCode 拡張（EditorConfig for VS Code）を有効化し、ファイル保存時に 2 スペース/LF を確認。  
3. **Lint/Format**: `npm run lint` / `npm run format` / `npm run format:check` を実行し、`docs/result/001-editorconfig-biome/<task>/YYYYMMDD-HHMM_biome-*.log` を保存。  
4. **フォーム評価**: `docs/spec seed/requirements.md` にある FormAdoptionChecklist を用いて対象フォームを評価し、結果と証跡を `docs/result/001-editorconfig-biome/<task>/` へ配置。  
5. **Chrome DevTools MCP / Playwright MCP**: lint/format 実行ログ＋フォーム UI スクショを MCP 経由で取得し、保存パスを PR に記載。  
6. **README/AGENTS 更新**: 新しいルールへ導線があるか確認し、差分を spec seed / spec by kiro / README / AGENTS に反映。  
7. **Cipher MCP 更新**: すべての成果物完成後に byterover-cipher メモリーへ要約を追記し、ID を spec/plan に記入。
