import { useEffect } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";
import { useAudioPreferences } from "~/common/contexts/AudioPreferenceContext";
import { useAudioUnlock } from "~/common/contexts/AudioUnlockContext";
import { useUnlockableBgm } from "~/common/hooks/useUnlockableBgm";
import { consumeGameBgmUnlock } from "~/common/utils/audioUnlock";

export type UseGameBgmControllerResult = {
  /** BGM 設定 */
  preference: ReturnType<typeof useAudioPreferences>["gameBgm"]["preference"];
  /** 効果音設定 */
  soundPreference: ReturnType<typeof useAudioPreferences>["sound"]["preference"];
  /** BGM 準備状態 */
  isReady: boolean;
  /** BGM 音量更新 */
  setBgmVolume: (volume: number) => Promise<void>;
  /** 効果音音量更新 */
  setSoundVolume: (volume: number) => Promise<void>;
  /** ユーザー操作で BGM 再生 */
  requestBgmPlay: () => void;
};

/**
 * Game 画面の BGM 再生と音量管理をまとめたフックです。
 *
 * - 副作用: Howl インスタンスの生成・破棄とユーザー操作の監視を行います。
 * - 入力制約: Audio コンテキストが Provider 内で初期化済みである必要があります。
 * - 戻り値: BGM/効果音の設定値と制御関数を返します。
 * - Chrome DevTools MCP では BGM がユーザー操作で再生されることを確認します。
 */
export const useGameBgmController = (): UseGameBgmControllerResult => {
  const { gameBgm, sound } = useAudioPreferences();
  const { registerGameBgmHandler } = useAudioUnlock();
  const { preference, isReady, setVolume } = gameBgm;
  const { preference: soundPreference, setVolume: setSoundVolume } = sound;
  const { requestPlay: requestBgmPlay } = useUnlockableBgm({
    src: resolveAudioPath(audioPaths.bgm.game),
    volume: preference.volume,
    volumeScale: audioSettings.bgm.gameVolumeScale,
  });

  useEffect(() => {
    if (consumeGameBgmUnlock()) {
      requestBgmPlay();
    }
  }, [requestBgmPlay]);

  useEffect(() => {
    return registerGameBgmHandler(() => {
      if (preference.volume > 0) {
        requestBgmPlay();
      }
    });
  }, [preference.volume, registerGameBgmHandler, requestBgmPlay]);

  return {
    preference,
    soundPreference,
    isReady,
    setBgmVolume: setVolume,
    setSoundVolume,
    requestBgmPlay,
  };
};
