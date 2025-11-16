# Phase 0 Research

本フェーズでは Technical Context の不明点と主要依存関係・インテグレーションについて以下の調査タスクを実施した。

1. Testing スタックの正式採用可否 → 「Vitest + React Testing Library + @react-router/test」を評価。
2. React Router v7 loader/action 境界のベストプラクティス整理。
3. Tailwind CSS でのデザイン再現とトークン管理の確認。
4. react-custom-roulette を Game 画面へ組み込む演出パターンを調査。
5. @dnd-kit/core を用いた Setting 画面 DnD 並び替えパターンの整理。
6. @mui/icons-material を BGM トグルやステータス表示へ活用するルール策定。
7. localStorage 版管理（バージョン付キー＋マイグレーション）方針の検証。
8. CSV 取り込み／エクスポート運用とバリデーションの指針確認。
9. mizchi/similarity による重複検出と SRP 維持プロセスの確認。
10. Chrome DevTools MCP を用いた TDD/E2E ワークフローの定義。

以下に意思決定をまとめる。

## 決定ログ

### Decision: Vitest + React Testing Library を正式採用し、`npm run typecheck` とは別に `vitest` スイートを追加する
- **Rationale**: React 19 + React Router v7 でも公式にサポートされており、Chrome DevTools MCP の手動検証前にロジックを失敗させられる。TS との親和性が高く、`@react-router/test-utils` と組み合わせれば loader/action のモックも容易。spec seed にある「ユニット/コンポーネントテスト + TDD」要件を満たせる。
- **Alternatives considered**: Jest（既存テンプレートだが Vite との統合が冗長）、Playwright 単独（E2E のみでロジック層の TDD が困難）。

### Decision: React Router v7 では `app/routes/*.tsx` を loader/action/ルート描画に限定し、UI やロジックは `app/common` / `app/components` へ移譲する
- **Rationale**: 憲章「Route-Scoped Implementation Boundaries」を守り、テスト対象を細分化できる。loader では localStorage や CSV からの初期値ロードのみ、action ではフォーム送信（設定保存など）の受付に限定する。
- **Alternatives considered**: ルートファイルへビジネスロジックを内包（SRP 違反、再利用困難）、Redux 等の追加ストア導入（今回の規模ではオーバーキル）。

### Decision: Tailwind CSS + design tokens（`docs/spec seed/design` ）をベースに Start/Game/Setting のレイアウトをコンポーネント化する
- **Rationale**: 仕様書が Tailwind ユーティリティ前提でモックが存在するため、Spacing/Color/Typo をトークン化して `app/components/layout` で共有すれば Experience-Parity を担保できる。
- **Alternatives considered**: CSS Modules や Styled Components を追加する案（プラスの価値より複雑性が高い）。

### Decision: react-custom-roulette を抽選演出として `GameRoulette` コンポーネント化し、抽選中の状態管理を custom hook で行う
- **Rationale**: 図示された UI と spec seed 4.2 を満たす唯一の要件。hook で抽選シーケンス（開始→演出→停止→結果確定）を管理すれば、抽選ボタンの無効化や履歴保存を一元化できる。
- **Alternatives considered**: CSS アニメーション自前実装（演出要件を満たしづらく、再利用も難しい）。

### Decision: @dnd-kit/core を Setting 画面の景品並び替えコンポーネント `PrizeSortableList` に組み込み、ドラッグハンドルを行左端に配置する
- **Rationale**: 仕様で DnDContext の使用が指定されており、@dnd-kit/core はキー操作サポートとリスト更新イベントを提供する。localStorage への保存と CSV 反映を同一イベントで処理できる。
- **Alternatives considered**: HTML5 Drag & Drop API（アクセシビリティと一貫性に欠ける）、react-beautiful-dnd（メンテ停止）。

### Decision: @mui/icons-material は BGM トグル（VolumeUp/Off）・景品状態（CheckCircle/Undo）・システムダイアログアイコンに限定して使用する
- **Rationale**: 仕様で同ライブラリが指定され、BGM や当選状態の視覚化に適している。Tailwind と組み合わせたサイズ統一で UI 一貫性を保てる。
- **Alternatives considered**: Heroicons 等への置き換え（要件違反）、画像アイコン（運用負荷増）。

### Decision: localStorage のキー命名は `bingo.v1.gameState` / `bingo.v1.prizes` / `bingo.v1.bgm` に統一し、将来のマイグレーション時は `v2` を追加する
- **Rationale**: Prize Data Stewardship に従ってバージョン付管理を明確化。キーごとに JSON スキーマを固定すれば破壊的変更を検知でき、「続きから」動作も説明しやすい。
- **Alternatives considered**: 単一キーへ全状態を保存（部分的な壊れが全体へ波及する）、IndexedDB 導入（必要十分を超える）。

### Decision: CSV I/O は spec seed 5.2 のカラムを厳密に採用し、import ではヘッダー検証 → 型チェック → 重複 ID 除外、export ではダミーデータ生成パスを案内する
- **Rationale**: 景品情報に個人情報が含まれる恐れがあるため、ダミー化とヘッダー検証をセットにすることで Stewardship を満たす。ドラッグ順序 (`order`) を常に再計算して保存することで Game 画面表示順と一致させる。
- **Alternatives considered**: 任意カラム許可（UI が壊れやすい）、JSON エクスポートのみ（仕様違反）。

### Decision: mizchi/similarity は CI/ローカルコマンドとして追加し、共通化候補を `docs/spec seed/requirements.md` のテストシナリオ欄へ記録する
- **Rationale**: 憲章で重複検出が義務付けられているため、scripts にコマンドを追加し結果で refactor 対象を列挙する運用が妥当。
- **Alternatives considered**: 手動レビューのみ（検知漏れが起きやすい）。

### Decision: Chrome DevTools MCP は E2E テスト（Start→Game→Setting→Game）および BGM/サウンド制御の確認、スクリーンショット取得に使用する
- **Rationale**: 憲章「Test-First Offline Reliability」で明示されている必須 MCP。ブラウザ上での localStorage 状態を直接検査し、ログとスクショを PR 添付する。
- **Alternatives considered**: Puppeteer 等の自動化のみ（操作ログを残しづらい）、ローカル手動確認のみ（MCP 指定違反）。

## 結論

- Testing スタックの不明点は Vitest + React Testing Library を採用する方針で解消。
- 主要依存（React Router, Tailwind, react-custom-roulette, @dnd-kit/core, @mui/icons-material, mizchi/similarity）と統合ポイント（localStorage, CSV, Chrome DevTools MCP）について具体的な実装方針を確立した。
- Phase1 では本決定を基にデータモデル・API コントラクト・クイックスタート手順を具体化する。
