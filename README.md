# ビンゴゲーム

完全オフライン運用を想定したビンゴ抽選アプリです。Start/Game/Setting の 3 画面構成で、景品管理・抽選履歴・CSV 入力・BGM 設定を行います。ローカルのみでイベント運用できるツールチェーンを提供します。
- Github Pages
    - https://chatno1023sw.github.io/bingo/

## 技術スタック

- アプリ基盤
    - React 19 / React Router 7（`@react-router/node`・`@react-router/serve`）
    - TypeScript 5.9
    - Vite 7 + `vite-tsconfig-paths`
- UI / UX
    - Tailwind CSS 4 + `@tailwindcss/vite`
    - shadcn/ui コンポーネント（`shadcn`）
    - Lucide Icons（`lucide-react`）
    - `@dnd-kit/*` によるドラッグ & ドロップ、`howler` によるサウンド再生
    - `@radix-ui/react-dialog` / `@radix-ui/react-slider` を利用したモーダル・スライダー
- フォーム / 状態管理
    - `react-hook-form`（Setting 画面のフォーム制御）
    - IndexedDB とローカルストレージによる状態同期
- CSV / ユーティリティ
    - `papaparse` による CSV 読み書き
    - `isbot` での Bot 判定、`class-variance-authority` によるクラス合成
- 品質管理
    - Biome CLI（`@biomejs/biome`）で lint/format を統一
    - Vitest + React Testing Library（`@testing-library/*`, `jsdom`）

## 実行方法

Node環境で動作します。Node環境を用意して以下の手順を実行してください。

1. pnpmをインストール
    - https://pnpm.io/ja/installation
2. 依存するライブラリのインストール

    ```bash
    pnpm install
    ```

3. 開発サーバの起動

    ```bash
    npm run dev
    ```


## 完全ローカルでの実行(準備中：実行不可)

1. bingoリポジトリのReleasesからlocal-build.zipをインストール
2. ローカルサーバの構築
    - 例）VSCode
        1. VSCodeをインストール
        2. 拡張機能(LiveServerをインストール)
            - https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
        3. index.htmlを選択してVSCode右下のGo Liveを押下
