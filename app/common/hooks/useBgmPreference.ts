import { useCallback, useEffect, useState } from "react";
import type { BgmPreference } from "~/common/types";
import {
  createDefaultBgmPreference,
  getBgmPreference,
  saveBgmPreference,
} from "~/common/services/bgmService";

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
  /** エラーメッセージ */
  error: string | null;
};

/**
 * Start 画面などで BGM 設定を制御するカスタムフック。
 *
 * - `localStorage` の `bingo.v1.bgm` を読み書きする副作用があります。
 * - 初回マウント時に `getBgmPreference` で状態を復元し、オフラインでも動作します。
 * - Chrome DevTools MCP では `localStorage.getItem("bingo.v1.bgm")` を確認してトグル状態を検証します。
 */
export const useBgmPreference = (): UseBgmPreferenceResult => {
  const [preference, setPreference] = useState<BgmPreference>(() => createDefaultBgmPreference());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getBgmPreference()
      .then((pref) => {
        if (!mounted) {
          return;
        }
        setPreference(pref);
        setIsReady(true);
      })
      .catch((err) => {
        if (!mounted) {
          return;
        }
        setPreference(createDefaultBgmPreference());
        setIsReady(true);
        setError(toErrorMessage(err));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggle = useCallback(async () => {
    const next: BgmPreference = {
      ...preference,
      enabled: !preference.enabled,
      updatedAt: new Date().toISOString(),
    };
    setPreference(next);
    try {
      await saveBgmPreference(next);
      setError(null);
    } catch (err) {
      setPreference(preference);
      setError(toErrorMessage(err));
    }
  }, [preference]);

  return { preference, isReady, toggle, error };
};
