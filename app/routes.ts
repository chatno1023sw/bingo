import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/start-game.tsx", { id: "start-game" }),
  route("/setting", "routes/setting.tsx", { id: "setting" }),
] satisfies RouteConfig;
