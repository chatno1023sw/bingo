import { createContext, useContext, useState, type FC, type PropsWithChildren } from "react";

export type AudioNoticeContextValue = {
  /** ダイアログをすでに確認したか */
  acknowledged: boolean;
  /** 確認済みに更新する */
  markAcknowledged: () => void;
};

const AudioNoticeContext = createContext<AudioNoticeContextValue | null>(null);

/**
 * 音確認ダイアログの表示状態を管理するコンテキストです。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: Provider で包んだ子孫に状態を提供します。
 * - Chrome DevTools MCP では Start/Game 両方で表示同期されることを確認します。
 */
export const AudioNoticeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <AudioNoticeContext.Provider
      value={{ acknowledged, markAcknowledged: () => setAcknowledged(true) }}
    >
      {children}
    </AudioNoticeContext.Provider>
  );
};

export const useAudioNotice = (): AudioNoticeContextValue => {
  const context = useContext(AudioNoticeContext);
  if (!context) {
    throw new Error("useAudioNotice は AudioNoticeProvider 内で使用してください");
  }
  return context;
};
