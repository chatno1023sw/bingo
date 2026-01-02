<!--
Sync Impact Report
- Version change: 1.4.0 → 1.4.1
- Modified principles:
  - Dual-Spec Japanese Delivery（コミット時は github-mcp-server を使用する旨を追記）
  - Test-First Offline Reliability（typecheck 後のコミット手段を github-mcp-server へ明記）
  - Workflow & Review Process（全差分コミットを github-mcp-server 経由で行うことを強制）
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - ✅ README.md（コミット手順への github-mcp-server 追記）
  - ✅ AGENTS.md（コミットガイドラインへ github-mcp-server 明記）
  - ✅ .specify/templates/tasks-template.md（タスク完了時コミット方法を更新）
  - ✅ docs/spec seed/requirements.md（GitMCP 活用節へ github-mcp-server を追記）
  - ✅ docs/result/001-editorconfig-biome/README.md（証跡記載時のコミット記述を更新）
  - ✅ specs/001-align-spec/quickstart.md（コミット手順に github-mcp-server を追加）
- Follow-up TODOs: none
-->
# Bingo抽選アプリ Constitution

## Core Principles

### Dual-Spec Japanese Delivery
- すべての機能は `docs/spec seed/requirements.md` / `docs/spec seed/design/design.md` と `docs/spec by kiro/.kiro/specs/bingo-game/*.md` を突き合わせ、差分は spec seed を一次情報として確定し、spec by kiro にも同内容を反映してから実装を開始する。
- プラン、仕様、コメント、TSDoc、PR 説明は日本語で統一し、曖昧な借用語や英語のままの指示を残さない。
- Feature ブランチはドメイン ID（例: `feature/domain-02-utils`）を採用し、コミットは github-mcp-server を使って実行したうえで、コミット・PR には参照した spec seed / spec by kiro の節番号を必ず記載する。
Rationale: 利用者が作成した spec seed と AWS Kiro が生成する spec by kiro の双方を同期させることで、仕様伝達の齟齬を排除し信頼できる進行を保証する。

### Cipher MCP Task Memory
- すべての plan/spec/tasks/tickets には開始前に cipher MCP（byterover-cipher MCP サーバー）へのメモリーエントリ（要約・該当 spec seed / spec by kiro 節番号・ブランチ名・関連 MCP コマンドログ）を作成し、当該ドキュメントから参照 ID を明記する。
- 進捗・要件変更・ブロッカー発生から 24 時間以内に byterover-cipher への記録を更新し、履歴 ID を PR／テストレポート／`docs/spec seed/requirements.md` の該当節に追記する。
- レビューや引き継ぎでは cipher MCP（byterover-cipher）の履歴を一次ソースとして参照し、欠落している場合は作業を中断し補完する。
Rationale: byterover-cipher を継続的な記憶領域として利用することで、MCP 群を跨ったタスク状況の再現性と監査性を確保し、長期的な仕様遵守を保証する。

### Route-Scoped Implementation Boundaries
- `app/routes/*` では React Router v7 の loader/action/ルートコンポーネントのみを担当し、ビジネスロジックや UI ピースは `app/common` / `app/components` へ分離する。
- 新規機能では `~/` エイリアスを活用し、`mizchi/similarity` で重複コードを検知して SRP に反する実装を撲滅する。
- `start` / `game` / `setting` の 3 画面構造は README と AGENTS.md の指針を遵守し、ルーティング契約を改変しない。
Rationale: 会場投影されるアプリの安定性を支えるため、ルート責務を厳格に限定し再利用性の高いモジュール構造を維持する。

### Test-First Offline Reliability
- 各ユーザーストーリーは failure-first のテストシナリオを `docs/spec seed/requirements.md` に追記してから着手し、`npm run typecheck` と Chrome DevTools MCP が緑になるまでマージを禁止する。
- 実装・リファクタ・バグ修正などで差分が発生したらタスク単位ですぐに `npm run typecheck` を実行し、TypeScript エラー 0 件のログを `docs/result/<ブランチ名>/<タスクID>/YYYYMMDD-HHMM_typecheck.log` に保存してから github-mcp-server を使ってコミットする。
- オフライン運用を前提に、ネットワークアクセスや外部 API 依存を組み込む場合は spec seed / spec by kiro の該当章に fallback 手順を先に記録する。
- UI やルーレット演出の検証結果（スクリーンショット・動画）は PR に添付し、再現手順を spec 文書へリンクする。
- Chrome DevTools MCP をデフォルトのテスト実行環境とし、Chrome DevTools で取得できない証跡（スクリーンショット、録画等）は Playwright MCP を利用する。その際のスクリーンショットは `apt install chromium-browser` で導入した Chromium ブラウザで取得する。
- すべてのテストログ・スクリーンショット・録画は `docs/result/<ブランチ名>/<タスクID>/` に保存し、ファイル名に日時と MCP 種別を含める。
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

### N1 Documentation & Interface Discipline
- すべての公開関数・コンポーネント・フック・クラスには TSDoc を必ず記載し、語彙・文体は日本語能力試験 N1 レベルで統一する。TSDoc には目的・副作用・引数・返り値・関連する証跡パスを明記する。
- 複雑な制御フローや副作用を含む箇所には、同じく N1 レベルの日本語で背景と意図を説明するコメントを追加し、 reviewer が読み解く時間をゼロに近づける。
- すべての関数は引数を 2 つ以下に制限し、それ以上の情報が必要な場合は interface もしくは type で定義したパラメーターオブジェクトへ集約する。
- interface / type は `app/interface/<画面ディレクトリ>/`（共通ロジックは `app/interface/shared/`）に集約し、`start` / `game` / `setting` の各画面はここから import して契約を共有する。
Rationale: 年末イベントの現場で即時に仕様追従できるよう、高密度な日本語ドキュメントと統一された型構造を維持し、読み手の属人性を排除する。

## Operational Constraints

- 技術スタックは React Router v7 + TypeScript + Vite + TailwindCSS を基盤とし、`react-custom-roulette`, `@mui/icons-material`, `@dnd-kit/core`, `mizchi/similarity` を標準ライブラリとして採用する。
- `npm run dev`, `npm run typecheck`, `npm run build`, `npm run start` を最低限の検証コマンドとし、結果を PR に記録する。
- UI 文言・コメント・ドキュメントは日本語で統一し、アクセシビリティ（キーボード操作、色コントラスト）対応を spec seed に反映する。
- 依存ライブラリ追加時はオフライン fallback を設計し、BGM/音声/フォントは `public/` にバンドル可能なライセンスのみを許可する。
- spec seed を一次情報として変更を確定しつつ、spec by kiro（requirements/design/tasks）にも同内容を即時反映し、差分を放置しない。
- Chrome DevTools MCP、GitMCP、CONTEXT7 MCP など指定 MCP ツールの結果ログを残し、開発トレースを保持する。
- cipher MCP（byterover-cipher）を公式の長期記憶として運用し、plan/spec/tasks/PR から参照できるエントリ ID を必ず記録する。

## Workflow & Review Process

- `specs/` 配下の plan/spec/tasks は Constitution Check を満たすまで進行禁止とし、spec seed と spec by kiro の該当章を引用して差分を明示したうえで要件を固める。
- `docs/spec seed/requirements.md` をテストケースと制約の一次記録源とし、`docs/spec by kiro/.kiro/specs/bingo-game/*.md` にも同じ修正を速やかに反映する。
- 各 spec/plan/tasks の公開前に cipher MCP（byterover-cipher）へのメモリーを更新し、「Cipher MCP Entry: （エントリ ID）」を明示していない成果物はレビューやマージを禁止する。
- 各タスク完了時点、またはタスクに紐づかない小さな変更であっても差分が生じたら必ず github-mcp-server を使って単独コミットを作成し、即座に push してから次の作業へ進む。コミットメッセージにはタスク ID・参照 spec 節・`docs/result/<branch>/<task>/` に保存した typecheck / テスト証跡パスを記載し、複数タスクの混在コミットを禁止する。
- PR はブランチ命名規則 (`feature/domain-xx-*`) を守り、`npm run typecheck`, `npm run build`, Chrome DevTools MCP 確認結果、スクリーンショット、CSV 変更点、参照した spec seed / spec by kiro の章番号を必須チェック項目として列挙する。
- Chrome DevTools MCP / Playwright MCP で得た結果ファイルを `docs/result/<ブランチ名>/<タスクID>/` に集約し、PR 説明にも同パスをリンクする。
- ルートファイル追加や共有モジュール更新時は AGENTS.md の構造方針を引用し、SRP を破る場合は Complexity Tracking を記入して承認を得る。
- コードレビューでは本憲章、Operational Constraints、Workflow 手順、spec seed / spec by kiro への反映状況をチェックリスト化し、逸脱時は両ドキュメントと README を同時修正する。

## Governance

- この憲章は README、AGENTS.md、spec seed、spec by kiro、その他 spec 群よりも優先され、すべての開発判断は本書へ整合させる。
- 改訂を提案する場合は、影響する原則・セクション・テンプレート、spec seed / spec by kiro の更新計画、および `npm run typecheck` / `npm run build` の最新結果を添付する。
- バージョン管理はセマンティックバージョニングに従う。原則の追加・大幅改稿は MINOR、互換性のない再定義や削除は MAJOR、文言調整・明確化は PATCH。
- ラストアメンド日は更新当日に記録し、初版の Ratified 日付は変更しない。
- コンプライアンスレビューは各マイルストーンおよび主要 PR ごとに実施し、plan/spec/tasks/requirements/README/AGENTS/spec seed/spec by kiro の整合性を確認する。違反が見つかった場合は是正計画と期限を明記し再レビューする。

**Version**: 1.4.1 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-12-06
