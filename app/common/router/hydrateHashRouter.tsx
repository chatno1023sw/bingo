import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HashHydratedRouter, type HashHydratedRouterProps } from "./HashHydratedRouter";

/**
 * SSR 用クライアントのハイドレーションを開始します。
 *
 * - 副作用: hydrateRoot を実行して Router を起動します。
 * - 入力制約: SSR 向けの HTML が描画済みである必要があります。
 * - 戻り値: なし。
 * - Chrome DevTools MCP では RouterProvider が起動することを確認します。
 */
export const hydrateHashRouter = (props?: HashHydratedRouterProps): void => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HashHydratedRouter {...props} />
      </StrictMode>,
    );
  });
};
