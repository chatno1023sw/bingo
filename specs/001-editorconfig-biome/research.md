# Research: コードスタイル指針とフォーム運用

## Decision 1: EditorConfig 基本ルール
- **Rationale**: VSCode/CLI/他 IDE で同一インデントと改行を強制し、diff ノイズを削減するため。
- **Implementation Notes**: 2 スペースインデント、UTF-8、LF、末尾スペーストリム、最終行改行を既定値とする。Markdown/JSON/TSX も同値で運用。  
- **Alternatives Considered**: Prettier 独自設定のみ → EditorConfig 非対応の IDE で差異が残るため却下。

## Decision 2: Biome を lint/format の単一基準に採用
- **Rationale**: React + TypeScript で ESLint/Prettier を分離管理する負荷を下げ、import 順や JSX ルールを一体で扱う。
- **Implementation Notes**: `biome.json` で `react`, `typescript`, `style` ルールセットを拡張し、`npm run lint`・`npm run format`・`npm run format:check` を Biome CLI へ委譲。CI/pr-commit フックが exit code を拾う。  
- **Alternatives Considered**: 既存 ESLint を延命 → 設定が分散し齟齬が増える。Rome/Bun など別フォーマッタ → チームで未採用。

## Decision 3: react-hook-form 適用チェックリスト
- **Rationale**: フォームの複雑度を客観評価し、何でも hook-form 化しない基準を共有するため。
- **Implementation Notes**: 入力数、同期/非同期バリデーション、依存フィールド有無、送信時のエラー表示要件でスコアリング。適用区分: 必須（score 3+）、推奨（2）、不要（1 以下）。結果は `docs/spec seed/requirements.md` に追記し、`docs/result` に証跡を保存。  
- **Alternatives Considered**: 各開発者判断 → 決定ログが残らず差戻しが多い。Formik など他ライブラリ → 既存依存なし・bundle 増が大。

## Decision 4: Evidence 保存フロー
- **Rationale**: 憲章で義務化された `docs/result/<branch>/<task>/` を lint/format/フォーム適用にも徹底し、審査性を確保するため。  
- **Implementation Notes**: タスク ID ごとに `YYYYMMDD-HHMM_<tool>.{log|png}` で保存し、PR/README から参照。Chrome DevTools MCP ログと Playwright MCP スクショを格納。  
- **Alternatives Considered**: PR 添付のみ → 過去証跡の検索性が低い。

## Decision 5: README / docs 更新
- **Rationale**: 新ルールへの導線を確保し、EditorConfig インストール・Biome コマンド・hook-form ガイドを明示するため。  
- **Implementation Notes**: README に lint/format 手順、docs/spec seed requirements にフォームチェック表、AGENTS/requirements への参照追加。  
- **Alternatives Considered**: 仕様ファイル更新のみ → 実装者が気づかないリスク。
