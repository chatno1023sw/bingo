import { StrictMode, startTransition, useLayoutEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  RouterProvider,
  type RouterState,
  UNSAFE_FrameworkContext as FrameworkContext,
  UNSAFE_RemixErrorBoundary as RemixErrorBoundary,
  UNSAFE_useFogOFWarDiscovery as useFogOFWarDiscovery,
} from "react-router";
import {
  type HashHydratedRouterProps,
  getRouter,
  getSsrInfo,
  subscribeRouter,
} from "~/entry.client.ssr";

/**
 * クライアント側の RouterProvider を構成します。
 *
 * - 副作用: Router の購読と初期化を行います。
 * - 入力制約: SSR 情報が初期化済みである必要があります。
 * - 戻り値: RouterProvider を返します。
 * - Chrome DevTools MCP ではハイドレーションが完了することを確認します。
 */
function HashHydratedRouter(props: HashHydratedRouterProps) {
  const router = getRouter({
    getContext: props.getContext,
    unstable_instrumentations: props.unstable_instrumentations,
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
          unstable_useTransitions={props.unstable_useTransitions}
          onError={props.onError}
        />
      </RemixErrorBoundary>
    </FrameworkContext.Provider>
  );
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HashHydratedRouter />
    </StrictMode>,
  );
});
