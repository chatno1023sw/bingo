import { type FC, useLayoutEffect, useState } from "react";
import {
  type ClientOnErrorFunction,
  UNSAFE_FrameworkContext as FrameworkContext,
  UNSAFE_RemixErrorBoundary as RemixErrorBoundary,
  UNSAFE_useFogOFWarDiscovery as useFogOFWarDiscovery,
} from "react-router";
import { RouterProvider } from "react-router/dom";
import type { RouterState } from "react-router";
import {
  getRouter,
  getSsrInfo,
  subscribeRouter,
  type HashHydratedRouterOptions,
} from "./hashHydratedRouterState";

export type HashHydratedRouterProps = HashHydratedRouterOptions & {
  /** エラーハンドラ */
  onError?: ClientOnErrorFunction;
  /** 遷移オプション */
  unstable_useTransitions?: boolean;
};

/**
 * クライアント側の RouterProvider を構成します。
 *
 * - 副作用: Router の購読と初期化を行います。
 * - 入力制約: SSR 情報が初期化済みである必要があります。
 * - 戻り値: RouterProvider を返します。
 * - Chrome DevTools MCP ではハイドレーションが完了することを確認します。
 */
export const HashHydratedRouter: FC<HashHydratedRouterProps> = ({
  getContext,
  unstable_instrumentations,
  onError,
  unstable_useTransitions,
}) => {
  const router = getRouter({
    getContext,
    unstable_instrumentations,
  });
  const ssrInfo = getSsrInfo();
  const [location, setLocation] = useState(router.state.location);
  const ssrRouter = ssrInfo.router;
  const routerInitialized = ssrInfo.routerInitialized;

  useLayoutEffect(() => {
    if (ssrRouter && !routerInitialized) {
      ssrInfo.routerInitialized = true;
      ssrRouter.initialize();
    }
  }, [routerInitialized, ssrInfo, ssrRouter]);

  useLayoutEffect(() => {
    if (ssrRouter) {
      return subscribeRouter(ssrRouter, (newState: RouterState) => {
        if (newState.location !== location) {
          setLocation(newState.location);
        }
      });
    }
    return;
  }, [location, ssrRouter]);

  useFogOFWarDiscovery(
    router,
    ssrInfo.manifest,
    ssrInfo.routeModules,
    ssrInfo.context.ssr,
    ssrInfo.context.routeDiscovery,
    ssrInfo.context.isSpaMode,
  );

  return (
    <FrameworkContext.Provider
      value={{
        manifest: ssrInfo.manifest,
        routeModules: ssrInfo.routeModules,
        future: ssrInfo.context.future,
        criticalCss: undefined,
        ssr: ssrInfo.context.ssr,
        isSpaMode: ssrInfo.context.isSpaMode,
        routeDiscovery: ssrInfo.context.routeDiscovery,
      }}
    >
      <RemixErrorBoundary location={location}>
        <RouterProvider
          router={router}
          unstable_useTransitions={unstable_useTransitions}
          onError={onError}
        />
      </RemixErrorBoundary>
    </FrameworkContext.Provider>
  );
};
