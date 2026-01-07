import type { BgmPreference } from "~/common/types";
import { readStorageJson, storageKeys, writeStorageJson } from "~/common/utils/storage";

const DEFAULT_SE_VOLUME = 0.2;

/**
 * ボタン効果音の設定を取得します。
 *
 * - 副作用: localStorage を読み取ります。
 * - 入力制約: ありません。
 * - 戻り値: BgmPreference を返します。
 * - Chrome DevTools MCP では localStorage の値を確認します。
 */
export const getSoundEffectPreference = (): BgmPreference => {
  const stored = readStorageJson<BgmPreference | null>(storageKeys.se, null);
  if (stored) {
    return stored;
  }
  const fallback: BgmPreference = {
    enabled: true,
    volume: DEFAULT_SE_VOLUME,
    updatedAt: new Date().toISOString(),
  };
  writeStorageJson(storageKeys.se, fallback);
  return fallback;
};
