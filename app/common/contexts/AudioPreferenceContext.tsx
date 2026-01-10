import { createContext, useContext, type FC, type PropsWithChildren } from "react";
import { audioSettings } from "~/common/constants/audio";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";
import { storageKeys } from "~/common/utils/storage";

export type AudioPreferenceEntry = ReturnType<typeof useBgmPreference>;

export type AudioPreferenceContextValue = {
  /** Start ビューの BGM 設定 */
  startBgm: AudioPreferenceEntry;
  /** Game ビューの BGM 設定 */
  gameBgm: AudioPreferenceEntry;
  /** 効果音・ボタン音設定 */
  sound: AudioPreferenceEntry;
};

const AudioPreferenceContext = createContext<AudioPreferenceContextValue | null>(null);

export const AudioPreferenceProvider: FC<PropsWithChildren> = ({ children }) => {
  const startBgm = useBgmPreference({
    storageKey: storageKeys.bgmStart,
    defaultVolume: audioSettings.bgm.defaultVolume,
  });
  const gameBgm = useBgmPreference({
    defaultVolume: audioSettings.bgm.defaultVolume,
  });
  const sound = useBgmPreference({
    storageKey: storageKeys.se,
    defaultVolume: audioSettings.se.defaultVolume,
  });

  return (
    <AudioPreferenceContext.Provider value={{ startBgm, gameBgm, sound }}>
      {children}
    </AudioPreferenceContext.Provider>
  );
};

export const useAudioPreferences = (): AudioPreferenceContextValue => {
  const value = useContext(AudioPreferenceContext);
  if (!value) {
    throw new Error("useAudioPreferences は AudioPreferenceProvider 内で使用してください");
  }
  return value;
};
