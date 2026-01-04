import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

/**
 * ドキュメントに追加する link タグの設定を返します。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: link 設定の配列を返します。
 * - Chrome DevTools MCP では link タグが出力されることを確認します。
 */
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

/**
 * HTML シェルを構築するレイアウトです。
 *
 * - 副作用: ありません。
 * - 入力制約: `children` は ReactNode を渡してください。
 * - 戻り値: HTML を描画します。
 * - Chrome DevTools MCP では head/body が構築されることを確認します。
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <title>Bingo Game</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * ルートのエントリポイントです。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: Outlet を返します。
 * - Chrome DevTools MCP では各ルートが描画されることを確認します。
 */
export default function App() {
  return <Outlet />;
}

/**
 * ルートのエラーバウンダリです。
 *
 * - 副作用: ありません。
 * - 入力制約: `error` は Error もしくは RouteError を想定します。
 * - 戻り値: エラーメッセージを表示する JSX を返します。
 * - Chrome DevTools MCP では例外発生時の表示を確認します。
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
