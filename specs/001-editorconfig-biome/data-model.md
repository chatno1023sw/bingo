# Data Model: コードスタイル指針とフォーム運用

## Entities

### EditorConfigPolicy
- **Attributes**: `patterns` (e.g., `*.ts`, `*.tsx`, `*.json`), `indent_size`, `indent_style`, `charset`, `end_of_line`, `trim_trailing_whitespace`, `insert_final_newline`.  
- **Relationships**: 適用対象ファイルは Git ツリー全体。  
- **Validation Rules**: すべてのソース/ドキュメントに対し 2 スペース + LF を強制。

### BiomeRuleSet
- **Attributes**: `extends` (React/TypeScript presets), `lints` (style, correctness), `formatter` (lineWidth, indentWidth), `overrides` (e.g., test files), `scripts` (lint/format commands)。  
- **Relationships**: `package.json` の npm scripts と CI ワークフローに参照される。  
- **Validation Rules**: `npm run lint` で未使用 import/変数を error。`npm run format:check` で整形差分があると exit code 1。

### FormAdoptionChecklist
- **Attributes**: `form_id`, `input_fields_count`, `validation_complexity` (none/simple/advanced), `cross_field_dependencies` (boolean), `async_submission` (boolean), `score`, `recommendation` (required/recommended/unnecessary), `evidence_path`.  
- **Relationships**: 各フォーム仕様 (start/game/setting) と紐づく。  
- **Validation Rules**: Score >=3 → react-hook-form 必須、2 → 推奨、<=1 → 任意。

### EvidenceArtifact
- **Attributes**: `task_id`, `branch`, `path`, `tool` (ChromeDevTools/Playwright/Biome), `timestamp`, `description`.  
- **Relationships**: 各タスク/PR とリンクし、FormAdoptionChecklist, lint/format 実行に付随。

## State / Lifecycle

- EditorConfig / Biome 設定の変更は `plan -> implementation -> docs/result` の順にレビューされ、PR マージ後に最新状態となる。  
- FormAdoptionChecklist は「Draft → Reviewed → Archived」。react-hook-form 適用後、証跡リンクを EvidenceArtifact に接続して Reviewed 状態で固定。
