import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const configuredBinary = process.env.SIMILARITY_BIN;
const vendoredBinary = join(
  root,
  "vendor",
  "mizchi-similarity",
  "target",
  "release",
  "similarity-ts",
);

const binary = configuredBinary ?? (existsSync(vendoredBinary) ? vendoredBinary : null);

if (!binary) {
  console.error(
    [
      "[similarity] similarity-ts バイナリが見つかりません。",
      "次のいずれかで準備してください:",
      "  1. `cargo install --path vendor/mizchi-similarity/crates/similarity-ts --locked --force` を実行",
      "  2. もしくは環境変数 SIMILARITY_BIN でバイナリパスを指定 (例: SIMILARITY_BIN=/usr/local/bin/similarity-ts)",
    ].join("\n"),
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const defaultTargets = ["app", "docs"];

const child = spawn(binary, args.length > 0 ? args : defaultTargets, {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[similarity] process terminated by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(`[similarity] 実行に失敗しました: ${error.message}`);
  process.exit(1);
});
