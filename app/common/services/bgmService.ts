import type { BgmPreference } from "~/common/types";
import { readStorageJson, storageKeys, writeStorageJson } from "~/common/utils/storage";

const DEFAULT_BGM_VOLUME = 0.6;

/**
 * BGM 設定のデフォルト値を生成します。
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
 */
export const saveBgmPreference = async (preference: BgmPreference): Promise<void> => {
  writeStorageJson(storageKeys.bgm, preference);
};
