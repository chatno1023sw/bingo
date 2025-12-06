# Tasks: コードスタイル指針とフォーム運用

**Input**: Design documents from `/specs/001-editorconfig-biome/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/formatting.md, quickstart.md
**Cipher MCP Entry**: `TODO` (byterover-cipher, 最終同期: TODO)

**Tests**: Add dedicated test tasks only if the spec requests additional automation; this feature relies on Chrome DevTools MCP evidence + npm scripts.
**Organization**: Tasks are grouped by user story (US1–US3) with shared Setup/Foundational phases and a final polish phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task can run in parallel (different files, no dependency conflicts)
- **[Story]**: User story label (US1, US2, US3). Setup/Foundational/Polish tasks omit the label.
- Include exact file paths in all descriptions.
- 記載タスク/証跡は byterover-cipher にも同期し、ID を plan/spec/tasks へ反映すること。
- 各タスク完了時に単独コミットと `docs/result/001-editorconfig-biome/<task>/YYYYMMDD-HHMM_<tool>.log|png` 証跡を残すこと。
- Chrome DevTools MCP を主要テストに、必要に応じて Playwright MCP (Chromium) を併用すること。

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish evidence tracking + governance required by the implementation plan.

- [ ] T001 Capture the feature summary in byterover-cipher and embed the entry ID + sync date into `specs/001-editorconfig-biome/plan.md` と `specs/001-editorconfig-biome/spec.md` のメタデータに追記する。
- [X] T002 Author `docs/result/001-editorconfig-biome/README.md` with the Chrome DevTools MCP / Playwright MCP evidence naming rules (`YYYYMMDD-HHMM_<tool>.log|png`) and storage expectations.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared documentation updates that every user story depends on.

- [X] T003 Update `docs/spec seed/requirements.md` の共通テスト/証跡章に `docs/result/001-editorconfig-biome/<task>/` への保存義務と Chrome DevTools MCP + Playwright MCP の利用手順を追加する。
- [X] T004 Extend `README.md` with a "Code Quality Workflow" overview that links to `docs/result/001-editorconfig-biome/README.md` and enumerates prerequisite tools before the story-specific sections.

---

## Phase 3: User Story 1 - 編集者はどの IDE でも同一フォーマットを得られる (Priority: P1) 🎯 MVP

**Goal**: Provide a repository-wide EditorConfig policy so every IDE/CLI enforces identical formatting.

**Independent Test**: VSCode で TypeScript ファイルを保存し `.editorconfig` の 2 スペース/LF 設定が有効、CLI で `npm run format:check` を実行して違反ファイルが検知されることを Chrome DevTools MCP で確認する。

### Implementation for User Story 1

- [X] T005 [US1] Create `.editorconfig` at the repository root defining 2-space indentation, UTF-8, LF, trailing whitespace trim, and per-pattern overrides for `*.ts`, `*.tsx`, `*.json`, `*.md` per `specs/001-editorconfig-biome/research.md`.
- [X] T006 [P] [US1] Document EditorConfig installation (VSCode extension + CLI verification via `npm run format:check`) inside the Coding Standards section of `README.md`, referencing `.editorconfig` and evidence storage.
- [X] T007 [P] [US1] Describe the EditorConfig policy, multi-IDE guidance, and git diff evidence steps within `docs/spec seed/requirements.md` (sections 1.3 / FR-001 / FR-002) pointing to `docs/result/001-editorconfig-biome/<task>/`.

---

## Phase 4: User Story 2 - Biome による lint/format を共通基準にできる (Priority: P1)

**Goal**: Configure Biome as the single lint/format tool (Biom e RuleSet) with npm scripts + CI enforcement.

**Independent Test**: `npm run lint` と `npm run format` を実行し、Biome が設定ファイルを読み込み exit code により違反を通知することを Chrome DevTools MCP で証跡化する。

### Implementation for User Story 2

- [X] T008 [US2] Add the Biome CLI dev dependency (e.g., `@biomejs/cli`) plus matching entries in `package.json` と `package-lock.json` so lint/format scripts can invoke Biome.
- [X] T009 [US2] Create `biome.json` at the repository root extending the React/TypeScript/style presets, enforcing 2-space indentation, import sorting, and overrides defined in the BiomeRuleSet.
- [X] T010 [US2] Replace the `package.json` scripts (`lint`, `format`, `format:check`) with Biome CLI commands that return non-zero exit codes on violations and mention the required log capture under `docs/result/001-editorconfig-biome/<task>/`.
- [X] T011 [P] [US2] Expand `README.md` (Coding Standards > Biome) with command usage, expected failure output, and biome-*.log upload steps referencing `docs/result/001-editorconfig-biome/<task>/`.
- [X] T012 [P] [US2] Update `docs/spec seed/requirements.md` FR-003〜FR-005 to outline the BiomeRuleSet contents, CI/pre-commit enforcement, and EvidenceArtifact linkage.
- [X] T013 [P] [US2] Sync `specs/001-editorconfig-biome/contracts/formatting.md` so the lint/format/format:check rows reference the finalized npm script names and log filenames.

---

## Phase 5: User Story 3 - フォーム実装者は react-hook-form を基準に選択できる (Priority: P2)

**Goal**: Publish a react-hook-form adoption checklist (FormAdoptionChecklist entity) and dependencies so form owners can classify start/game/setting forms.

**Independent Test**: チェックリストを参照して対象フォームの入力数/バリデーション条件を評価し、`docs/result/001-editorconfig-biome/<task>/` に証跡を保存できること。

### Implementation for User Story 3

- [X] T014 [US3] Add `react-hook-form` と `@types/react-hook-form` への依存を `package.json` および `package-lock.json` に追加して実装がすぐに import できる状態にする。
- [X] T015 [US3] Document the FormAdoptionChecklist scoring matrix, thresholds (必須/推奨/任意), and EvidenceArtifact requirements for start/game/setting forms inside `docs/spec seed/requirements.md` (chapters 2, 4, 5).
- [X] T016 [P] [US3] Create `docs/spec seed/requirements/form-adoption-checklist.md` containing the reusable checklist template with fields (`form_id`, `input_fields_count`, `validation_complexity`, `cross_field_dependencies`, `async_submission`, `score`, `recommendation`, `evidence_path`).
- [X] T017 [P] [US3] Add a react-hook-form adoption workflow subsection to `README.md` that links to the checklist file and instructs teams to store review artifacts under `docs/result/001-editorconfig-biome/<task>/`.
- [X] T018 [P] [US3] Update `specs/001-editorconfig-biome/quickstart.md` steps to reflect the dependency installation and checklist-driven evaluation before implementing a form.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final governance + documentation alignment across all stories.

- [X] T019 Create `.github/pull_request_template.md` with checkboxes for EditorConfig sync, Biome lint/format logs, and FormAdoptionChecklist evidence links per SC-004.
- [X] T020 [P] Summarize the finalized EditorConfigPolicy / BiomeRuleSet / FormAdoptionChecklist decisions and reference the captured evidence links inside `specs/001-editorconfig-biome/research.md`.

---

## Dependencies & Execution Order

### Phase Dependencies
- Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish).
- Setup + Foundational establish governance/evidence requirements and must finish before touching story deliverables.

### User Story Dependencies
- **US1 (EditorConfig, MVP)**: Starts after Phase 2; no downstream dependencies.
- **US2 (Biome)**: Depends on US1 because Biome uses the same formatting expectations and README sections.
- **US3 (react-hook-form)**: Depends on US2 for the shared README/dependency sections but is otherwise independent once Foundational work is done.

### Within Each User Story
- Implement configuration files (e.g., `.editorconfig`, `biome.json`) before documentation updates so references stay accurate.
- Documentation tasks touching different files (`README.md`, `docs/spec seed/requirements.md`, contracts) can proceed in parallel once configuration exists.
- Capture Chrome DevTools MCP logs after each implementation deliverable before closing the task.

### Parallel Opportunities
- Setup tasks are sequential, but most Foundational and story documentation tasks flagged with [P] can run concurrently because they touch distinct files.
- After US1 completes `.editorconfig`, README/docs updates (T006, T007) can run in parallel.
- Within US2, documentation sync tasks (T011–T013) can proceed simultaneously after `biome.json` + scripts exist.
- US3 documentation updates (T015–T018) largely target different files and can be parallelized after dependencies are added.

---

## Parallel Execution Examples

### User Story 1 – EditorConfig Policy
```
Parallel Stream A: T006 (README.md guidance)
Parallel Stream B: T007 (docs/spec seed/requirements.md updates)
Prerequisite: T005 must be merged first.
```

### User Story 2 – Biome Standardization
```
Parallel Stream A: T011 (README Biome section)
Parallel Stream B: T012 (requirements FR updates)
Parallel Stream C: T013 (contracts/formatting.md sync)
Prerequisites: T008–T010 complete with working biome.json.
```

### User Story 3 – react-hook-form Adoption
```
Parallel Stream A: T015 (requirements chapters 2/4/5)
Parallel Stream B: T016 (checklist template file)
Parallel Stream C: T017–T018 (README + quickstart updates)
Prerequisite: T014 dependency installation finished.
```

---

## Implementation Strategy

### MVP First (User Story 1)
1. Complete Phase 1–2 to lock evidence governance.
2. Deliver US1 (T005–T007) to provide `.editorconfig` + documentation.
3. Capture Chrome DevTools MCP evidence for the MVP and pause for validation if needed.

### Incremental Delivery
1. After MVP, implement US2 (T008–T013) to introduce Biome scripts/configuration.
2. Next, deliver US3 (T014–T018) to roll out the react-hook-form checklist and dependencies.
3. Finish with Phase 6 polish tasks (T019–T020) to align governance artifacts and PR templates.

### Parallel Team Strategy
- One contributor can own US1 (configuration) while another prepares README/docs once `.editorconfig` is ready.
- US2 can be split between configuration (T008–T010) and documentation/contracts (T011–T013).
- US3 allows concurrent work on dependency updates, checklist authoring, and quickstart/docs sync, enabling larger teams to progress without blocking each other.
