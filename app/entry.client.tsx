import { StrictMode, startTransition, useLayoutEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  RouterProvider,
  createHashRouter,
  type ClientOnErrorFunction,
  type FutureConfig,
  type HydrationState,
  type Router,
  type RouterInit,
  type ServerBuild,
  type unstable_ClientInstrumentation,
  UNSAFE_FrameworkContext as FrameworkContext,
  UNSAFE_RemixErrorBoundary as RemixErrorBoundary,
  UNSAFE_createClientRoutes as createClientRoutes,
  UNSAFE_createClientRoutesWithHMRRevalidationOptOut as createClientRoutesWithHMRRevalidationOptOut,
  UNSAFE_decodeViaTurboStream as decodeViaTurboStream,
  UNSAFE_deserializeErrors as deserializeErrors,
  UNSAFE_getHydrationData as getHydrationData,
  UNSAFE_getPatchRoutesOnNavigationFunction as getPatchRoutesOnNavigationFunction,
  UNSAFE_getTurboStreamSingleFetchDataStrategy as getTurboStreamSingleFetchDataStrategy,
  UNSAFE_invariant as invariant,
  UNSAFE_useFogOFWarDiscovery as useFogOFWarDiscovery,
  type UNSAFE_AssetsManifest as AssetsManifest,
  type UNSAFE_RouteModules as RouteModules,
} from "react-router";

type ReactRouterContext = {
  basename: string;
  future: FutureConfig;
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
  __reactRouterDataRouter?: Router;
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
  router?: Router;
  routerInitialized: boolean;
};

type HashHydratedRouterOptions = {
  getContext?: RouterInit["getContext"];
  unstable_instrumentations?: unstable_ClientInstrumentation[];
};

type HashHydratedRouterProps = HashHydratedRouterOptions & {
  onError?: ClientOnErrorFunction;
  unstable_useTransitions?: boolean;
};

let ssrInfo: SsrInfo | null = null;
let router: Router | null = null;

function initSsrInfo() {
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
}

function createHydratedHashRouter({
  getContext,
  unstable_instrumentations,
}: HashHydratedRouterOptions): Router {
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
        ssrInfo.context.state = value.value;
        localSsrInfo.stateDecodingPromise?.value = true;
      })
      .catch((error: unknown) => {
        localSsrInfo.stateDecodingPromise?.error = error;
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
  const hashRouter = createHashRouter(routes, {
    basename: ssrInfo.context.basename,
    getContext,
    hydrationData,
    future: {
      middleware: ssrInfo.context.future.v8_middleware,
    },
    dataStrategy: getTurboStreamSingleFetchDataStrategy(
      () => hashRouter,
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
  ssrInfo.router = hashRouter;
  ssrInfo.routerInitialized = true;
  const hmrRouter = hashRouter as Router & {
    createRoutesForHMR?: typeof createClientRoutesWithHMRRevalidationOptOut;
  };
  hmrRouter.createRoutesForHMR = createClientRoutesWithHMRRevalidationOptOut;
  (window as ReactRouterWindow).__reactRouterDataRouter = hashRouter;
  return hashRouter;
}

function HashHydratedRouter(props: HashHydratedRouterProps) {
  if (!router) {
    router = createHydratedHashRouter({
      getContext: props.getContext,
      unstable_instrumentations: props.unstable_instrumentations,
    });
  }
  const [location, setLocation] = useState(router.state.location);
  useLayoutEffect(() => {
    if (ssrInfo && ssrInfo.router && !ssrInfo.routerInitialized) {
      ssrInfo.routerInitialized = true;
      ssrInfo.router.initialize();
    }
  }, []);
  useLayoutEffect(() => {
    if (ssrInfo && ssrInfo.router) {
      return ssrInfo.router.subscribe((newState) => {
        if (newState.location !== location) {
          setLocation(newState.location);
        }
      });
    }
  }, [location]);
  invariant(ssrInfo, "ssrInfo unavailable for HydratedRouter");
  useFogOFWarDiscovery(
    router,
    ssrInfo.manifest,
    ssrInfo.routeModules,
    ssrInfo.context.ssr,
    ssrInfo.context.routeDiscovery,
    ssrInfo.context.isSpaMode,
  );
  return (
    <>
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
      <></>
    </>
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
