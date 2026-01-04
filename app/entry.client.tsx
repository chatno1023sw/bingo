import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import GameRoute from "~/routes/game";
import SettingRoute from "~/routes/setting";
import StartRoute from "~/routes/start";
import App from "~/root";

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
