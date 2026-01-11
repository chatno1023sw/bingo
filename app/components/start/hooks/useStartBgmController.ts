import { Howl, Howler } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";

export type UseStartBgmControllerParams = {
  /** BGM 音量 */
  volume: number;
  /** BGM 音量設定関数 */
  setVolume: (volume: number) => Promise<void>;
};

export type UseStartBgmControllerResult = {
  requestBgmPlay: () => void;
  handleVolumeChange: (volume: number) => void;
  handleMuteAll: () => void;
  handleResume: () => void;
  isReady: boolean;
};

export const useStartBgmController = ({ volume, setVolume }: UseStartBgmControllerParams) => {
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

  const requestBgmPlay = useCallback(() => {
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
    requestBgmPlay();
  }, [requestBgmPlay]);

  useEffect(() => {
    const bgm = new Howl({
      src: [resolveAudioPath(audioPaths.bgm.start)],
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
  }, [handleUserUnlock]);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) {
      return;
    }
    bgm.volume(volume * audioSettings.bgm.startVolumeScale);
    if (volume > 0) {
      if (!bgmPlayingRef.current) {
        requestBgmPlay();
      }
      return;
    }
    if (bgmPlayingRef.current) {
      bgm.stop();
      bgmPlayingRef.current = false;
    }
  }, [volume, requestBgmPlay]);

  const handleVolumeChange = useCallback(
    (nextVolume: number) => {
      void setVolume(nextVolume);
      if (nextVolume > 0) {
        requestBgmPlay();
      }
    },
    [requestBgmPlay, setVolume],
  );

  const handleMuteAll = useCallback(() => {
    void setVolume(0);
  }, [setVolume]);

  return {
    requestBgmPlay,
    handleVolumeChange,
    handleMuteAll,
    handleResume: resumeAudioContext,
    isReady,
  };
};
