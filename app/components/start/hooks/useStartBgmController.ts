import { useCallback } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";
import { useUnlockableBgm } from "~/common/hooks/useUnlockableBgm";

export type UseStartBgmControllerParams = {
  /** BGM 音量 */
  volume: number;
  /** BGM 音量の同期処理 */
  syncVolume: (volume: number) => Promise<void>;
};

export type UseStartBgmControllerResult = {
  requestBgmPlay: () => void;
  handleVolumeChange: (volume: number) => void;
  handleMuteAll: () => void;
  handleResume: () => void;
  isReady: boolean;
};

export const useStartBgmController = ({ volume, syncVolume }: UseStartBgmControllerParams) => {
  const { requestPlay, resumeAudioContext, isReady } = useUnlockableBgm({
    src: resolveAudioPath(audioPaths.bgm.start),
    volume,
    volumeScale: audioSettings.bgm.startVolumeScale,
  });

  const handleVolumeChange = useCallback(
    (nextVolume: number) => {
      void syncVolume(nextVolume);
      if (nextVolume > 0) {
        requestPlay();
      }
    },
    [requestPlay, syncVolume],
  );

  const handleMuteAll = useCallback(() => {
    void syncVolume(0);
  }, [syncVolume]);

  return {
    requestBgmPlay: requestPlay,
    handleVolumeChange,
    handleMuteAll,
    handleResume: resumeAudioContext,
    isReady,
  };
};
