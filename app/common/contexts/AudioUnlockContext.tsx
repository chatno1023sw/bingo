import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";

export type AudioUnlockContextValue = {
  /** Game BGM をユーザー操作に合わせて再生する */
  requestGameBgmPlay: () => void;
  /** Game BGM 再生ハンドラを登録する */
  registerGameBgmHandler: (handler: () => void) => () => void;
};

const AudioUnlockContext = createContext<AudioUnlockContextValue | null>(null);

/**
 * Start / Game 間で音声解禁状態を共有するコンテキストです。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: Start と Game の双方で音声再生を同期します。
 * - Chrome DevTools MCP では Start のボタン操作で Game BGM が再生されることを確認します。
 */
export const AudioUnlockProvider: FC<PropsWithChildren> = ({ children }) => {
  const handlerRef = useRef<(() => void) | null>(null);
  const [pendingPlay, setPendingPlay] = useState(false);

  const requestGameBgmPlay = useCallback(() => {
    if (handlerRef.current) {
      handlerRef.current();
      return;
    }
    setPendingPlay(true);
  }, []);

  const registerGameBgmHandler = useCallback(
    (handler: () => void) => {
      handlerRef.current = handler;
      if (pendingPlay) {
        handler();
        setPendingPlay(false);
      }
      return () => {
        if (handlerRef.current === handler) {
          handlerRef.current = null;
        }
      };
    },
    [pendingPlay],
  );

  return (
    <AudioUnlockContext.Provider
      value={{
        requestGameBgmPlay,
        registerGameBgmHandler,
      }}
    >
      {children}
    </AudioUnlockContext.Provider>
  );
};

export const useAudioUnlock = (): AudioUnlockContextValue => {
  const value = useContext(AudioUnlockContext);
  if (!value) {
    throw new Error("useAudioUnlock は AudioUnlockProvider 内で使用してください");
  }
  return value;
};
