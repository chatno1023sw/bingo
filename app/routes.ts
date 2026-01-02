import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/start.tsx", { id: "start-index" }),
  route("/start", "routes/start.tsx", { id: "start" }),
  route("/game", "routes/game.tsx", { id: "game" }),
  route("/setting", "routes/setting.tsx", { id: "setting" }),
] satisfies RouteConfig;
