import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// GithubPageでホスティングする場合に必要なbasePathを設定
// ローカル開発ではbaseを常に"/"に固定する
export default defineConfig(({ command }) => {
  const basePath = command === "serve" ? "/" : (process.env.BASE_PATH ?? "/");

  return {
    base: basePath,
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
    },
  };
});
