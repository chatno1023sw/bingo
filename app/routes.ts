import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/start.tsx"),
  route("/start", "routes/start.tsx"),
  route("/game", "routes/game.tsx"),
  route("/setting", "routes/setting.tsx"),
] satisfies RouteConfig;
