# Contract: Formatting & Form Adoption Workflow

## Command Contracts

| Operation | Command | Expected Result | Evidence |
|-----------|---------|-----------------|----------|
| Run lint  | `npm run lint` | Biome が全 `app/**/*.ts(x)` / `docs/**/*.md` を検証し、違反時に exit code 1 で詳細を出力 | `docs/result/001-editorconfig-biome/TASK-ID/YYYYMMDD-HHMM_biome-lint.log` |
| Run format | `npm run format` | Biome フォーマッタが対象ファイルを整形し、実行後 `git status` にフォーマット差分のみが残る | `.../biome-format.log` |
| Format check | `npm run format:check` | 整形不要: exit 0、整形必要: exit 1 +ファイル一覧 | `.../biome-format-check.log` |

## Form Adoption Checklist Contract

1. フォーム仕様ごとに `FormAdoptionChecklist` を作成し、score 算出→recommendation を決定。  
2. react-hook-form を導入する場合、`EvidenceArtifact` で UI 動作（Chrome DevTools MCP）と Playwright MCP スクリーンショットを保存。  
3. チェック結果は `docs/spec seed/requirements.md` のフォーム章に追記し、PR テンプレートの確認欄にリンクする。

## EditorConfig Contract

- `.editorconfig` は保存時に適用されるため、すべての IDE/CI でファイル保存→`npm run format:check` を実行する。  
- ルール変更時は README, specs, Biome 設定へ同時反映する。
