import type { BgmPreference } from "~/common/types";
import { readStorageJson, storageKeys, writeStorageJson } from "~/common/utils/storage";

const DEFAULT_BGM_VOLUME = 0.2;

/**
 * BGM 設定のデフォルト値を生成します。
 *
 * - 副作用: ありません。
 * - 入力制約: `timestamp` は ISO 文字列を渡してください。
 * - 戻り値: BgmPreference を返します。
 * - Chrome DevTools MCP では初期値の保存を確認します。
 */
export const createDefaultBgmPreference = (
  timestamp: string = new Date().toISOString(),
): BgmPreference => ({
  enabled: true,
  volume: DEFAULT_BGM_VOLUME,
  updatedAt: timestamp,
});

/**
 * BGM 設定を取得します。
 *
 * - 副作用: localStorage を読み取ります。
 * - 入力制約: ありません。
 * - 戻り値: BgmPreference を返します。
 * - Chrome DevTools MCP では localStorage の値を確認します。
 */
export const getBgmPreference = async (): Promise<BgmPreference> => {
  const stored = readStorageJson<BgmPreference | null>(storageKeys.bgm, null);
  if (!stored) {
    const fallback = createDefaultBgmPreference();
    writeStorageJson(storageKeys.bgm, fallback);
    return fallback;
  }
  return stored;
};

/**
 * BGM 設定を保存します。
 *
 * - 副作用: localStorage に保存します。
 * - 入力制約: `preference` は BgmPreference を渡してください。
 * - 戻り値: Promise を返します。
 * - Chrome DevTools MCP では保存値を確認します。
 */
export const saveBgmPreference = async (preference: BgmPreference): Promise<void> => {
  writeStorageJson(storageKeys.bgm, preference);
};
