import {
  type UNSAFE_AssetsManifest as AssetsManifest,
  UNSAFE_createClientRoutes as createClientRoutes,
  UNSAFE_createClientRoutesWithHMRRevalidationOptOut as createClientRoutesWithHMRRevalidationOptOut,
  createHashRouter,
  UNSAFE_decodeViaTurboStream as decodeViaTurboStream,
  UNSAFE_deserializeErrors as deserializeErrors,
  UNSAFE_getHydrationData as getHydrationData,
  UNSAFE_getPatchRoutesOnNavigationFunction as getPatchRoutesOnNavigationFunction,
  UNSAFE_getTurboStreamSingleFetchDataStrategy as getTurboStreamSingleFetchDataStrategy,
  type HydrationState,
  UNSAFE_invariant as invariant,
  type UNSAFE_RouteModules as RouteModules,
  type RouterInit,
  type RouterState,
  type ServerBuild,
  type unstable_ClientInstrumentation,
} from "react-router";

type ReactRouterContext = {
  basename: string;
  future: ServerBuild["future"];
  routeDiscovery: ServerBuild["routeDiscovery"];
  ssr: boolean;
  isSpaMode: boolean;
  trailingSlashAware?: boolean;
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

export type SsrInfo = {
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
    } satisfies SsrInfo;
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
      } satisfies HydrationState;
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
      ssrInfo.context.trailingSlashAware ?? false,
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
