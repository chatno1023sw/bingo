# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 React Router v7 + SSR + HMR（Vite）
- 🔒 TypeScript 5.9 + Vitest + React Testing Library
- 🎯 Start/Game/Setting 3 画面構成（docs/spec seed/requirements.md に沿った UI）
- 🎰 `react-custom-roulette` による抽選演出 + PrizeContext ベースの景品管理
- 🧊 Tailwind CSS・@dnd-kit/core・@mui/icons-material を利用したレスポンシブ UI
- 📦 localStorage (`bingo.v1.*`) による完全オフライン運用、CSV 入出力ユーティリティ同梱
- 🧰 Chrome DevTools MCP / Playwright MCP を用いた TDD + 手動検証フローをドキュメント化

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

## Testing & QA

```
npm run test       # Vitest suites (storage/session/game/setting など)
npm run typecheck  # react-router typegen + tsc
```

- Chrome DevTools MCP で Start/Game/Setting のシナリオを実行し、`docs/spec seed/requirements.md` に沿ってログを残してください。
- Playwright MCP が利用できる環境では `page.screenshot()` や `setInputFiles` を使って CSV 取り込み・画面キャプチャを自動化できます（SF-PRIZE/SF-SET セクション参照）。

## Building for Production

Create a production build:

```bash
npm run build
```

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
