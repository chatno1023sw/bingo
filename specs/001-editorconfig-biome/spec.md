# Feature Specification: コードスタイル指針とフォーム運用

**Feature Branch**: `001-editorconfig-biome`  
**Created**: 2025-11-17  
**Status**: Draft  
**Cipher MCP Entry**: BLOCKED (2025-12-06 quota exceeded on byterover-cipher; add ID/date once service recovers)  
**Input**: User description: "react-hook-formを使えば処理がよりセマンティックにまたは簡潔になる場合は使ってください。EditorConfig for VSCodeで書式を統一するファイルを生成してください。実装時はbiomeのlinterやformatに準拠した実装をしてください（そのために設定ファイルを追加してください）"

> 憲章に従い、cipher MCP のメモリーが更新されていない仕様はレビューできません。必ず最新 ID を記載してください。

**Test Evidence Rules**  
- Chrome DevTools MCP をデフォルトの検証環境として設定し、Chrome DevTools で取得できない証跡は Playwright MCP（`apt install chromium-browser` で導入した Chromium）を利用する。  
- すべてのログ・スクリーンショット・動画を `docs/result/<ブランチ名>/<タスクID>/` 配下に保存する方針を本仕様に記述する。  
- 各ユーザーストーリーの完了条件に、上記フォルダーの証跡パスと github-mcp-server で作成したコミット ID を紐付ける。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 編集者はどの IDE でも同一フォーマットを得られる (Priority: P1)

開発者として、VSCode だけでなく CLI や他エディタでも同じインデント・改行・エンコーディングが適用され、差分ノイズのないレビュー環境を得たい。

**Why this priority**: コードスタイルの揺らぎはレビューコストとコンフリクトを増やし、仕様策定よりも整形作業に時間が割かれるため。

**Independent Test**: VSCode の EditorConfig 拡張と CLI で新規ファイルを作成し、`.editorconfig` が反映されているか Chrome DevTools MCP から git diff を確認する。

**Acceptance Scenarios**:

1. **Given** `.editorconfig` がリポジトリ直下に存在する状態、 **When** VSCode で TypeScript ファイルを保存する、 **Then** インデントが 2 スペース・UTF-8・LF で統一され diff に余計な変更が生じない。  
2. **Given** CLI で `npm run lint:format-check` を実行する、 **When** EditorConfig 違反があるファイルが検出される、 **Then** コマンドは失敗し違反ファイル名が出力される。

---

### User Story 2 - Biome による lint/format を共通基準にできる (Priority: P1)

テックリードとして、React Router + TypeScript プロジェクト向けに Biome を正式な lint/format ツールとして設定し、PR 前に自動整形と静的検証を行いたい。

**Why this priority**: 既存の eslint/prettier 設定が不足しているため、型安全や import ルールが統一されず手動修正が多いから。

**Independent Test**: `npm run lint` と `npm run format` を実行し、Biom eの config が読み込まれエラー/修正内容をレポートすることを Chrome DevTools MCP で確認する。

**Acceptance Scenarios**:

1. **Given** Biome 設定ファイルがルートに存在する、 **When** `npm run lint` を実行する、 **Then** TypeScript/TSX ファイルのスタイルと import 順序が定義どおりに検証され、違反時に exit code ≠0 となる。  
2. **Given** `npm run format` を実行する、 **When** フォーマットの必要なファイルがある、 **Then** Biome が修正し git diff にフォーマット変更のみが残る。

---

### User Story 3 - フォーム実装者は react-hook-form を基準に選択できる (Priority: P2)

UI エンジニアとして、複雑なバリデーションや入力管理が必要なフォームで react-hook-form を優先的に採用すべき条件と、既存フォームを移行する判断基準を把握したい。

**Why this priority**: 手書きの useState ベース実装ではバリデーション重複や可読性低下が起きており、フォーム行動仕様を守りづらいから。

**Independent Test**: 仕様ドキュメントと checklist を参照し、対象フォーム（例: Setting 画面）へ react-hook-form を導入するタスクを定義できるか確認する。

**Acceptance Scenarios**:

1. **Given** 新規フォーム設計レビュー、 **When** 入力数やバリデーション条件を記入する、 **Then** react-hook-form 適用条件チェックリストで「適用/不要」を判断し、決定内容を spec に追記できる。  
2. **Given** 既存フォームが react-hook-form 条件を満たしている、 **When** チェックリストに従い移行タスクを生成する、 **Then** 該当タスクは `docs/result/<branch>/<task>/` で証跡を持つことが求められる。

---

### Edge Cases

- `.editorconfig` と Biome 設定でインデント幅が異なる場合の衝突をどう検知し、CI で失敗させるか。  
- 既存の ESLint/Prettier 設定が残存している際、利用者にどの設定を優先するか示す。  
- react-hook-form 適用が不要なフォーム（単一トグルなど）を誤って移行しないよう条件を定義する。  
- VSCode 以外（JetBrains、NeoVim）で EditorConfig が効かない場合の代替手順を文書化する。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: リポジトリ直下に `.editorconfig` を配置し、TypeScript/TSX/JSON/MD など主要ファイルのインデント・改行・末尾スペース削除ルールを定義する。  
- **FR-002**: EditorConfig の内容を README/開発ガイドから参照できるようリンクし、VSCode の拡張インストール手順を記載する。  
- **FR-003**: Biome 設定ファイル（例: `biome.json`）を追加し、React Router + TypeScript プロジェクトの lint/format ポリシー（import 順序、未使用変数、JSX スタイルなど）を定義する。  
- **FR-004**: `package.json` に Biome 用の `lint` / `format` / `format:check` スクリプトを追加し、`npm run lint` と `npm run format` が必ず Biome を呼び出すようにする。  
- **FR-005**: CI またはローカル pre-commit 用に Biome の exit code が 0 でない場合 PR をブロックする運用を README に明示する。  
- **FR-006**: react-hook-form の適用ガイドラインを docs/spec seed または README に追記し、フォームの複雑度（入力数 >3、ネストバリデーション、非同期送信など）で使用を推奨/任意/不要に分類するチェック表を提供する。  
- **FR-007**: 既存フォームの移行プロセスを定義し、react-hook-form へ移行する際の手順（フィールド登録、バリデーションメッセージ、テスト証跡）を checklist として追加する。  
- **FR-008**: `docs/result/<branch>/<task>/` に lint/format 実行ログと react-hook-form 適用チェックリストの証跡を保存する運用フローを仕様に記述する。

### Key Entities

- **EditorConfigPolicy**: 対象ファイル種別、インデント幅、改行コード、末尾スペース設定などのフォーマットルールを持つ。  
- **BiomeRuleSet**: Lint/format タスクで使用されるルールの集合体。カテゴリ（スタイル、ベストプラクティス、パフォーマンス）と、無効化/上書き設定を含む。  
- **FormAdoptionChecklist**: react-hook-form を適用するための条件項目（入力数、バリデーション種別、エラーメッセージ要件）を持ち、フォームごとに評価結果を保存する。  
- **EvidenceArtifact**: `docs/result/<branch>/<task>/` に格納されるログ・スクリーンショット・チェックリスト PDF を指し、Lint/Format/フォーム移行タスク完了の証跡となる。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `.editorconfig` に準拠していないファイルで `npm run format:check` が失敗し、0 → 1 の exit code を返すことを確認する自動テストが追加される。  
- **SC-002**: `npm run lint` 実行時に Biome が 10 秒以内で完了し、サンプル違反を 100% 捕捉する。  
- **SC-003**: 仕様策定から 1 週間以内に react-hook-form チェックリストが docs に反映され、対象フォームの 90% が分類済みになる。  
- **SC-004**: PR テンプレート上で EditorConfig/Biome チェックと react-hook-form 適用判断が確認項目として追加され、全 PR の 100% がチェック済みとなる。

## Assumptions

- Node.js/Bun 環境に Biome CLI を導入できること。  
- CI で現行 lint コマンドを置き換える権限があること。  
- 既存フォーム実装は React Router v7 + React 19 を基盤とし、react-hook-form への移行に大きな互換性問題はない。  
- EditorConfig は VSCode 以外にも主要 IDE で標準サポートされているため追加プラグイン導入で対応可能。
