import { Howl } from "howler";
import { useCallback, useEffect, useRef } from "react";

export type UseBgmPlayersOptions = {
  /** ドラムロール終了時の処理 */
  onDrumrollEnd?: () => void;
  /** BGM の有効状態 */
  enabled?: boolean;
  /** BGM の音量 */
  volume?: number;
  /** 音声取得失敗時のフォールバック待機時間（ミリ秒） */
  fallbackWaitMs?: number;
};

export type UseBgmPlayersResult = {
  /** ドラムロールを再生 */
  playDrumroll: () => void;
  /** ドラムロールを停止 */
  stopDrumroll: () => void;
  /** シンバルを再生 */
  playCymbal: () => void;
};

/**
 * ドラムロール/シンバルの効果音を共通管理するフック。
 *
 * - 副作用: Howler インスタンスの生成と破棄を行います。
 * - 入力制約: `onDrumrollEnd` は例外を投げない関数を渡してください。
 * - 戻り値: ドラムロール/シンバルの再生操作を返します。
 * - 音声が取得できない場合は指定時間後に抽選終了処理へ進みます。
 * - Chrome DevTools MCP では抽選開始時にドラムロール、終了時にシンバルが鳴ることを確認します。
 */
export const useBgmPlayers = (options: UseBgmPlayersOptions = {}): UseBgmPlayersResult => {
  const OTHER_SE_VOLUME_SCALE = 0.9;
  const ACCENT_SE_VOLUME_SCALE = 1.5;
  const ACCENT_SE_MIN_VOLUME = 0.4;
  const drumrollRef = useRef<Howl | null>(null);
  const cymbalRef = useRef<Howl | null>(null);
  const onDrumrollEndRef = useRef<(() => void) | null>(null);
  const handleDrumrollEndRef = useRef<() => void>(() => undefined);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackWaitRef = useRef(5000);
  const enabledRef = useRef(true);
  const volumeRef = useRef(1);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    onDrumrollEndRef.current = options.onDrumrollEnd ?? null;
  }, [options.onDrumrollEnd]);

  useEffect(() => {
    fallbackWaitRef.current = options.fallbackWaitMs ?? 5000;
  }, [options.fallbackWaitMs]);

  const applyVolume = useCallback(() => {
    const baseVolume = enabledRef.current ? volumeRef.current : 0;
    const normalVolume = baseVolume * OTHER_SE_VOLUME_SCALE;
    const accentVolume = Math.min(
      1,
      Math.max(normalVolume * ACCENT_SE_VOLUME_SCALE, ACCENT_SE_MIN_VOLUME),
    );
    if (drumrollRef.current) {
      drumrollRef.current.volume(accentVolume);
    }
    if (cymbalRef.current) {
      cymbalRef.current.volume(accentVolume);
    }
  }, []);

  const clearFallbackTimeout = useCallback(() => {
    if (!fallbackTimeoutRef.current) {
      return;
    }
    clearTimeout(fallbackTimeoutRef.current);
    fallbackTimeoutRef.current = null;
  }, []);

  const scheduleFallbackTimeout = useCallback(() => {
    clearFallbackTimeout();
    if (fallbackWaitRef.current <= 0) {
      return;
    }
    fallbackTimeoutRef.current = setTimeout(() => {
      fallbackTimeoutRef.current = null;
      handleDrumrollEndRef.current();
    }, fallbackWaitRef.current);
  }, [clearFallbackTimeout]);

  useEffect(() => {
    enabledRef.current = options.enabled ?? true;
    applyVolume();
  }, [applyVolume, options.enabled]);

  useEffect(() => {
    volumeRef.current = options.volume ?? 1;
    applyVolume();
  }, [applyVolume, options.volume]);

  const playCymbal = useCallback(() => {
    const cymbal = cymbalRef.current;
    if (!cymbal) {
      return;
    }
    if (!enabledRef.current || volumeRef.current <= 0) {
      return;
    }
    cymbal.stop();
    cymbal.seek(0);
    cymbal.play();
  }, []);

  useEffect(() => {
    handleDrumrollEndRef.current = () => {
      if (!hasStartedRef.current) {
        return;
      }
      hasStartedRef.current = false;
      clearFallbackTimeout();
      onDrumrollEndRef.current?.();
      playCymbal();
    };
  }, [clearFallbackTimeout, playCymbal]);

  useEffect(() => {
    const drumroll = new Howl({
      src: [`${import.meta.env.BASE_URL}drumroll.mp3`],
      preload: true,
      onend: () => handleDrumrollEndRef.current(),
      onloaderror: () => {
        if (fallbackWaitRef.current <= 0) {
          handleDrumrollEndRef.current();
        }
      },
      onplayerror: () => {
        if (fallbackWaitRef.current <= 0) {
          handleDrumrollEndRef.current();
        }
      },
    });
    const cymbal = new Howl({
      src: [`${import.meta.env.BASE_URL}cymbal.mp3`],
      preload: true,
    });
    drumrollRef.current = drumroll;
    cymbalRef.current = cymbal;
    applyVolume();
    return () => {
      clearFallbackTimeout();
      drumroll.unload();
      cymbal.unload();
      drumrollRef.current = null;
      cymbalRef.current = null;
    };
  }, [applyVolume, clearFallbackTimeout]);

  const playDrumroll = useCallback(() => {
    const drumroll = drumrollRef.current;
    if (!drumroll) {
      return;
    }
    hasStartedRef.current = true;
    scheduleFallbackTimeout();
    if (!enabledRef.current || volumeRef.current <= 0) {
      return;
    }
    drumroll.stop();
    drumroll.seek(0);
    drumroll.play();
  }, [scheduleFallbackTimeout]);

  const stopDrumroll = useCallback(() => {
    const drumroll = drumrollRef.current;
    if (!drumroll) {
      return;
    }
    hasStartedRef.current = false;
    clearFallbackTimeout();
    drumroll.stop();
  }, [clearFallbackTimeout]);

  return {
    playDrumroll,
    stopDrumroll,
    playCymbal,
  };
};
