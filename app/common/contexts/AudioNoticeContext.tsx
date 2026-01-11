import { createContext, useContext, useState, type FC, type PropsWithChildren } from "react";

export const AUDIO_NOTICE_ACK_KEY = "bingo.v1.audioNoticeAck";
export const AUDIO_NOTICE_INIT_PATH_KEY = "bingo.v1.audioNoticeInitialPath";

const getSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage ?? null;
};

const readAcknowledged = (): boolean => {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }
  return storage.getItem(AUDIO_NOTICE_ACK_KEY) === "1";
};

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
  const [acknowledged, setAcknowledged] = useState<boolean>(() => readAcknowledged());

  const markAcknowledged = () => {
    setAcknowledged(true);
    const storage = getSessionStorage();
    storage?.setItem(AUDIO_NOTICE_ACK_KEY, "1");
  };

  return (
    <AudioNoticeContext.Provider value={{ acknowledged, markAcknowledged }}>
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
