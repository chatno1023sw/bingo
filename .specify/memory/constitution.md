<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - Spec-Driven Japanese Delivery → Dual-Spec Japanese Delivery
  - Route-Scoped Implementation Boundaries → Route-Scoped Implementation Boundaries
  - Test-First Offline Reliability → Test-First Offline Reliability
  - Prize Data Stewardship → Prize Data Stewardship
  - Experience-Parity UI & Audio → Experience-Parity UI & Audio
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->
# Bingo抽選アプリ Constitution

## Core Principles

### Dual-Spec Japanese Delivery
- すべての機能は `docs/spec seed/requirements.md` / `docs/spec seed/design/design.md` と `docs/spec by kiro/.kiro/specs/bingo-game/*.md` を突き合わせ、差分は spec seed を一次情報として確定し、spec by kiro にも同内容を反映してから実装を開始する。  
- プラン、仕様、コメント、TSDoc、PR 説明は日本語で統一し、曖昧な借用語や英語のままの指示を残さない。  
- Feature ブランチはドメイン ID（例: `feature/domain-02-utils`）を採用し、コミット・PR には参照した spec seed / spec by kiro の節番号を必ず記載する。  
Rationale: 利用者が作成した spec seed と AWS Kiro が生成する spec by kiro の双方を同期させることで、仕様伝達の齟齬を排除し信頼できる進行を保証する。

### Route-Scoped Implementation Boundaries
- `app/routes/*` では React Router v7 の loader/action/ルートコンポーネントのみを担当し、ビジネスロジックや UI ピースは `app/common` / `app/components` へ分離する。  
- 新規機能では `~/` エイリアスを活用し、`mizchi/similarity` で重複コードを検知して SRP に反する実装を撲滅する。  
- `start` / `game` / `setting` の 3 画面構造は README と AGENTS.md の指針を遵守し、ルーティング契約を改変しない。  
Rationale: 会場投影されるアプリの安定性を支えるため、ルート責務を厳格に限定し再利用性の高いモジュール構造を維持する。

### Test-First Offline Reliability
- 各ユーザーストーリーは failure-first のテストシナリオを `docs/spec seed/requirements.md` に追記してから着手し、`npm run typecheck` と Chrome DevTools MCP が緑になるまでマージを禁止する。  
- オフライン運用を前提に、ネットワークアクセスや外部 API 依存を組み込む場合は spec seed / spec by kiro の該当章に fallback 手順を先に記録する。  
- UI やルーレット演出の検証結果（スクリーンショット・動画）は PR に添付し、再現手順を spec 文書へリンクする。  
Rationale: 新年会本番でネットワークがない環境でも確実に動くことが最優先であり、TDD とオフライン検証を徹底する必要がある。

### Prize Data Stewardship
- 景品 CSV の実データは `.gitignore` 済みのローカルパスで管理し、リポジトリには必ずダミーデータのみを残す。  
- localStorage キーはバージョン付きで設計し、マイグレーション手順・互換ポリシーを requirements / spec by kiro の両方に記録してから配布する。  
- CSV I/O と保存処理では個人情報・原価など機微情報の露出を防ぐ仕組みを実装し、README へ取り扱い手順を追記する。  
Rationale: 景品情報には機微が含まれるため、情報の扱いと同期手順を明文化しない限り安全な運用は成立しない。

### Experience-Parity UI & Audio
- `docs/spec seed/design/design.md` のモック通りに Tailwind CSS で UI を構築し、余白・色・アニメーションを定義済みトークンで統一する。  
- `start` 画面は BGM トグルとメニュー、`game` 画面は `react-custom-roulette` による抽選演出と履歴、`setting` 画面は `<table>` 非依存の DnD UI＋CSV I/O を必ず提供する。  
- BGM・効果音・`@mui/icons-material` / `@dnd-kit/core` 等の外部アセットは `public/` に格納しライセンス表記・音量設計を requirements / spec by kiro に記録する。  
Rationale: 会場で投影される演出を仕様と同一レベルで再現しなければ、利用者の期待値と乖離しイベント体験を損なう。

## Operational Constraints

- 技術スタックは React Router v7 + TypeScript + Vite + TailwindCSS を基盤とし、`react-custom-roulette`, `@mui/icons-material`, `@dnd-kit/core`, `mizchi/similarity` を標準ライブラリとして採用する。  
- `npm run dev`, `npm run typecheck`, `npm run build`, `npm run start` を最低限の検証コマンドとし、結果を PR に記録する。  
- UI 文言・コメント・ドキュメントは日本語で統一し、アクセシビリティ（キーボード操作、色コントラスト）対応を spec seed に反映する。  
- 依存ライブラリ追加時はオフライン fallback を設計し、BGM/音声/フォントは `public/` にバンドル可能なライセンスのみを許可する。  
- spec seed を一次情報として変更を確定しつつ、spec by kiro（requirements/design/tasks）にも同内容を即時反映し、差分を放置しない。  
- Chrome DevTools MCP、GitMCP、CONTEXT7 MCP など指定 MCP ツールの結果ログを残し、開発トレースを保持する。

## Workflow & Review Process

- `/specs/[feature]` 配下の plan/spec/tasks は Constitution Check を満たすまで進行禁止とし、spec seed と spec by kiro の該当章を引用して差分を明示したうえで要件を固める。  
- `docs/spec seed/requirements.md` をテストケースと制約の一次記録源とし、`docs/spec by kiro/.kiro/specs/bingo-game/*.md` にも同じ修正を速やかに反映する。  
- PR はブランチ命名規則 (`feature/domain-xx-*`) を守り、`npm run typecheck`, `npm run build`, Chrome DevTools MCP 確認結果、スクリーンショット、CSV 変更点、参照した spec seed / spec by kiro の章番号を必須チェック項目として列挙する。  
- ルートファイル追加や共有モジュール更新時は AGENTS.md の構造方針を引用し、SRP を破る場合は Complexity Tracking を記入して承認を得る。  
- コードレビューでは本憲章、Operational Constraints、Workflow 手順、spec seed / spec by kiro への反映状況をチェックリスト化し、逸脱時は両ドキュメントと README を同時修正する。

## Governance

- この憲章は README、AGENTS.md、spec seed、spec by kiro、その他 spec 群よりも優先され、すべての開発判断は本書へ整合させる。  
- 改訂を提案する場合は、影響する原則・セクション・テンプレート、spec seed / spec by kiro の更新計画、および `npm run typecheck` / `npm run build` の最新結果を添付する。  
- バージョン管理はセマンティックバージョニングに従う。原則の追加・大幅改稿は MINOR、互換性のない再定義や削除は MAJOR、文言調整・明確化は PATCH。  
- ラストアメンド日は更新当日に記録し、初版の Ratified 日付は変更しない。  
- コンプライアンスレビューは各マイルストーンおよび主要 PR ごとに実施し、plan/spec/tasks/requirements/README/AGENTS/spec seed/spec by kiro の整合性を確認する。違反が見つかった場合は是正計画と期限を明記し再レビューする。

**Version**: 1.1.0 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-11-16
