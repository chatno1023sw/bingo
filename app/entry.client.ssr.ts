import { StrictMode, createElement, startTransition, useLayoutEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  type UNSAFE_AssetsManifest as AssetsManifest,
  type ClientOnErrorFunction,
  UNSAFE_createClientRoutes as createClientRoutes,
  UNSAFE_createClientRoutesWithHMRRevalidationOptOut as createClientRoutesWithHMRRevalidationOptOut,
  createHashRouter,
  UNSAFE_decodeViaTurboStream as decodeViaTurboStream,
  UNSAFE_deserializeErrors as deserializeErrors,
  UNSAFE_FrameworkContext as FrameworkContext,
  UNSAFE_getHydrationData as getHydrationData,
  UNSAFE_getPatchRoutesOnNavigationFunction as getPatchRoutesOnNavigationFunction,
  UNSAFE_getTurboStreamSingleFetchDataStrategy as getTurboStreamSingleFetchDataStrategy,
  type HydrationState,
  UNSAFE_invariant as invariant,
  UNSAFE_RemixErrorBoundary as RemixErrorBoundary,
  type UNSAFE_RouteModules as RouteModules,
  type RouterInit,
  type RouterState,
  type ServerBuild,
  type unstable_ClientInstrumentation,
  UNSAFE_useFogOFWarDiscovery as useFogOFWarDiscovery,
} from "react-router";
import { RouterProvider } from "react-router/dom";

type ReactRouterContext = {
  basename: string;
  future: ServerBuild["future"];
  routeDiscovery: ServerBuild["routeDiscovery"];
  ssr: boolean;
  isSpaMode: boolean;
  stream?: ReadableStream<Uint8Array>;
  state?: HydrationState;
};

type ReactRouterWindow = Window & {
  __reactRouterContext?: ReactRouterContext;
  __reactRouterManifest?: AssetsManifest;
  __reactRouterRouteModules?: RouteModules;
  __reactRouterDataRouter?: DataRouter;
};

type StateDecodingPromise = Promise<void> & {
  value?: boolean;
  error?: unknown;
};

type SsrInfo = {
  context: ReactRouterContext;
  manifest: AssetsManifest;
  routeModules: RouteModules;
  stateDecodingPromise?: StateDecodingPromise;
  router?: DataRouter;
  routerInitialized: boolean;
};

export type HashHydratedRouterOptions = {
  /** コンテキスト取得関数 */
  getContext?: RouterInit["getContext"];
  /** インストゥルメンテーション設定 */
  unstable_instrumentations?: unstable_ClientInstrumentation[];
};

export type HashHydratedRouterProps = HashHydratedRouterOptions & {
  /** エラーハンドラ */
  onError?: ClientOnErrorFunction;
  /** 遷移オプション */
  unstable_useTransitions?: boolean;
};

/**
 * Hash ルーターのデータルーター型です。
 */
export type DataRouter = ReturnType<typeof createHashRouter>;

let ssrInfo: SsrInfo | null = null;
let router: DataRouter | null = null;

/**
 * SSR 情報の初期化を行います。
 *
 * - 副作用: window から SSR 情報を読み込みます。
 * - 入力制約: なし。
 * - 戻り値: なし。
 * - Chrome DevTools MCP では SSR 情報が構築されることを確認します。
 */
const initSsrInfo = () => {
  const globalWindow = window as ReactRouterWindow;
  if (
    !ssrInfo &&
    globalWindow.__reactRouterContext &&
    globalWindow.__reactRouterManifest &&
    globalWindow.__reactRouterRouteModules
  ) {
    if (globalWindow.__reactRouterManifest.sri === true) {
      const importMap = document.querySelector("script[rr-importmap]");
      if (importMap?.textContent) {
        try {
          globalWindow.__reactRouterManifest.sri = JSON.parse(importMap.textContent).integrity;
        } catch (error) {
          console.error("Failed to parse import map", error);
        }
      }
    }
    ssrInfo = {
      context: globalWindow.__reactRouterContext,
      manifest: globalWindow.__reactRouterManifest,
      routeModules: globalWindow.__reactRouterRouteModules,
      stateDecodingPromise: undefined,
      router: undefined,
      routerInitialized: false,
    };
  }
};

/**
 * Hydrated 用の Hash Router を生成します。
 *
 * - 副作用: SSR 情報を利用して Router を生成します。
 * - 入力制約: `options` は HashHydratedRouterOptions を渡してください。
 * - 戻り値: DataRouter を返します。
 * - Chrome DevTools MCP では Router の生成を確認します。
 */
const createHydratedHashRouter = ({
  getContext,
  unstable_instrumentations,
}: HashHydratedRouterOptions): DataRouter => {
  initSsrInfo();
  invariant(
    ssrInfo,
    "You must be using the SSR features of React Router in order to skip passing a `router` prop to `<RouterProvider>`",
  );
  const localSsrInfo = ssrInfo;
  if (!ssrInfo.stateDecodingPromise) {
    const stream = ssrInfo.context.stream;
    invariant(stream, "No stream found for single fetch decoding");
    ssrInfo.context.stream = undefined;
    ssrInfo.stateDecodingPromise = decodeViaTurboStream(stream, window)
      .then((value) => {
        localSsrInfo.context.state = value.value as HydrationState;
        if (localSsrInfo.stateDecodingPromise) {
          localSsrInfo.stateDecodingPromise.value = true;
        }
      })
      .catch((error: unknown) => {
        if (localSsrInfo.stateDecodingPromise) {
          localSsrInfo.stateDecodingPromise.error = error;
        }
      }) as StateDecodingPromise;
  }
  if (ssrInfo.stateDecodingPromise.error) {
    throw ssrInfo.stateDecodingPromise.error;
  }
  if (!ssrInfo.stateDecodingPromise.value) {
    throw ssrInfo.stateDecodingPromise;
  }
  const state: HydrationState = ssrInfo.context.state ?? {};
  const routes = createClientRoutes(
    ssrInfo.manifest.routes,
    ssrInfo.routeModules,
    state,
    ssrInfo.context.ssr,
    ssrInfo.context.isSpaMode,
  );
  let hydrationData: HydrationState | undefined;
  if (ssrInfo.context.isSpaMode) {
    const loaderData = state.loaderData;
    if (ssrInfo.manifest.routes.root?.hasLoader && loaderData && "root" in loaderData) {
      hydrationData = {
        loaderData: {
          root: loaderData.root,
        },
      };
    }
  } else {
    hydrationData = getHydrationData({
      state,
      routes,
      getRouteInfo: (routeId) => ({
        clientLoader: ssrInfo?.routeModules[routeId]?.clientLoader,
        hasLoader: ssrInfo?.manifest.routes[routeId]?.hasLoader === true,
        hasHydrateFallback: ssrInfo?.routeModules[routeId]?.HydrateFallback != null,
      }),
      location: window.location,
      basename: ssrInfo.context.basename,
      isSpaMode: ssrInfo.context.isSpaMode,
    });
    if (hydrationData?.errors) {
      hydrationData.errors = deserializeErrors(hydrationData.errors);
    }
  }
  let hashRouter: DataRouter | undefined;
  // 初期化中に dataStrategy が参照するための暫定スタブです。
  const fallbackRouter = {
    state: {
      initialized: false,
      navigation: {
        state: "idle",
      },
    },
  } as DataRouter;
  const getHashRouter = () => hashRouter ?? fallbackRouter;
  hashRouter = createHashRouter(routes, {
    basename: ssrInfo.context.basename,
    getContext,
    hydrationData,
    future: {
      middleware: ssrInfo.context.future.v8_middleware,
    },
    dataStrategy: getTurboStreamSingleFetchDataStrategy(
      getHashRouter,
      ssrInfo.manifest,
      ssrInfo.routeModules,
      ssrInfo.context.ssr,
      ssrInfo.context.basename,
    ),
    patchRoutesOnNavigation: getPatchRoutesOnNavigationFunction(
      ssrInfo.manifest,
      ssrInfo.routeModules,
      ssrInfo.context.ssr,
      ssrInfo.context.routeDiscovery,
      ssrInfo.context.isSpaMode,
      ssrInfo.context.basename,
    ),
    unstable_instrumentations,
  });
  const resolvedHashRouter = hashRouter ?? fallbackRouter;
  ssrInfo.router = resolvedHashRouter;
  ssrInfo.routerInitialized = true;
  const hmrRouter = resolvedHashRouter as DataRouter & {
    createRoutesForHMR?: typeof createClientRoutesWithHMRRevalidationOptOut;
  };
  hmrRouter.createRoutesForHMR = createClientRoutesWithHMRRevalidationOptOut;
  (window as ReactRouterWindow).__reactRouterDataRouter = resolvedHashRouter;
  return resolvedHashRouter;
};

/**
 * Hydrated 用の Router を取得します。
 *
 * - 副作用: 初回呼び出し時に Router を生成します。
 * - 入力制約: `options` は HashHydratedRouterOptions を渡してください。
 * - 戻り値: 生成済みの Router を返します。
 * - Chrome DevTools MCP では RouterProvider が初期化されることを確認します。
 */
export const getRouter = (options: HashHydratedRouterOptions): DataRouter => {
  if (!router) {
    router = createHydratedHashRouter(options);
  }
  return router;
};

/**
 * SSR 情報を取得します。
 *
 * - 副作用: ありません。
 * - 入力制約: SSR コンテキストが初期化済みである必要があります。
 * - 戻り値: SSR 情報を返します。
 * - Chrome DevTools MCP では ssrInfo の生成を確認します。
 */
export const getSsrInfo = (): SsrInfo => {
  invariant(ssrInfo, "ssrInfo unavailable for HydratedRouter");
  return ssrInfo;
};

/**
 * Router の更新を購読します。
 *
 * - 副作用: Router の変更通知を登録します。
 * - 入力制約: `dataRouter` は getRouter の戻り値を渡してください。
 * - 戻り値: 購読解除関数を返します。
 * - Chrome DevTools MCP では location 変化時の更新を確認します。
 */
export const subscribeRouter = (
  dataRouter: DataRouter,
  listener: (state: RouterState) => void,
): (() => void) => {
  return dataRouter.subscribe(listener);
};

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
  return createElement(
    FrameworkContext.Provider,
    {
      value: {
        manifest: ssrInfo.manifest,
        routeModules: ssrInfo.routeModules,
        future: ssrInfo.context.future,
        criticalCss: undefined,
        ssr: ssrInfo.context.ssr,
        isSpaMode: ssrInfo.context.isSpaMode,
        routeDiscovery: ssrInfo.context.routeDiscovery,
      },
    },
    createElement(
      RemixErrorBoundary,
      { location },
      createElement(RouterProvider, {
        router,
        unstable_useTransitions: props.unstable_useTransitions,
        onError: props.onError,
      }),
    ),
  );
}

/**
 * SSR 用クライアントのハイドレーションを開始します。
 *
 * - 副作用: hydrateRoot を実行して Router を起動します。
 * - 入力制約: SSR 向けの HTML が描画済みである必要があります。
 * - 戻り値: なし。
 * - Chrome DevTools MCP では RouterProvider が起動することを確認します。
 */
export const hydrateHashRouter = (): void => {
  startTransition(() => {
    hydrateRoot(document, createElement(StrictMode, null, createElement(HashHydratedRouter, null)));
  });
};
