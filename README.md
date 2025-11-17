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

- 各タスク完了ごとに単独コミットを作成し、コミットメッセージへタスク ID・参照 spec 節・`docs/result/<branch>/<task>/` の証跡パスを含めます。
- Chrome DevTools MCP をデフォルトの検証環境とし、Chrome DevTools で取得できない証跡（スクリーンショット等）は Playwright MCP を利用してください。その際は `apt install chromium-browser` で導入した Chromium ブラウザからスクリーンショットを取得します。
- テストログ・スクリーンショット・動画などの結果ファイルは必ず `docs/result/<branch>/<task>/` に配置し、PR からリンクします。

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
