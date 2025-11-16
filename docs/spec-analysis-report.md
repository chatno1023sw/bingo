## 仕様・計画・タスク統合分析レポート（001-align-spec）

### 発見事項一覧

| ID | カテゴリ | 重大度 | 箇所 | 要約 | 推奨アクション |
|----|----------|--------|------|------|----------------|
| D1 | 一貫性 | 中 | plan.md:62-67, tasks.md:33-115 | 計画の依存順（US1→US3→US4→US2→US5）とタスク実行順（US1→US2→US3→US4→US5）が矛盾し、段取りが曖昧。 | どちらかに統一して依存グラフも更新する。 |
| C1 | カバレッジ不足 | 高 | spec.md:132-140, tasks.md:145-173 | 成功指標SC-002/SC-004（抽選3秒以内、CSV反映30秒＋満足度90%）を検証するタスクが存在せず、受け入れ基準が測定不能。 | パフォーマンス計測・UX調査タスクを追加し指標を検証可能にする。 |
| C2 | カバレッジ不足 | 中 | spec.md:136-141, tasks.md:120-173 | SC-005（復元100%）を担保する再読込シナリオのテストが無い。 | 連続リロードで状態を確認するE2E/統合タスクを追加。 |
| U1 | 仕様不足 | 低 | spec.md（エッジケース） | CSV取込エラー時のUI挙動が定義されず、タスク(T030-T033)が共通指針を持たない。 | 受入条件にエラー通知仕様を明記。 |
| T1 | 用語/指針の揺れ | 中 | plan.md:18-23, tasks.md Phase順 | 「US2は並列開始可」と「フェーズ順で順次実行」が混在し、着手順が曖昧。 | 並列可否を一本化しドキュメント全体で整合させる。 |
| K1 | 憲章順守 | 致命 | tasks.md:145-173 vs 憲章Experience-Parity | 画面毎にモック準拠を検証する明示的タスクがなく、憲章「Experience-Parity UI & Audio」のMUSTを満たしていない。 | Start/Game/Setting 各画面のモック照合・音量調整タスクを追加し、design.md参照を明記。 |

### カバレッジ概要

| 要件キー | タスク有無 | 対応タスク | 備考 |
|----------|------------|-------------|------|
| start-reset-resume-flow | Yes | T007-T012 | Startロジック＋テストあり |
| bgm-toggle-persistence | Yes | T013-T016 | BGM Hook/Context/テストあり |
| draw-roulette-history | Yes | T017-T022 | bingoEngine/履歴/UI/テストあり |
| prize-state-management | Yes | T023-T027 | PrizeContextとUIあり |
| setting-csv-operations | Yes | T028-T034 | CSV import/export + DnDあり |
| offline-localstorage-versioning | Partial | T005 のみ | リロード復元の統合テスト無し |
| performance-3s-draw | No | — | 計測タスクなし |
| csv-30s-update-satisfaction | No | — | UX検証タスクなし |
| design-parity-ui | Partial | T011/T016/T020/T026/T031 | 明示的検証タスクなし |
| similarity-check-process | Yes | T035 | 憲章対応済み |

### 未解決の憲章向け課題

- Experience-Parity UI & Audio: 各画面が design.md 通りか確認するタスクが存在せず、MUST要件を満たしていない（K1）。
- Test-First Offline Reliability: 成功指標SC-002/004/005に対するテストタスクが不足（C1/C2）。

### 次のアクション例

1. **憲章違反是正**（K1）  
   - Start/Game/Setting それぞれにモック照合＋音量/演出確認タスクを追記。
2. **非機能要件のテスト追加**（C1/C2）  
   - 抽選3秒計測、CSV反映30秒検証、ユーザ満足度アンケート準備、連続リロードE2Eをtasks.mdへ追加。
3. **依存順の統一**（D1/T1）  
   - planとtasksのフェーズ順を一致させ、並列進行可否を再定義。
4. **CSVエラーUI要件追記**（U1）  
   - spec.mdのEdge Casesに「CSVエラー時のユーザ通知/再試行手順」を明記。

ご要望があれば、上位課題に対する具体的な修正案（spec/plan/tasksのどこをどう直すか）も追ってご提案できます。
