import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "~/root";
import GameRoute from "~/routes/game";
import SettingRoute from "~/routes/setting";
import StartRoute from "~/routes/start";
import { hydrateHashRouter } from "./entry.client.ssr";

const hydrateSpa = () => {
  const router = createHashRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <StartRoute />,
        },
        {
          path: "start",
          element: <StartRoute />,
        },
        {
          path: "game",
          element: <GameRoute />,
        },
        {
          path: "setting",
          element: <SettingRoute />,
        },
      ],
    },
  ]);

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });
};

if (import.meta.env.DEV) {
  hydrateHashRouter();
} else {
  hydrateSpa();
}
