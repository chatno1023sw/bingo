# FormAdoptionChecklist テンプレート

`docs/spec seed/requirements.md` から参照される react-hook-form 導入判断テンプレート。Start/Game/Setting 各フォームの評価結果をこのファイル、もしくは本テンプレートを複製した JSON/MD として `docs/result/001-editorconfig-biome/<task-id>/` に保存する。

## 記入フィールド

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `form_id` | string | フォームを一意に識別する ID（例: `start-menu`, `game-prize-controls`, `setting-prize-editor`）。 |
| `input_fields_count` | number | 入力フィールド総数（ボタンやトグルを含む）。 |
| `validation_complexity` | `none` / `simple` / `advanced` | 同期/非同期を含むバリデーションの複雑度。 |
| `cross_field_dependencies` | boolean | フィールド間の依存があるか。 |
| `async_submission` | boolean | CSV アップロードや API 送信など非同期処理を行うか。 |
| `score` | number | 入力値から算出したスコア（0〜）。`1`=任意、`2`=推奨、`3+`=必須。 |
| `recommendation` | `optional`/`recommended`/`required` | スコアリング結果による導入判断。 |
| `evidence_path` | string / string[] | `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_<tool>.log|png` を列挙する。 |
| `notes` | string | 補足（例: 再評価予定、既知の制約）。 |

## 記入例（Markdown）

```
## setting-prize-editor (2025-12-06)
- input_fields_count: 8
- validation_complexity: advanced
- cross_field_dependencies: true
- async_submission: true
- score: 4 → recommendation=required
- evidence_path:
  - docs/result/001-editorconfig-biome/T015/20251206-1200_chromedevtools.log
  - docs/result/001-editorconfig-biome/T015/20251206-1202_playwright.png
- notes: CSV 取り込み〜Game 反映の遅延が 4s 以内であることを確認。
```

## 記入例（JSON）

```json
{
  "form_id": "game-prize-controls",
  "input_fields_count": 4,
  "validation_complexity": "simple",
  "cross_field_dependencies": true,
  "async_submission": false,
  "score": 2,
  "recommendation": "recommended",
  "evidence_path": [
    "docs/result/001-editorconfig-biome/T015/20251206-1300_chromedevtools.log"
  ],
  "notes": "景品トグルでサマリーが更新されるため react-hook-form を検討"
}
```

## 運用手順

1. 新規フォームや既存フォーム変更時に本テンプレートをコピーし、最新スコアを記録する。
2. 記入後は `docs/result/001-editorconfig-biome/<task-id>/` へ保存し、PR 説明に evidence_path を列挙する。
3. react-hook-form を導入／移行した場合は Checklist を `Reviewed` 状態に更新し、`notes` へ github-mcp-server で作成したコミット ID を添付する。
