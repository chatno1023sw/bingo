import { Howl, Howler } from "howler";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";
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
  const [isBgmReady, setIsBgmReady] = useState(false);
  const bgmRef = useRef<Howl | null>(null);
  const bgmPlayingRef = useRef(false);
  const bgmPendingRef = useRef(false);
  const bgmUnlockAttachedRef = useRef(false);
  const { startBgm, gameBgm, sound } = useAudioPreferences();
  const { preference: startBgmPreference, isReady, setVolume: setStartBgmVolume } = startBgm;
  const { setVolume: setGameBgmVolume } = gameBgm;
  const { preference: soundPreference, setVolume: setSoundVolume } = sound;
  const { acknowledged: audioNoticeAcknowledged, markAcknowledged } = useAudioNotice();
  const { requestGameBgmPlay } = useAudioUnlock();

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

  const attachUnlockListeners = useCallback(() => {
    if (bgmUnlockAttachedRef.current) {
      return;
    }
    bgmUnlockAttachedRef.current = true;
    const handler = () => handleUserUnlock();
    document.addEventListener("pointerdown", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
  }, [handleUserUnlock]);

  useEffect(() => {
    const bgm = new Howl({
      src: [resolveAudioPath(audioPaths.bgm.start)],
      loop: true,
      preload: true,
      onplayerror: () => {
        bgmPendingRef.current = true;
        bgmPlayingRef.current = false;
        attachUnlockListeners();
      },
    });
    bgmRef.current = bgm;
    setIsBgmReady(true);
    return () => {
      bgm.stop();
      bgm.unload();
      bgmRef.current = null;
      setIsBgmReady(false);
    };
  }, [attachUnlockListeners]);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) {
      return;
    }
    bgm.volume(startBgmPreference.volume * audioSettings.bgm.startVolumeScale);
    if (startBgmPreference.volume > 0) {
      if (!bgmPlayingRef.current) {
        requestBgmPlay();
      }
      return;
    }
    if (bgmPlayingRef.current) {
      bgm.stop();
      bgmPlayingRef.current = false;
    }
  }, [startBgmPreference.volume, requestBgmPlay]);

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

  const syncBgmVolume = useCallback(
    async (volume: number) => {
      await Promise.all([setStartBgmVolume(volume), setGameBgmVolume(volume)]);
    },
    [setGameBgmVolume, setStartBgmVolume],
  );

  const handleMuteAllAudio = useCallback(() => {
    acknowledgeAudioNotice();
    void syncBgmVolume(0);
    void setSoundVolume(0);
    muteSoundDetailPreference();
  }, [acknowledgeAudioNotice, setSoundVolume, syncBgmVolume]);

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

  const handleStartBgmVolumeChange = useCallback(
    (volume: number) => {
      void syncBgmVolume(volume);
      if (volume > 0) {
        requestBgmPlay();
      }
    },
    [requestBgmPlay, syncBgmVolume],
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <div className="absolute top-8 right-8">
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
        />
      </div>
      <div className="flex min-h-90 items-center justify-center">
        <StartMenu
          onStart={handleStartRequest}
          onResumeRequest={() => void handleResumeConfirm()}
          onNavigateSetting={handleSetting}
          isSubmitting={isSubmitting}
          canResume={canResume}
        />
      </div>
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
