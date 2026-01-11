import { type FC, useCallback, useEffect, useState } from "react";
import { audioSettings } from "~/common/constants/audio";
import {
  hasStoredDrawHistory,
  hasStoredGameState,
  hasStoredPrizeSelection,
  resumeSession,
  startSession,
} from "~/common/services/sessionService";
import { AudioNoticeDialog } from "~/components/common/AudioNoticeDialog";
import { BgmControl } from "~/components/common/BgmControl";
import { consumeStartBgmUnlock, markGameBgmUnlock } from "~/common/utils/audioUnlock";
import { StartMenu } from "~/components/start/StartMenu";
import { StartOverDialog } from "~/components/start/StartOverDialog";
import {
  muteSoundDetailPreference,
  resetSoundDetailPreference,
} from "~/common/services/soundDetailPreferenceService";
import { useAudioNotice } from "~/common/contexts/AudioNoticeContext";
import { useAudioPreferences } from "~/common/contexts/AudioPreferenceContext";
import { useAudioUnlock } from "~/common/contexts/AudioUnlockContext";
import { useStartBgmController } from "~/components/start/hooks/useStartBgmController";

export type StartViewProps = {
  /** Game ビューへ切り替える */
  onShowGame: () => void;
  /** Setting 画面へ遷移する */
  onNavigateSetting: () => void;
};

export const StartView: FC<StartViewProps> = ({ onShowGame, onNavigateSetting }) => {
  const [startOverDialogOpen, setStartOverDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [shouldResumeBgm, setShouldResumeBgm] = useState(() => consumeStartBgmUnlock());
  const { startBgm, gameBgm, sound } = useAudioPreferences();
  const { preference: startBgmPreference, isReady, setVolume: setStartBgmVolume } = startBgm;
  const { setVolume: setGameBgmVolume } = gameBgm;
  const { preference: soundPreference, setVolume: setSoundVolume } = sound;
  const { acknowledged: audioNoticeAcknowledged, markAcknowledged } = useAudioNotice();
  const { requestGameBgmPlay } = useAudioUnlock();
  const syncBgmVolume = useCallback(
    async (volume: number) => {
      await Promise.all([setStartBgmVolume(volume), setGameBgmVolume(volume)]);
    },
    [setGameBgmVolume, setStartBgmVolume],
  );
  const {
    requestBgmPlay,
    handleVolumeChange: handleStartBgmVolumeChange,
    handleMuteAll: muteBgmVolume,
    handleResume: resumeAudioContext,
    isReady: isBgmReady,
  } = useStartBgmController({
    volume: startBgmPreference.volume,
    syncVolume: syncBgmVolume,
  });

  const acknowledgeAudioNotice = useCallback(() => {
    markAcknowledged();
  }, [markAcknowledged]);

  const handleStart = async () => {
    acknowledgeAudioNotice();
    setIsSubmitting(true);
    try {
      await startSession();
      markGameBgmUnlock();
      setIsSubmitting(false);
      onShowGame();
    } catch {
      setIsSubmitting(false);
    }
  };

  const triggerStart = () => {
    requestGameBgmPlay();
    resumeAudioContext();
    void handleStart();
  };

  const handleStartRequest = () => {
    if (isSubmitting) {
      return;
    }
    if (hasStoredGameState() || hasStoredDrawHistory() || hasStoredPrizeSelection()) {
      setStartOverDialogOpen(true);
      return;
    }
    triggerStart();
  };

  const handleResumeConfirm = async () => {
    acknowledgeAudioNotice();
    setIsSubmitting(true);
    requestGameBgmPlay();
    resumeAudioContext();
    try {
      const resumed = await resumeSession();
      if (!resumed) {
        await startSession();
      }
      markGameBgmUnlock();
      setIsSubmitting(false);
      onShowGame();
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleSetting = () => {
    onNavigateSetting();
  };

  useEffect(() => {
    setCanResume(hasStoredGameState());
  }, []);

  useEffect(() => {
    if (!shouldResumeBgm) {
      return;
    }
    if (!isBgmReady) {
      return;
    }
    if (!audioNoticeAcknowledged) {
      return;
    }
    if (startBgmPreference.volume <= 0) {
      setShouldResumeBgm(false);
      return;
    }
    requestBgmPlay();
    setShouldResumeBgm(false);
  }, [
    audioNoticeAcknowledged,
    isBgmReady,
    startBgmPreference.volume,
    requestBgmPlay,
    shouldResumeBgm,
  ]);

  const handleMuteAllAudio = useCallback(() => {
    acknowledgeAudioNotice();
    muteBgmVolume();
    void setSoundVolume(0);
    muteSoundDetailPreference();
  }, [acknowledgeAudioNotice, muteBgmVolume, setSoundVolume]);

  const handleEnableAllAudio = useCallback(() => {
    acknowledgeAudioNotice();
    const restoredBgmVolume =
      startBgmPreference.volume > 0
        ? startBgmPreference.volume
        : audioSettings.bgm.startDefaultVolume;
    const restoredSoundVolume =
      soundPreference.volume > 0 ? soundPreference.volume : audioSettings.se.defaultVolume;
    void syncBgmVolume(restoredBgmVolume);
    void setSoundVolume(restoredSoundVolume);
    resetSoundDetailPreference();
    requestBgmPlay();
  }, [
    acknowledgeAudioNotice,
    requestBgmPlay,
    setSoundVolume,
    soundPreference.volume,
    startBgmPreference.volume,
    syncBgmVolume,
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-background px-6 py-10 text-foreground">
      <header className="mb-10 flex w-full justify-end">
        <BgmControl
          preference={startBgmPreference}
          soundPreference={soundPreference}
          isReady={isReady}
          onVolumeChange={handleStartBgmVolumeChange}
          onSoundVolumeChange={setSoundVolume}
          useDialog
          onResetToDefault={() => {
            void syncBgmVolume(audioSettings.bgm.startDefaultVolume);
            void setSoundVolume(audioSettings.se.defaultVolume);
          }}
          onMuteAll={handleMuteAllAudio}
        />
      </header>
      <section className="flex flex-1 items-center justify-center">
        <StartMenu
          onStart={handleStartRequest}
          onResumeRequest={() => void handleResumeConfirm()}
          onNavigateSetting={handleSetting}
          isSubmitting={isSubmitting}
          canResume={canResume}
        />
      </section>
      <StartOverDialog
        open={startOverDialogOpen}
        onClose={() => setStartOverDialogOpen(false)}
        onConfirm={() => {
          setStartOverDialogOpen(false);
          triggerStart();
        }}
        disabled={isSubmitting}
      />
      <AudioNoticeDialog
        open={!audioNoticeAcknowledged}
        onClose={acknowledgeAudioNotice}
        onMuteAll={handleMuteAllAudio}
        onEnableAll={handleEnableAllAudio}
      />
    </main>
  );
};
