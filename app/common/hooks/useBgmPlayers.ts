import { Howl } from "howler";
import { useCallback, useEffect, useRef } from "react";

export type UseBgmPlayersOptions = {
  /** ドラムロール終了時の処理 */
  onDrumrollEnd?: () => void;
  /** BGM の有効状態 */
  enabled?: boolean;
  /** BGM の音量 */
  volume?: number;
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
 * - Chrome DevTools MCP では抽選開始時にドラムロール、終了時にシンバルが鳴ることを確認します。
 */
export const useBgmPlayers = (options: UseBgmPlayersOptions = {}): UseBgmPlayersResult => {
  const drumrollRef = useRef<Howl | null>(null);
  const cymbalRef = useRef<Howl | null>(null);
  const onDrumrollEndRef = useRef<(() => void) | null>(null);
  const handleDrumrollEndRef = useRef<() => void>(() => undefined);
  const enabledRef = useRef(true);
  const volumeRef = useRef(1);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    onDrumrollEndRef.current = options.onDrumrollEnd ?? null;
  }, [options.onDrumrollEnd]);

  const applyVolume = useCallback(() => {
    const volume = enabledRef.current ? volumeRef.current : 0;
    if (drumrollRef.current) {
      drumrollRef.current.volume(volume);
    }
    if (cymbalRef.current) {
      cymbalRef.current.volume(volume);
    }
  }, []);

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
      onDrumrollEndRef.current?.();
      playCymbal();
    };
  }, [playCymbal]);

  useEffect(() => {
    const drumroll = new Howl({
      src: ["/drumroll.mp3"],
      preload: true,
      onend: () => handleDrumrollEndRef.current(),
      onloaderror: () => handleDrumrollEndRef.current(),
      onplayerror: () => handleDrumrollEndRef.current(),
    });
    const cymbal = new Howl({
      src: ["/cymbal.mp3"],
      preload: true,
    });
    drumrollRef.current = drumroll;
    cymbalRef.current = cymbal;
    applyVolume();
    return () => {
      drumroll.unload();
      cymbal.unload();
      drumrollRef.current = null;
      cymbalRef.current = null;
    };
  }, [applyVolume]);

  const playDrumroll = useCallback(() => {
    const drumroll = drumrollRef.current;
    if (!drumroll) {
      return;
    }
    if (!enabledRef.current || volumeRef.current <= 0) {
      return;
    }
    hasStartedRef.current = true;
    drumroll.stop();
    drumroll.seek(0);
    drumroll.play();
  }, []);

  const stopDrumroll = useCallback(() => {
    const drumroll = drumrollRef.current;
    if (!drumroll) {
      return;
    }
    hasStartedRef.current = false;
    drumroll.stop();
  }, []);

  return {
    playDrumroll,
    stopDrumroll,
    playCymbal,
  };
};
