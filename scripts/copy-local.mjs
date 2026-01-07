import { access, constants, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const sourceDir = path.resolve("build/client");
const targetDir = path.resolve("local");

const ensureSourceExists = async () => {
  try {
    await access(sourceDir, constants.F_OK);
  } catch {
    throw new Error("build/client が見つかりませんでした。先にビルドしてください。");
  }
};

const copyBuildToLocal = async () => {
  await ensureSourceExists();
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });
};

copyBuildToLocal()
  .then(() => {
    console.log("local にビルド成果物をコピーしました。");
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "コピーに失敗しました。");
    process.exit(1);
  });
