import { Howl } from "howler";
import { useCallback, useEffect, useMemo, useState } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";
import {
  muteSoundDetailPreference,
  resetSoundDetailPreference,
  saveSoundDetailPreference,
  type SoundDetailPreference,
} from "~/common/services/soundDetailPreferenceService";
import type { VolumeSliderConfig } from "~/components/common/BgmControl";

export type UseGameSoundDetailParams = {
  /** 初期音量詳細 */
  initialDetail: SoundDetailPreference;
  /** 現在の BGM 音量 */
  bgmVolume: number;
  /** 現在の効果音音量 */
  soundVolume: number;
  /** 音量通知ダイアログを既読にする操作 */
  acknowledgeAudioNotice: () => void;
  /** BGM 音量を更新する操作 */
  setBgmVolume: (volume: number) => Promise<void>;
  /** 効果音音量を更新する操作 */
  setSoundVolume: (volume: number) => Promise<void>;
  /** BGM を再生する操作 */
  requestBgmPlay: () => void;
};

export type UseGameSoundDetailResult = {
  /** 音声読み上げ音量 */
  voiceVolume: number;
  /** ドラムロール音量スケール */
  drumrollVolumeScale: number;
  /** シンバル音量スケール */
  cymbalVolumeScale: number;
  /** 音量スライダー設定 */
  extraSoundSliders: VolumeSliderConfig[];
  /** すべての音量をミュートする */
  handleMuteAllAudio: () => void;
  /** 既定の音量へ復元する */
  handleEnableAllAudio: () => void;
  /** BGM 音量を変更する */
  handleGameBgmVolumeChange: (volume: number) => Promise<void>;
  /** 音量詳細をデフォルトへ戻す */
  resetSoundDetailToDefault: () => void;
};

/**
 * ゲーム画面の音量詳細状態を管理します。
 *
 * - 副作用: localStorage へ音量詳細を保存します。
 * - 入力制約: 音量値は 0〜2 の範囲で扱います。
 * - 戻り値: 音量値と操作関数を返します。
 * - Chrome DevTools MCP では音量ダイアログの操作が反映されることを確認します。
 */
export const useGameSoundDetail = ({
  initialDetail,
  bgmVolume,
  soundVolume,
  acknowledgeAudioNotice,
  setBgmVolume,
  setSoundVolume,
  requestBgmPlay,
}: UseGameSoundDetailParams): UseGameSoundDetailResult => {
  const [voiceVolume, setVoiceVolume] = useState<number>(initialDetail.voiceVolume);
  const [drumrollVolumeScale, setDrumrollVolumeScale] = useState<number>(
    initialDetail.drumrollVolumeScale,
  );
  const [cymbalVolumeScale, setCymbalVolumeScale] = useState<number>(
    initialDetail.cymbalVolumeScale,
  );

  const computeBaseSoundVolume = useCallback(() => {
    if (soundVolume <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, soundVolume)) * audioSettings.se.baseVolumeScale;
  }, [soundVolume]);

  const playSampleOnce = useCallback((path: string, volume: number) => {
    if (volume <= 0) {
      return;
    }
    const sample = new Howl({
      src: [resolveAudioPath(path)],
      volume: Math.min(1, Math.max(0, volume)),
      html5: true,
    });
    const cleanup = () => {
      sample.off("end", cleanup);
      sample.off("loaderror", cleanup);
      sample.off("playerror", cleanup);
      sample.unload();
    };
    sample.on("end", cleanup);
    sample.on("loaderror", cleanup);
    sample.on("playerror", cleanup);
    sample.play();
  }, []);

  const computeDrumrollVolume = useCallback(() => {
    if (drumrollVolumeScale <= 0) {
      return 0;
    }
    const baseVolume = computeBaseSoundVolume();
    return Math.min(
      1,
      Math.max(0, baseVolume * drumrollVolumeScale * audioSettings.se.drumrollBoost),
    );
  }, [computeBaseSoundVolume, drumrollVolumeScale]);

  const computeCymbalVolume = useCallback(() => {
    if (cymbalVolumeScale <= 0) {
      return 0;
    }
    const baseVolume = computeBaseSoundVolume();
    return Math.min(1, Math.max(0, baseVolume * cymbalVolumeScale * audioSettings.se.cymbalBoost));
  }, [computeBaseSoundVolume, cymbalVolumeScale]);

  const computeVoiceSampleVolume = useCallback(() => {
    if (soundVolume <= 0 || voiceVolume <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, voiceVolume * audioSettings.number.voicePlaybackScale));
  }, [soundVolume, voiceVolume]);

  const playDrumrollSample = useCallback(() => {
    const volume = computeDrumrollVolume();
    playSampleOnce(audioPaths.se.drumroll, volume);
  }, [computeDrumrollVolume, playSampleOnce]);

  const playCymbalSample = useCallback(() => {
    const volume = computeCymbalVolume();
    playSampleOnce(audioPaths.se.cymbal, volume);
  }, [computeCymbalVolume, playSampleOnce]);

  const playVoiceSample = useCallback(() => {
    const volume = computeVoiceSampleVolume();
    playSampleOnce(audioPaths.sample.voice, volume);
  }, [computeVoiceSampleVolume, playSampleOnce]);

  useEffect(() => {
    saveSoundDetailPreference({
      voiceVolume,
      drumrollVolumeScale,
      cymbalVolumeScale,
    });
  }, [voiceVolume, drumrollVolumeScale, cymbalVolumeScale]);

  const extraSoundSliders: VolumeSliderConfig[] = useMemo(
    () => [
      {
        label: "ドラムロール",
        value: drumrollVolumeScale,
        onChange: setDrumrollVolumeScale,
        sampleControl: {
          ariaLabel: "ドラムロールのサンプル音を再生",
          onPlay: playDrumrollSample,
          disabled: soundVolume <= 0 || drumrollVolumeScale <= 0,
        },
        min: 0,
        max: 2,
        step: 0.05,
      },
      {
        label: "シンバル",
        value: cymbalVolumeScale,
        onChange: setCymbalVolumeScale,
        sampleControl: {
          ariaLabel: "シンバルのサンプル音を再生",
          onPlay: playCymbalSample,
          disabled: soundVolume <= 0 || cymbalVolumeScale <= 0,
        },
        min: 0,
        max: 2,
        step: 0.05,
      },
      {
        label: "音声読み上げ",
        value: voiceVolume,
        onChange: setVoiceVolume,
        sampleControl: {
          ariaLabel: "音声読み上げのサンプルを再生",
          onPlay: playVoiceSample,
          disabled: soundVolume <= 0 || voiceVolume <= 0,
        },
        min: 0,
        max: 1,
        step: 0.01,
      },
    ],
    [
      cymbalVolumeScale,
      drumrollVolumeScale,
      playCymbalSample,
      playDrumrollSample,
      playVoiceSample,
      soundVolume,
      voiceVolume,
    ],
  );

  const handleGameBgmVolumeChange = useCallback(
    async (volume: number) => {
      await setBgmVolume(volume);
      if (volume > 0) {
        requestBgmPlay();
      }
    },
    [requestBgmPlay, setBgmVolume],
  );

  const handleMuteAllAudio = useCallback(() => {
    acknowledgeAudioNotice();
    void setBgmVolume(0);
    void setSoundVolume(0);
    const muted = muteSoundDetailPreference();
    setVoiceVolume(muted.voiceVolume);
    setDrumrollVolumeScale(muted.drumrollVolumeScale);
    setCymbalVolumeScale(muted.cymbalVolumeScale);
  }, [acknowledgeAudioNotice, setBgmVolume, setSoundVolume]);

  const handleEnableAllAudio = useCallback(() => {
    acknowledgeAudioNotice();
    const restoredBgmVolume = bgmVolume > 0 ? bgmVolume : audioSettings.bgm.defaultVolume;
    const restoredSoundVolume = soundVolume > 0 ? soundVolume : audioSettings.se.defaultVolume;
    void setBgmVolume(restoredBgmVolume);
    void setSoundVolume(restoredSoundVolume);
    const defaults = resetSoundDetailPreference();
    setVoiceVolume(defaults.voiceVolume);
    setDrumrollVolumeScale(defaults.drumrollVolumeScale);
    setCymbalVolumeScale(defaults.cymbalVolumeScale);
    requestBgmPlay();
  }, [
    acknowledgeAudioNotice,
    bgmVolume,
    requestBgmPlay,
    setBgmVolume,
    setSoundVolume,
    soundVolume,
  ]);

  const resetSoundDetailToDefault = useCallback(() => {
    void handleGameBgmVolumeChange(audioSettings.bgm.defaultVolume);
    void setSoundVolume(audioSettings.se.defaultVolume);
    const defaults = resetSoundDetailPreference();
    setVoiceVolume(defaults.voiceVolume);
    setDrumrollVolumeScale(defaults.drumrollVolumeScale);
    setCymbalVolumeScale(defaults.cymbalVolumeScale);
  }, [handleGameBgmVolumeChange, setSoundVolume]);

  return {
    voiceVolume,
    drumrollVolumeScale,
    cymbalVolumeScale,
    extraSoundSliders,
    handleMuteAllAudio,
    handleEnableAllAudio,
    handleGameBgmVolumeChange,
    resetSoundDetailToDefault,
  };
};
