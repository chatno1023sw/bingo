# Repository Guidelines

## 共通設定
- ターミナルに出力する言葉はすべて日本語で出力してください
- 実装はbiome.jsのlinter/formatterに準拠した形で実装すること

## プロジェクト構成とモジュール配置
主要ソースは `app/` に集約し、`root.tsx` が HTML シェルとメタ情報、`app/routes/` が React Router v7 のルート (`start`, `game`, `setting`) を担当します。各ルートは loader/action/コンポーネントのみを記述し、抽選ロジックや UI パーツは `app/common` や `app/components` (必要に応じて新設) へ分離してください。静的アセットは `public/`、要件と画面モックは `docs/spec seed/requirements.md` および `docs/spec seed/design/design.md` を参照して実装を揃えます。設定ファイル (`react-router.config.ts`, `tsconfig.json`, `vite.config.ts`) はリポジトリ直下で統一管理し、MCP 関連は `.codex` と `mcp.config.json` を更新して共有します。

## ビルド・テスト・開発コマンド
- `npm install`：React Router / Vite / Tailwind / MCP 関連ツールの依存関係を取得。
- `npm run dev`：Chrome 最新版向け HMR サーバーを `http://localhost:5173` で起動 (start/game/setting のナビを確認)。
- `npm run build`：`build/client` と `build/server` に本番成果物を出力。
- `npm run start`：`react-router-serve ./build/server/index.js` で本番バンドルを検証。
- `npm run typecheck`：`react-router typegen` → `tsc --noEmit` の順でルート型とユーティリティ (GameState/Prize/BGMSettings など) の整合をチェック。

## コーディングスタイルと命名規約
仕様書は「ドキュメント言語=日本語」のため、コメント/TSDoc も日本語で統一します。TypeScript + 2 スペースインデント + named export を基本とし、文字列はダブルクォーテーション。`~/` エイリアスは `app/` にマップされるため深い相対パスを避ける際に使用します。Start/Game/Setting 各画面の UI は Tailwind Utility を用いて `docs/spec seed/design/design.md` のモックに合わせ、Setting 画面は `<table>` 禁止なので Flex/Grid で「テーブル風」レイアウトを実装します。CSV 入出力やルーレット演出は `requirements.md` の該当章 (2,4,5 章) に沿って命名・構成してください。

## テスト指針
Spec では「TDD + Chrome DevTools MCP」が必須です。各機能着手時に `docs/spec seed/requirements.md` へテストシナリオを追記するか、対象モジュール直下にコメントとして記述し、`npm run typecheck` と MCP 上の動作確認を完了してから実装を進めます。`bingoEngine` や `csvParser` などユーティリティはテストシナリオ→実装→スクリーンショット共有の順で進め、重大な手順は `docs/spec seed/requirements.md` の該当セクションに補記してください。

## コミットとプルリクエストガイドライン
Git ログは `add: ...` や `update: ...` など動詞プレフィックスで揃っています。`docs/spec seed/requirements.md` で定義されたドメイン単位 (例: `feature/domain-02-utils`) ごとにブランチを切り、タスク完了ごとに小さくコミットします。すべてのコミットは github-mcp-server を通じて実行し、PR には概要、関連ドメイン/タスク番号、Chrome DevTools MCP 検証結果、`npm run typecheck` と `npm run build` の通過状況、UI 変更時のスクリーンショット、CSV や環境変数の変更内容を必ず含めてください。

## セキュリティと設定の注意
運用形態は「ローカル環境完結 + オフライン要件あり」(要件 1.3) です。外部 API を導入する際はオフライン fallback を用意し、ネットワーク依存が発生した場合は `requirements.md` に理由と緩和策を追記します。景品 CSV は個人情報を含む可能性があるため `.gitignore` 済みのパスを利用し、共有時はダミーデータに置き換えてください。BGM やサウンドを追加する場合は `public/` に配置し、ライセンス表記を `requirements.md` の付録や README に追記して再配布可否を明示します。

## Active Technologies
- TypeScript 5.9 + React 19（React Router v7、Vite） + React Router v7、Tailwind CSS、react-custom-roulette、@mui/icons-material、@dnd-kit/core、mizchi/similarity、Vite、Chrome DevTools MCP (001-align-spec)
- ブラウザ localStorage（バージョン付きキー）＋ CSV ファイル（`data/prizes.csv` 想定） (001-align-spec)
- TypeScript 5.9 + React 19（Vite/React Router v7） + Biome CLI, react-hook-form, Chrome DevTools MCP, Playwright MCP, Node.js/npm (001-editorconfig-biome)
- Git リポジトリ上のソースコード・docs（設定ファイルのみ） (001-editorconfig-biome)

## Recent Changes
- 001-align-spec: Added TypeScript 5.9 + React 19（React Router v7、Vite） + React Router v7、Tailwind CSS、react-custom-roulette、@mui/icons-material、@dnd-kit/core、mizchi/similarity、Vite、Chrome DevTools MCP
