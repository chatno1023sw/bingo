# Quickstart: Bingo抽選アプリ仕様整備

## 1. 仕様同期
1. `docs/spec seed/requirements.md` と `docs/spec by kiro/.kiro/specs/bingo-game/*.md` を開き、今回の feature で参照する章に変更がないか確認する。
2. 差分があれば spec seed を一次情報として更新し、spec by kiro 側へも同内容を反映してから作業ブランチ `001-align-spec` を最新にする。

## 2. 環境セットアップ
1. Node.js 20.x をインストール。
2. 依存取得: `npm install`
3. 推奨 VSCode 拡張: Tailwind CSS IntelliSense, ESLint, Vitest。
4. localStorage を初期化する場合は Chrome DevTools で `localStorage.clear()` を実行。

## 3. 開発フロー
1. **テスト駆動**: 各ユーザーストーリーを着手する前に `docs/spec seed/requirements.md` へテストシナリオを追記。
2. **ユニット/コンポーネントテスト**: `npx vitest run` で失敗を確認 → 実装 → パスを確認。
3. **型検証**: `npm run typecheck`（`react-router typegen` → `tsc`）。
4. **ローカル実行**: `npm run dev`、Chrome で `http://localhost:5173` を開き、Start→Game→Setting の順で操作。
5. **E2E / MCP**: Chrome DevTools MCP でスクリーンショットと localStorage 状態を取得し、PR 添付用に保存。

## 4. データ運用
1. localStorage キー: `bingo.v1.gameState`, `bingo.v1.prizes`, `bingo.v1.bgm`。破損時は該当キーのみ削除。
2. CSV: `data/prizes.csv`（ダミー）。カラム順 `id,order,prizeName,itemName,imagePath,selected,memo` を厳守。
3. Import: Setting 画面で CSV を選択。ファイルが不正な場合はスキップ理由をモーダルで確認。
4. Export: Setting 画面右上の「CSV エクスポート」から取得し、共有前にダミーへ差し替え。

## 5. UI とオーディオ
1. Tailwind トークンは `app/components/layout/tokens.ts`（予定）に集約。追加時は設計ドキュメントへ追記。
2. BGM/効果音/画像は `public/audio`・`public/images` に配置し、ライセンス情報を `docs/spec seed/requirements.md` の付録へ追記。
3. `react-custom-roulette` のスタイルは Game 画面専用モジュールに閉じ込め、ラベルやカラーは `docs/spec seed/design` のモック値に合わせる。

## 6. コミット & PR
1. ドメイン単位で小さくコミットし、メッセージには参照した spec seed / spec by kiro の章番号を記す。
2. PR には以下を必ず添付:
   - `npm run typecheck` 結果
   - `npx vitest run` 結果
   - Chrome DevTools MCP スクリーンショット / 動画
   - UI 変更のスクリーンショット
   - 変更した CSV / 環境変数の説明
3. ルーティング構成や localStorage キーを変更する場合は、Complexity Tracking へ理由を記載して承認を得る。
