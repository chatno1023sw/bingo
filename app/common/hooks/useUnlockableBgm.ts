import { Howl, Howler } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";

export type UseUnlockableBgmOptions = {
  /** 再生する音声の絶対パス */
  src: string;
  /** 表示側で管理する音量 (0-1) */
  volume: number;
  /** Howl の内部音量スケール */
  volumeScale: number;
};

export type UseUnlockableBgmResult = {
  /** BGM 再生要求 */
  requestPlay: () => void;
  /** Howler AudioContext を再開 */
  resumeAudioContext: () => void;
  /** 現在の準備状態 */
  isReady: boolean;
};

/**
 * ユーザー操作で解禁される BGM 再生を統一的に扱うフックです。
 *
 * - 副作用: Howl インスタンスを生成し、ユーザー操作イベントを登録します。
 * - 入力制約: `src` はブラウザで再生可能なオーディオ URL を指定してください。
 * - 戻り値: 再生リクエストと準備状態を返します。
 * - Chrome DevTools MCP ではユーザー操作後に BGM が再生されることを確認します。
 */
export const useUnlockableBgm = ({
  src,
  volume,
  volumeScale,
}: UseUnlockableBgmOptions): UseUnlockableBgmResult => {
  const [isReady, setIsReady] = useState(false);
  const bgmRef = useRef<Howl | null>(null);
  const bgmPlayingRef = useRef(false);
  const bgmPendingRef = useRef(false);
  const bgmUnlockAttachedRef = useRef(false);

  const resumeAudioContext = useCallback(() => {
    const ctx = Howler.ctx;
    if (!ctx || typeof ctx.resume !== "function") {
      return;
    }
    if (ctx.state === "running") {
      return;
    }
    void ctx.resume();
  }, []);

  const requestPlay = useCallback(() => {
    const bgm = bgmRef.current;
    if (!bgm) {
      return;
    }
    const howlWithPlaying = bgm as Howl & { playing?: (id?: number) => boolean };
    if (typeof howlWithPlaying.playing === "function" && howlWithPlaying.playing()) {
      bgmPlayingRef.current = true;
      return;
    }
    bgm.play();
    bgmPlayingRef.current = true;
  }, []);

  const handleUserUnlock = useCallback(() => {
    if (!bgmPendingRef.current) {
      return;
    }
    bgmPendingRef.current = false;
    bgmUnlockAttachedRef.current = false;
    requestPlay();
  }, [requestPlay]);

  useEffect(() => {
    const bgm = new Howl({
      src: [src],
      loop: true,
      preload: true,
      onplayerror: () => {
        bgmPendingRef.current = true;
        bgmPlayingRef.current = false;
        if (bgmUnlockAttachedRef.current) {
          return;
        }
        bgmUnlockAttachedRef.current = true;
        const handler = () => handleUserUnlock();
        document.addEventListener("pointerdown", handler, { once: true });
        document.addEventListener("keydown", handler, { once: true });
      },
    });
    bgmRef.current = bgm;
    setIsReady(true);
    return () => {
      bgm.stop();
      bgm.unload();
      bgmRef.current = null;
      setIsReady(false);
    };
  }, [handleUserUnlock, src]);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) {
      return;
    }
    bgm.volume(volume * volumeScale);
    if (volume > 0) {
      if (!bgmPlayingRef.current) {
        requestPlay();
      }
      return;
    }
    if (bgmPlayingRef.current) {
      bgm.stop();
      bgmPlayingRef.current = false;
    }
  }, [requestPlay, volume, volumeScale]);

  return {
    requestPlay,
    resumeAudioContext,
    isReady,
  };
};
