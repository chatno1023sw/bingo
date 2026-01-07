import { createContext, useContext, type FC, type PropsWithChildren } from "react";

export type SoundContextValue = {
  /** 効果音と BGM を有効にするか */
  enabled: boolean;
};

const SoundContext = createContext<SoundContextValue>({ enabled: true });

export type SoundProviderProps = PropsWithChildren<{
  /** 有効状態 */
  enabled?: boolean;
}>;

/**
 * サウンドの有効/無効を管理するコンテキストです。
 *
 * - 副作用: ありません。
 * - 入力制約: `enabled` は boolean を渡してください。
 * - 戻り値: 子要素を包むコンテキストを返します。
 * - Chrome DevTools MCP では Setting 画面で音が鳴らないことを確認します。
 */
export const SoundProvider: FC<SoundProviderProps> = ({ enabled = true, children }) => {
  return <SoundContext.Provider value={{ enabled }}>{children}</SoundContext.Provider>;
};

/**
 * サウンドの有効状態を取得します。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: `enabled` を返します。
 * - Chrome DevTools MCP では Setting 画面で false になることを確認します。
 */
export const useSoundEnabled = (): SoundContextValue => {
  return useContext(SoundContext);
};
