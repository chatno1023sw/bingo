# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Cipher MCP（byterover-cipher）メモリー運用

- byterover-cipher MCP サーバーを起動し、plan/spec/tasks/PR すべての開始前にエントリを作成してください。
- 進捗や要求変更が発生したら 24 時間以内に同エントリへ追記し、ID を各ドキュメントヘッダーに「Cipher MCP Entry」として記録します。
- レビュワーは byterover-cipher の履歴が最新であることを確認できない場合、実装レビューを進めてはいけません。

## テスト・コミット運用

- 各タスク完了ごと、またはタスクに紐づかない変更であっても差分が発生した時点で単独コミットを作成し、コミットメッセージへタスク ID・参照 spec 節・`docs/result/<branch>/<task>/` の証跡パスを含めます。
- コミット前に必ず `npm run typecheck` を実行して TypeScript エラーが無いことを確認し、ログを `docs/result/<branch>/<task>/YYYYMMDD-HHMM_typecheck.log` として保存して PR から参照します。
- Chrome DevTools MCP をデフォルトの検証環境とし、Chrome DevTools で取得できない証跡（スクリーンショット等）は Playwright MCP を利用してください。その際は `apt install chromium-browser` で導入した Chromium ブラウザからスクリーンショットを取得します。
- テストログ・スクリーンショット・動画などの結果ファイルは必ず `docs/result/<branch>/<task>/` に配置し、PR からリンクします。

## Code Quality Workflow

1. `.editorconfig` と `biome.json` をリポジトリ直下に配置し、VSCode の EditorConfig 拡張を有効化する。CLI では `npm run format:check` で差分を検出する。
2. Lint/Format は Biome CLI を唯一の基準とし、`npm run lint` / `npm run format` / `npm run format:check` を実行する。各コマンドのログは `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_biome-*.log` へ保存する。
3. Chrome DevTools MCP / Playwright MCP のログおよびスクリーンショット命名ルールは `docs/result/001-editorconfig-biome/README.md` を参照し、PR のチェックリストに証跡パスを必ず記載する。

### EditorConfig の導入手順

- VSCode: 拡張機能「EditorConfig for VS Code」をインストールし、保存時に `.editorconfig` の 2 スペース / LF / UTF-8 / 末尾改行・末尾スペース削除ルールが適用されることを確認する。
- CLI: `npm run format:check` を実行して EditorConfig 違反（末尾スペースやインデントずれ）が無いか確認し、違反が見つかった場合は `npm run format` で修正後にコミットする。
- 証跡: これらの操作ログ・スクリーンショットを `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_chromedevtools.log|png` に保存し、PR 説明にリンクを記載する。

### Biome Lint / Format

- `npm run lint`: `biome lint --error-on-warnings --files-ignore-unknown=true .` を実行し、静的解析違反がある場合は exit code ≠0 で失敗する。実行ログは `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_biome-lint.log` に保存する。
- `npm run format`: `biome format --write --files-ignore-unknown=true .` を実行し、自動整形後の差分のみが git に残ることを確認する。修正結果のスクリーンショットも取得する。
- `npm run format:check`: `biome check --write=false --files-ignore-unknown=true .` により未整形ファイルを検知し、exit code ≠0 で失敗する。検出ログは `..._biome-format-check.log` として保存し、PR で提示する。

### react-hook-form 採用フロー

1. `docs/spec seed/requirements/form-adoption-checklist.md` のテンプレートを複製し、`form_id`（start/game/setting 等）ごとに入力数・バリデーション複雑度を記録する。
2. score が 3 以上の場合は react-hook-form を必須採用とし、UI の動作ログ／スクリーンショットを `docs/result/001-editorconfig-biome/<task-id>/` に保存、PR 説明に `evidence_path` を掲載する。
3. score が 2 の場合は推奨としてバックログへ移行タスクを登録し、score が変化したら Checklist を更新する。Start など score <=1 のフォームでも判断ログを残す。

### TSDoc / Interface ガイドライン

- すべての公開関数・コンポーネント・フックには必ず TSDoc を記載し、表現は日本語能力試験 N1 レベルの語彙で簡潔かつ正確にまとめます。TSDoc 未整備のコードはレビュー対象外です。
- アルゴリズムや副作用が複雑な箇所には、同じく N1 レベルの日本語で背景や意図を説明するコメントを残します。
- すべての関数は引数を 2 つ以下に制限し、それ以上の情報が必要な場合は interface もしくは type で定義したパラメーターオブジェクトへ集約します。
- interface / type 定義は `app/interface/<画面ディレクトリ>/`（例: `app/interface/start/`, `app/interface/game/`, `app/interface/setting/`, 共通は `app/interface/shared/`）にまとめ、実装側はこれらを import して利用します。

## Building for Production

Create a production build:

```bash
npm run build
```

## Similarity チェック（mizchi/similarity）

コードの重複検出は `mizchi/similarity`（similarity-ts）を用いた `npm run similarity` コマンドで行います。

1. Rust (cargo) をインストールします。
2. このリポジトリ同梱の `vendor/mizchi-similarity` からバイナリをビルドします:

```bash
cargo install --path vendor/mizchi-similarity/crates/similarity-ts --locked --force
```

3. 以降は `npm run similarity` を実行すると、`app` と `docs` 配下をスキャンします。対象を絞りたい場合は引数を渡してください（例：`npm run similarity -- app/common app/components`）。

`similarity-ts` バイナリを別パスで管理する場合は、環境変数 `SIMILARITY_BIN` に実行パスを指定してください。

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
