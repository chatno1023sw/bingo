# Tasks: Bingo抽選アプリ仕様整備

**Input**: Design documents from `/specs/001-align-spec/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 仕様上 TDD が必須のため、各ユーザーストーリーでテスト作成タスクを含める。

**Organization**: Tasks are grouped by user story so each slice is independently testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 仕様同期とツールチェーン整備で共通基盤を固める

- [x] T001 Compare spec seed/design と spec by kiro を突き合わせ、相違点を `docs/spec seed/requirements.md` と `docs/spec by kiro/.kiro/specs/bingo-game/requirements.md` に反映
- [x] T002 Add Vitest + React Testing Library + `@react-router/testing` 依存と設定を `package.json`, `vitest.config.ts`, `tsconfig.json` に追加し `npm run test` スクリプトを定義
- [ ] T003 Wire `mizchi/similarity` チェックを `package.json` と `README.md` に追記し、開発ルールとして `docs/spec seed/requirements.md` に記録

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 以降の全ストーリーが依存する型・ストレージ・サービス骨格を実装

- [ ] T004 Create TypeScript モデル (`app/common/types/game.ts`, `app/common/types/prize.ts`, `app/common/types/bgm.ts`, `app/common/types/index.ts`) を data-model.md に合わせて定義
- [ ] T005 Implement 版管理付き localStorage ユーティリティと単体テスト (`app/common/utils/storage.ts`, `app/common/utils/__tests__/storage.test.ts`) で `bingo.v1.*` キーを管理
- [ ] T006 Scaffold service 層 (`app/common/services/sessionService.ts`, `app/common/services/prizeService.ts`, `app/common/services/bgmService.ts`, `app/common/services/historyService.ts`) と契約スタブを contracts/app.yaml に対応するメソッドで用意

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - 司会者がゲームを開始・再開できる (Priority: P1) 🎯 MVP

**Goal**: Start 画面から「はじめから」「続きから」「設定」遷移を安全に実行し、localStorage 状態を初期化/復元できるようにする。

**Independent Test**: `npm run dev` で Start 画面のみを操作し、「はじめから」→ Game 遷移、「続きから」→ 復元遷移、保存無し時のフォールバックが確認できる。Vitest で sessionService と Start ルートの単体/結合テストが緑になる。

### Tests for User Story 1

- [ ] T007 [US1] Add failure-first シナリオを `docs/spec seed/requirements.md#Start画面`（および `docs/spec by kiro/.kiro/specs/bingo-game/tasks.md`）へ追記し Chrome DevTools MCP での検証手順を記述
- [ ] T008 [US1] Create Vitest suites for session start/resume (`app/common/services/__tests__/sessionService.test.ts`) を実装

### Implementation for User Story 1

- [ ] T009 [US1] Implement reset/resume ロジックを `app/common/services/sessionService.ts` で完成させ、localStorage utility と contracts `/session/start` `/session/resume` に準拠
- [ ] T010 [US1] Update `app/routes/start.tsx` loader/action を sessionService と連携させ、useNavigation とリダイアログ制御を追加
- [ ] T011 [P] [US1] Build Start UI コンポーネント (`app/components/start/StartMenu.tsx`, `app/components/start/ContinueDialog.tsx`) を Tailwind と design.md に合わせて実装
- [ ] T012 [US1] Add React Testing Library tests for Start 画面 (`app/routes/__tests__/start-route.test.tsx`) でボタン押下時の遷移とダイアログ挙動を検証
- [ ] T037 [US1] Capture Start 画面のモック整合スクリーンショットと BGM トグル表示を Chrome DevTools MCP で取得し `docs/spec seed/design/` へのリンクを記録
- [ ] T038 [US1] Run 3 回連続リロードと「続きから」復元シナリオ（Chrome DevTools MCP）を実行し結果を `docs/spec seed/requirements.md` に追記

**Checkpoint**: Start 画面のみでゲームの新規開始/再開が検証済み。

---

## Phase 4: User Story 3 - 抽選と履歴提示を正しく運用する (Priority: P1)

**Goal**: Game 画面で抽選ボタンからルーレット演出→番号確定→履歴表示までを重複なしで完結させる。

**Independent Test**: Game 画面だけで複数回抽選し、3 秒以内に結果が確定、直近 10 件と全履歴モーダルが期待通りになる。Vitest で bingoEngine フローが緑になる。

### Tests for User Story 3

- [ ] T017 [US3] Append 抽選/履歴テストケースを `docs/spec seed/requirements.md#Game画面` と spec by kiro requirements へ追記
- [ ] T018 [US3] Implement Vitest で `bingoEngine` のユニットテスト (`app/common/utils/__tests__/bingoEngine.test.ts`)

### Implementation for User Story 3

- [ ] T019 [US3] Build `bingoEngine` 本体 (`app/common/utils/bingoEngine.ts`) と `historyService` を contracts `/draws` `/history` に沿って実装
- [ ] T020 [P] [US3] Create `GameRoulette` と中央表示 UI (`app/components/game/GameRoulette.tsx`, `app/components/game/CurrentNumber.tsx`) using `react-custom-roulette`
- [ ] T021 [US3] Update `app/routes/game.tsx` loader/action と `app/components/game/HistoryPanel.tsx` を新ロジックに接続し、抽選中ボタンの状態制御を実装
- [ ] T022 [US3] Add React Testing Library integration tests (`app/routes/__tests__/game-draw.test.tsx`) で抽選/履歴/モーダル表示を検証
- [ ] T039 [US3] Capture Game 画面全体（ルーレット・履歴・右ペイン）を design.md と比較するスクリーンショットを取得し `docs/spec seed/design/` にリンク
- [ ] T040 [US3] Measure 抽選 20 回のボタン押下→確定までの時間を Chrome DevTools MCP でロギングし 3 秒以内であることを記録

**Checkpoint**: Game 画面で抽選～履歴閲覧まで単独稼働。

---

## Phase 5: User Story 4 - 景品の配布状況を一元管理する (Priority: P1)

**Goal**: Game 画面右ペインで景品表示・当選切替・視覚化を行い、localStorage と同期する。

**Independent Test**: Game 画面右ペインのみで景品を当選/戻す→取消線表示→保存が確認できる。Vitest で PrizeContext が期待通り更新される。

### Tests for User Story 4

- [ ] T023 [US4] 追加テストシナリオを `docs/spec seed/requirements.md#景品管理` へ記述し spec by kiro tasks を同期
- [ ] T024 [US4] Add Vitest suite for prize state管理 (`app/common/contexts/__tests__/PrizeContext.test.tsx`)

### Implementation for User Story 4

- [ ] T025 [US4] Implement `PrizeContext` + `usePrizeManager` (`app/common/contexts/PrizeContext.tsx`, `app/common/hooks/usePrizeManager.ts`) で contracts `/prizes/toggle` を利用
- [ ] T026 [P] [US4] Build 景品一覧 UI (`app/components/game/PrizeList.tsx`, `app/components/game/PrizeListItem.tsx`) に取消線・トグルボタンを追加
- [ ] T027 [US4] Wire Game 右ペイン (`app/components/game/SidePanel.tsx`) で PrizeContext を使用し、localStorage と同期

**Checkpoint**: 景品当選管理が Game 画面のみで完結。

---

## Phase 6: User Story 2 - BGM を場面に応じて制御する (Priority: P2)

**Goal**: Start 右上トグルで BGM のオン/オフと音量を即時反映し、localStorage に永続化する。

**Independent Test**: Start 画面のみで BGM トグルと音量調整を操作し、再読み込み後も設定が保持されることを Chrome DevTools MCP と Vitest hook テストで確認。

### Tests for User Story 2

- [ ] T013 [US2] Document BGM 制御テストを `docs/spec seed/requirements.md#BGM制御` と spec by kiro tasks に追加
- [ ] T014 [US2] Add Vitest suite for `useBGM` フック (`app/common/hooks/__tests__/useBGM.test.ts`) でオン/オフと音量 persistence を確認

### Implementation for User Story 2

- [ ] T015 [US2] Implement `BGMContext` と `useBGM` (`app/common/contexts/BGMContext.tsx`, `app/common/hooks/useBGM.ts`) で audio 要素制御と localStorage 同期を追加
- [ ] T016 [P] [US2] Create BGM トグル UI (`app/components/common/BgmToggle.tsx`) と音源配置 `public/audio/bgm.mp3`、Start 画面統合 (`app/routes/start.tsx`)
- [ ] T041 [US2] Validate BGM 再生/音量バランスを design.md の指示と一致させ、Chrome DevTools MCP で録音ログとスクリーンショットを取得

**Checkpoint**: BGM 設定は Start 単独で変更・永続できる。

---

## Phase 7: User Story 5 - 景品マスタを柔軟に編集できる (Priority: P2)

**Goal**: Setting 画面で CSV インポート/エクスポート、DnD 並び替え、一括削除を実行し、Game へ即時反映する。

**Independent Test**: Setting 画面単独で CSV 取り込み→並び替え→エクスポート→Game で反映を確認。Vitest で csvParser と DnD ハンドラを検証。

### Tests for User Story 5

- [ ] T028 [US5] 追加テストケースを `docs/spec seed/requirements.md#Setting画面` と spec by kiro counterparts に記載
- [ ] T029 [US5] Implement csvParser のユニットテスト (`app/common/utils/__tests__/csvParser.test.ts`) と Setting ルート統合テスト (`app/routes/__tests__/setting-route.test.tsx`)

### Implementation for User Story 5

- [ ] T030 [US5] Build CSV パーサー/エクスポーター本体 (`app/common/utils/csvParser.ts`) と prizeService import/export 実装 (`app/common/services/prizeService.ts`)
- [ ] T031 [US5] Implement Setting route layout と DnD 並び替え (`app/routes/setting.tsx`, `app/components/setting/PrizeSortableList.tsx`) using `@dnd-kit/core`
- [ ] T032 [P] [US5] Create CSV 操作用コンポーネント (`app/components/setting/CsvControls.tsx`) とエクスポート/インポートダイアログ UI
- [ ] T033 [US5] Add 一括削除 UI + 確認ダイアログ (`app/components/setting/BulkActions.tsx`) と localStorage 更新
- [ ] T034 [US5] Ensure Setting と Game の状態同期 (`app/common/contexts/PrizeContext.tsx`, `app/routes/game.tsx`) を import/export の結果で再描画
- [ ] T042 [US5] Capture Setting 画面の Grid/DnD/CSV UI を design.md と比較したスクリーンショットを取得しリンクを共有
- [ ] T043 [US5] Measure CSV インポート→Game 反映までの時間を 3 セット計測し 30 秒以内であることを記録
- [ ] T044 [US5] Collect 景品担当者の簡易満足度アンケート（10 名想定）を実施し結果を `docs/spec seed/requirements.md` に記載

**Checkpoint**: Setting 画面のみで景品マスタを運用可能。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 仕上げと横断的品質向上

- [ ] T035 Run `npm run similarity` で重複検出し、必要な共通化を `app/components/**` および `app/common/**` に反映、結果を `docs/spec seed/requirements.md` テスト欄へ記録
- [ ] T036 Perform accessibility/audio バランス調整（キーボード操作、コントラスト、音量）と quickstart.md 更新 (`app/components/**`, `public/audio/`, `specs/001-align-spec/quickstart.md`)

---

## Dependencies & Execution Order

1. **Phase 1 → Phase 2**: Setup 完了後に型/サービス骨格を構築。
2. **Phase 2 → User Stories**: LocalStorage とサービス骨格がそろったら US1〜US5 を優先度順に着手。
3. **User Story order**: US1 (Start) → US3 (抽選) → US4 (景品管理) → US2 (BGM) → US5 (Setting)。US2 は Start UI が整った時点で平行進行可、US4/US5 は PrizeContext 共有のため US3 後に着手。
4. **Polish**: すべてのストーリーが完了したら最終仕上げ。

### Dependency Graph
- Setup → Foundational → US1 (base session)
- US1 → (US3, US2)
- US3 → US4 → US5
- Polish depends on all user stories

## Parallel Execution Examples
- US1 実装中に UI (T011) とテスト (T012) はサービス実装完了後に並列可能。
- US2 では BGM トグル UI (T016) を hook 実装 (T015) と並列進行。
- US3 では GameRoulette UI (T020) を Game route 更新 (T021) と同時進行可能。
- US4 は PrizeContext (T025) 完了後に UI (T026) とテスト (T024) を並列化。
- US5 では CSV コントロール (T032) と BulkActions (T033) を並行し、Setting route 本体 (T031) に順次統合。

## Implementation Strategy
- **MVP**: Phase 3 (US1) 完了で Start 画面による新規/再開フローと sessionService を提供。
- **Incremental Delivery**: US3 で抽選/履歴、US4 で景品管理、US2 で BGM、US5 で CSV/Setting を追加し、各フェーズごとに Chrome DevTools MCP で検証。
- **Testing Discipline**: 各 US のテストタスクを最初に実行し、Vitest + React Testing Library で failure-first を徹底。Chrome DevTools MCP を quickstart.md の順で再現。
- **Quality Gates**: Phase 8 で similarity チェックとアクセシビリティ検証を実施し、全ストーリーの独立テスト結果を PR に添付。
