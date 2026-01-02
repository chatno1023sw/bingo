# FormAdoptionChecklist テンプレート

以下のテンプレートを複製し、`docs/result/<branch>/<task>/` に保存した JSON を `evidence_path` として参照してください。

```jsonc
/**
 * @field form_id - Start/Game/Setting などフォームの一意識別子を記す。ルート名と UI セクション名をハイフンで接続する。
 * @field input_fields_count - 表示中に利用者が操作する入力要素（ボタン・テキストフィールド・トグル等）の総数を記す。
 * @field validation_complexity - none/simple/advanced のいずれかで入力検証の難易度を示す。
 * @field cross_field_dependencies - true の場合は複数フィールドの相互参照（例: CSV 取り込み→一覧反映）があることを示す。
 * @field async_submission - CSV アップロード・API 呼び出しなど非同期送信を含む場合は true。
 * @field score - 上記条件を踏まえて 0〜3+ のスコアを算出し、react-hook-form 必要度を決める。
 * @field recommendation - required / recommended / optional のいずれかで採用方針を表す。
 * @field evidence_path - `docs/result/<branch>/<task>/YYYYMMDD-HHMM_form-<form-id>.json` のように証跡ファイルの絶対パスを記す。
 * @field typecheck_log - 対応タスクで実行した `npm run typecheck` のログパスを記す（例: `docs/result/<branch>/<task>/YYYYMMDD-HHMM_typecheck.log`）。
 * @field notes - 判断理由や今後の TODO を N1 レベルの日本語で記す。
 */
{
  "form_id": "start",
  "input_fields_count": 1,
  "validation_complexity": "none",
  "cross_field_dependencies": false,
  "async_submission": false,
  "score": 1,
  "recommendation": "optional",
  "evidence_path": "docs/result/001-editorconfig-biome/TASK-ID/20250101-1200_form-start.json",
  "typecheck_log": "docs/result/001-editorconfig-biome/TASK-ID/20250101-1205_typecheck.log",
  "notes": "BGM トグルのみで構成されるため hook-form 非採用。フィールド増加時は要再評価。"
}
```
