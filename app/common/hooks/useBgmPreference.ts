import { useCallback, useEffect, useState } from "react";
import type { BgmPreference } from "~/common/types";
import {
  createDefaultBgmPreference,
  getBgmPreference,
  saveBgmPreference,
} from "~/common/services/bgmService";
import { storageKeys } from "~/common/utils/storage";
import type { GameStorageKeys } from "~/common/types";

/**
 * エラーをメッセージ化します。
 *
 * - 副作用: ありません。
 * - 入力制約: `error` は unknown を想定します。
 * - 戻り値: メッセージ文字列を返します。
 * - Chrome DevTools MCP ではエラー表示を確認します。
 */
const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "unknown-error";
};

export type UseBgmPreferenceResult = {
  /** 現在の BGM 設定 */
  preference: BgmPreference;
  /** 初期化完了フラグ */
  isReady: boolean;
  /** トグル実行関数 */
  toggle: () => Promise<void>;
  /** 音量更新関数 */
  setVolume: (volume: number) => Promise<void>;
  /** エラーメッセージ */
  error: string | null;
};

export type UseBgmPreferenceOptions = {
  /** 使用する保存キー */
  storageKey?: GameStorageKeys;
  /** 読み込み時に音量を 0 にリセットするか */
  resetOnLoad?: boolean;
  /** 初期音量 */
  defaultVolume?: number;
};

/**
 * Start 画面などで BGM 設定を制御するカスタムフック。
 *
 * - `localStorage` の `bingo.v1.bgm` を読み書きする副作用があります。
 * - 初回マウント時に `getBgmPreference` で状態を復元し、オフラインでも動作します。
 * - Chrome DevTools MCP では `localStorage.getItem("bingo.v1.bgm")` を確認してトグル状態を検証します。
 */
export const useBgmPreference = (options: UseBgmPreferenceOptions = {}): UseBgmPreferenceResult => {
  const [preference, setPreference] = useState<BgmPreference>(() => createDefaultBgmPreference());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageKey = options.storageKey ?? storageKeys.bgm;
  const defaultVolume = options.defaultVolume;

  useEffect(() => {
    let mounted = true;
    getBgmPreference(storageKey, defaultVolume)
      .then((pref) => {
        if (!mounted) {
          return;
        }
        if (options.resetOnLoad && pref.volume !== 0) {
          const resetPreference: BgmPreference = {
            ...pref,
            enabled: false,
            volume: 0,
            updatedAt: new Date().toISOString(),
          };
          setPreference(resetPreference);
          void saveBgmPreference(resetPreference, storageKey);
          setIsReady(true);
          return;
        }
        setPreference(pref);
        setIsReady(true);
      })
      .catch((err) => {
        if (!mounted) {
          return;
        }
        setPreference(createDefaultBgmPreference(new Date().toISOString(), defaultVolume));
        setIsReady(true);
        setError(toErrorMessage(err));
      });

    return () => {
      mounted = false;
    };
  }, [defaultVolume, options.resetOnLoad, storageKey]);

  const toggle = useCallback(async () => {
    const next: BgmPreference = {
      ...preference,
      enabled: !preference.enabled,
      updatedAt: new Date().toISOString(),
    };
    setPreference(next);
    try {
      await saveBgmPreference(next, storageKey);
      setError(null);
    } catch (err) {
      setPreference(preference);
      setError(toErrorMessage(err));
    }
  }, [preference, storageKey]);

  const setVolume = useCallback(
    async (volume: number) => {
      const enabled = volume > 0;
      const next: BgmPreference = {
        ...preference,
        enabled,
        volume,
        updatedAt: new Date().toISOString(),
      };
      setPreference(next);
      try {
        await saveBgmPreference(next, storageKey);
        setError(null);
      } catch (err) {
        setPreference(preference);
        setError(toErrorMessage(err));
      }
    },
    [preference, storageKey],
  );

  return { preference, isReady, toggle, setVolume, error };
};
