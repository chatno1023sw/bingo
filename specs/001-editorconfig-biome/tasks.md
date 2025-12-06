# Tasks: コードスタイル指針とフォーム運用

**Input**: Design documents from `/specs/001-editorconfig-biome/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/formatting.md, quickstart.md
**Cipher MCP Entry**: `[cipher-mcp-entry-id]` (byterover-cipher, 最終同期: [YYYY-MM-DD])

**Tests**: `npm run typecheck`, `npm run lint`, `npm run format`, Chrome DevTools MCP（主要証跡）, Playwright MCP（必要に応じたスクショ）

**Organization**: Tasks are grouped by user story (US1–US3) with shared Setup/Foundational phases and a final polish phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task can run in parallel (different files, no dependency conflicts)
- **[Story]**: User story label (US1, US2, US3). Setup/Foundational/Polish phases omit the label.
- Include exact file paths in every description.
- すべてのタスク完了時に `npm run typecheck` を実行してログを `docs/result/001-editorconfig-biome/<task>/YYYYMMDD-HHMM_typecheck.log` へ保存すること。
- 記載タスク/証跡は byterover-cipher にも同期し、ID を plan/spec/PR へ反映すること。
- 変更有無に関わらず差分が生じた時点で単独で github-mcp-server を使ってコミットし、コミットメッセージへ `docs/result/<branch>/<task>/` の証跡パスを含めること。

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Capture cipher MCP summary and embed entry ID/date into `specs/001-editorconfig-biome/plan.md` と `specs/001-editorconfig-biome/spec.md` のメタデータを更新する。（2025-12-06 時点では byterover-cipher quota exceeded のため BLOCKED 記述で代替、ID 取得後に再更新）
- [ ] T002 Update `docs/result/001-editorconfig-biome/README.md` に typecheck ログ (`YYYYMMDD-HHMM_typecheck.log`) を含む証跡命名規則と Chrome DevTools MCP / Playwright MCP 併用手順を追加する。

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 Synchronize `docs/spec seed/requirements.md` の共通テスト章へ、`npm run typecheck` 必須・ログ保存手順・`docs/result/<branch>/<task>/` 格納ルールを追記する。
- [ ] T004 Extend `README.md` と `AGENTS.md` に TSDoc（N1）記載義務、インターフェース集約ルール、typecheck 実行＆証跡保存フローを章立てで明文化する。
- [ ] T005 Create `app/interface/start/`, `app/interface/game/`, `app/interface/setting/`, `app/interface/shared/` ディレクトリを追加し、`index.ts` に共通型エクスポート骨子（TSDoc 付き TODO）を配置して import 経路を示す。

## Phase 3: User Story 1 - 編集者はどの IDE でも同一フォーマットを得られる (Priority: P1)

**Goal**: `.editorconfig` により IDE/CLI の整形ルールを共通化する。
**Independent Test**: VSCode で保存→git diff、`npm run format:check` の失敗スクリーンショット、typecheck ログを `docs/result/001-editorconfig-biome/T00x/` に保存する。

### Implementation for User Story 1

- [ ] T006 [US1] Create `.editorconfig`（リポジトリ直下）で TypeScript/TSX/JSON/MD の 2 スペース・LF・UTF-8・末尾スペース除去・最終行改行ルールを定義する。
- [ ] T007 [P] [US1] Update `README.md` と `AGENTS.md` の Coding Standards 節へ EditorConfig 使い方（VSCode 拡張、CLI 検証、typecheck 実行手順）を追記する。
- [ ] T008 [P] [US1] Document EditorConfig ポリシーと git diff 証跡取得方法を `docs/spec seed/requirements.md`（1.3/FR-001/FR-002）へ追記し、関連証跡パスを記載する。

## Phase 4: User Story 2 - Biome による lint/format を共通基準にできる (Priority: P1)

**Goal**: Biome を唯一の lint/format ツールとして設定し、npm scripts と契約を整合させる。
**Independent Test**: `npm run lint` / `npm run format` / `npm run format:check` 実行ログ、typecheck ログ、Chrome DevTools MCP 証跡を `docs/result/001-editorconfig-biome/T00x/` に保存する。

### Implementation for User Story 2

- [ ] T009 [US2] Add `@biomejs/cli` 依存を `package.json` / `package-lock.json` に追加し、`npm install` 後の差分を確認する。
- [ ] T010 [US2] Create `biome.json` で React/TypeScript/style プリセット・2 スペース整形・import sort ルールを設定し、Tailwind ディレクティブ解析を有効化する。
- [ ] T011 [US2] Update `package.json` scripts (`lint`, `format`, `format:check`) を Biome CLI 呼び出しに置換し、`npm run typecheck` 前に実行するワークフローを README へ記述する。
- [ ] T012 [P] [US2] Expand `README.md` Coding Standards > Biome 節にコマンド使用方法、失敗例、`docs/result/<branch>/<task>/YYYYMMDD-HHMM_biome-*.log` 保存フローを追記する。
- [ ] T013 [P] [US2] Update `docs/spec seed/requirements.md` FR-003〜FR-005 へ Biome ルールセット、CI/pre-commit 連携、typecheck との順序を明記する。
- [ ] T014 [P] [US2] Sync `specs/001-editorconfig-biome/contracts/formatting.md` のコマンド行と証跡ファイル名を最新 npm script・typecheck ルールに合わせて更新する。

## Phase 5: User Story 3 - フォーム実装者は react-hook-form を基準に選択できる (Priority: P2)

**Goal**: react-hook-form 適用判断と checklist、依存パッケージ、ドキュメント整備を提供する。
**Independent Test**: Checklist 記入例、react-hook-form 実装サンプル、typecheck ログ、Chrome DevTools MCP のフォーム確認結果を `docs/result/001-editorconfig-biome/T00x/` に配置する。

### Implementation for User Story 3

- [ ] T015 [US3] Add `react-hook-form` 依存（必要なら `@types/react-hook-form`）を `package.json` / `package-lock.json` へ追加し、`npm run typecheck` が通ることを確認する。
- [ ] T016 [P] [US3] Update `docs/spec seed/requirements.md`（章 2/4/5）へ FormAdoptionChecklist スコアリング基準・evidence_path の書式・typecheck ログの添付要件を追記する。
- [ ] T017 [P] [US3] Create `docs/spec seed/requirements/form-adoption-checklist.md` テンプレートを整備し、各フィールドに N1 TSDoc 形式の説明を付ける。
- [ ] T018 [P] [US3] Extend `README.md` に react-hook-form 採用ワークフロー（Checklist, interface ディレクトリ活用, typecheck 必須, EvidenceArtifact 連携）を記載する。
- [ ] T019 [P] [US3] Update `specs/001-editorconfig-biome/quickstart.md` で依存インストール手順と Checklist 駆動のレビュー・証跡保存方法を刷新する。

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T020 Refresh `.github/pull_request_template.md` に EditorConfig/Biome/react-hook-form/typecheck ログのチェックボックスを追加する。
- [ ] T021 Summarize最終決定を `specs/001-editorconfig-biome/research.md` に追記し、TSDoc/Interface/Typecheck ルールと証跡リンクを整理する。

---

## Dependencies & Execution Order

### Phase Dependencies
- Phase 1 (Setup) → Phase 2 (Foundational) → User Stories (Phase 3–5) → Phase 6 (Polish)
- Foundationalタスクが完了するまで US1–US3 へ着手しない。

### User Story Dependencies
- **US1 (EditorConfig)**: 先行して `.editorconfig` を確立（US2/US3 のドキュメントがこれを参照）。
- **US2 (Biome)**: US1 のスタイル基準を引き継ぐ。US3 のドキュメントにも Biome 手順が引用されるため US2 完了後に US3 を推奨。
- **US3 (react-hook-form)**: typecheck/TSDoc/Interface ルールが整った前提で進行。

### Within Each User Story
- Tests（Chrome DevTools MCP 証跡 + `npm run typecheck`）→設定ファイル→README/docs→contracts/quickstart の順に実施し、一貫性を保つ。
- interface/type 追加や README 変更は `app/interface/*` と docs の両方へ反映する。

### Parallel Opportunities
- T007/T008（US1 文書更新）は `.editorconfig` 作成完了後に並列で実施可能。
- US2 の T012〜T014 は `biome.json` と scripts 更新（T010–T011）完了後に並行処理できる。
- US3 の T016〜T019 は依存インストール（T015）完了後、それぞれ異なるファイルを触るため並列可。

## Implementation Strategy

1. 完全なガバナンス整備（Phase 1–2）で typecheck・TSDoc・interface ルールを定義する。
2. MVP（US1）で `.editorconfig` を確立し、Chrome DevTools MCP で証跡を取る。
3. US2 で Biome を唯一の lint/format として定着させ、契約/README を同期。
4. US3 で react-hook-form の判断基準とドキュメントを整備し、フォーム開発をガイド。
5. Polish フェーズで PR テンプレートと research を更新し、全証跡リンクを網羅する。
