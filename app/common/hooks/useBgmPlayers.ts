import { Howl } from "howler";
import { useCallback, useEffect, useRef } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";

export type UseBgmPlayersOptions = {
  /** ドラムロール終了時の処理 */
  onDrumrollEnd?: () => void;
  /** シンバル終了時の処理 */
  onCymbalEnd?: () => void;
  /** BGM の有効状態 */
  enabled?: boolean;
  /** BGM の音量 */
  volume?: number;
  /** ドラムロール音量の倍率 */
  drumrollVolumeScale?: number;
  /** シンバル音量の倍率 */
  cymbalVolumeScale?: number;
  /** 音声取得失敗時のフォールバック待機時間（ミリ秒） */
  fallbackWaitMs?: number;
};

export type UseBgmPlayersResult = {
  /** ドラムロールを再生 */
  playDrumroll: () => void;
  /** ドラムロールを停止 */
  stopDrumroll: () => void;
  /** ドラムロールの再生時間（ミリ秒）を取得 */
  getDrumrollDurationMs: () => number;
  /** シンバルを再生 */
  playCymbal: () => void;
};

/**
 * ドラムロール/シンバルの効果音を共通管理するフック。
 *
 * - 副作用: Howler インスタンスの生成と破棄を行います。
 * - 入力制約: `onDrumrollEnd` は例外を投げない関数を渡してください。
 * - 入力制約: `onCymbalEnd` は例外を投げない関数を渡してください。
 * - 戻り値: ドラムロール/シンバルの再生操作を返します。
 * - 音声が取得できない場合は指定時間後に抽選終了処理へ進みます。
 * - Chrome DevTools MCP では抽選開始時にドラムロール、終了時にシンバルが鳴ることを確認します。
 */
export const useBgmPlayers = (options: UseBgmPlayersOptions = {}): UseBgmPlayersResult => {
  const drumrollRef = useRef<Howl | null>(null);
  const cymbalRef = useRef<Howl | null>(null);
  const onDrumrollEndRef = useRef<(() => void) | null>(null);
  const onCymbalEndRef = useRef<(() => void) | null>(null);
  const handleDrumrollEndRef = useRef<() => void>(() => undefined);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackWaitRef = useRef<number>(audioSettings.se.fallbackWaitMs);
  const enabledRef = useRef(true);
  const volumeRef = useRef(1);
  const drumrollVolumeScaleRef = useRef<number>(audioSettings.se.drumrollVolumeScale);
  const cymbalVolumeScaleRef = useRef<number>(audioSettings.se.cymbalVolumeScale);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    onDrumrollEndRef.current = options.onDrumrollEnd ?? null;
  }, [options.onDrumrollEnd]);

  useEffect(() => {
    onCymbalEndRef.current = options.onCymbalEnd ?? null;
  }, [options.onCymbalEnd]);

  useEffect(() => {
    fallbackWaitRef.current = options.fallbackWaitMs ?? audioSettings.se.fallbackWaitMs;
  }, [options.fallbackWaitMs]);

  const applyVolume = useCallback(() => {
    const baseVolume = enabledRef.current ? volumeRef.current : 0;
    const masterVolume = baseVolume * audioSettings.se.baseVolumeScale;
    const drumrollVolume = Math.min(1, Math.max(0, masterVolume * drumrollVolumeScaleRef.current));
    const cymbalVolume = Math.min(1, Math.max(0, masterVolume * cymbalVolumeScaleRef.current));
    if (drumrollRef.current) {
      drumrollRef.current.volume(drumrollVolume);
    }
    if (cymbalRef.current) {
      cymbalRef.current.volume(cymbalVolume);
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

  useEffect(() => {
    drumrollVolumeScaleRef.current =
      options.drumrollVolumeScale ?? audioSettings.se.drumrollVolumeScale;
    cymbalVolumeScaleRef.current = options.cymbalVolumeScale ?? audioSettings.se.cymbalVolumeScale;
    applyVolume();
  }, [applyVolume, options.cymbalVolumeScale, options.drumrollVolumeScale]);

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

  const getDrumrollDurationMs = useCallback(() => {
    const drumroll = drumrollRef.current as (Howl & { duration?: () => number }) | null;
    const durationSeconds = drumroll?.duration?.() ?? 0;
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return 0;
    }
    return durationSeconds * 1000;
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
      src: [resolveAudioPath(audioPaths.se.drumroll)],
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
      src: [resolveAudioPath(audioPaths.se.cymbal)],
      preload: true,
      onend: () => {
        onCymbalEndRef.current?.();
      },
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
    getDrumrollDurationMs,
    playCymbal,
  };
};
