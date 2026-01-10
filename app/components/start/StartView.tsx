import { Howl } from "howler";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";
import {
  hasStoredDrawHistory,
  hasStoredGameState,
  hasStoredPrizeSelection,
  resumeSession,
  startSession,
} from "~/common/services/sessionService";
import { storageKeys } from "~/common/utils/storage";
import { AudioNoticeDialog } from "~/components/common/AudioNoticeDialog";
import { BgmControl } from "~/components/common/BgmControl";
import { consumeStartBgmUnlock, markGameBgmUnlock } from "~/common/utils/audioUnlock";
import {
  hasAudioNoticeAcknowledged,
  markAudioNoticeAcknowledged,
} from "~/common/utils/audioNoticeState";
import { StartMenu } from "~/components/start/StartMenu";
import { StartOverDialog } from "~/components/start/StartOverDialog";
import {
  muteSoundDetailPreference,
  resetSoundDetailPreference,
} from "~/common/services/soundDetailPreferenceService";

export type StartViewProps = {
  /** Game ビューへ切り替える */
  onShowGame: () => void;
  /** Setting 画面へ遷移する */
  onNavigateSetting: () => void;
};

export const StartView: FC<StartViewProps> = ({ onShowGame, onNavigateSetting }) => {
  const [startOverDialogOpen, setStartOverDialogOpen] = useState(false);
  const [audioNoticeOpen, setAudioNoticeOpen] = useState(() => !hasAudioNoticeAcknowledged());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [shouldResumeBgm, setShouldResumeBgm] = useState(() => consumeStartBgmUnlock());
  const [isBgmReady, setIsBgmReady] = useState(false);
  const bgmRef = useRef<Howl | null>(null);
  const bgmPlayingRef = useRef(false);
  const bgmPendingRef = useRef(false);
  const bgmUnlockAttachedRef = useRef(false);
  const {
    preference,
    isReady,
    setVolume: setStartBgmVolume,
  } = useBgmPreference({
    storageKey: storageKeys.bgmStart,
    defaultVolume: audioSettings.bgm.defaultVolume,
  });
  const { setVolume: setGameBgmVolume } = useBgmPreference({
    defaultVolume: audioSettings.bgm.defaultVolume,
  });
  const { preference: soundPreference, setVolume: setSoundVolume } = useBgmPreference({
    storageKey: storageKeys.se,
    defaultVolume: audioSettings.se.defaultVolume,
  });

  const acknowledgeAudioNotice = useCallback(() => {
    markAudioNoticeAcknowledged();
    setAudioNoticeOpen(false);
  }, []);

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

  const handleStartRequest = () => {
    if (isSubmitting) {
      return;
    }
    if (hasStoredGameState() || hasStoredDrawHistory() || hasStoredPrizeSelection()) {
      setStartOverDialogOpen(true);
      return;
    }
    void handleStart();
  };

  const handleResumeConfirm = async () => {
    acknowledgeAudioNotice();
    setIsSubmitting(true);
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
    bgm.volume(preference.volume * audioSettings.bgm.startVolumeScale);
    if (preference.volume > 0) {
      if (!bgmPlayingRef.current) {
        requestBgmPlay();
      }
      return;
    }
    if (bgmPlayingRef.current) {
      bgm.stop();
      bgmPlayingRef.current = false;
    }
  }, [preference.volume, requestBgmPlay]);

  useEffect(() => {
    if (!shouldResumeBgm) {
      return;
    }
    if (!isBgmReady) {
      return;
    }
    if (audioNoticeOpen) {
      return;
    }
    if (preference.volume <= 0) {
      setShouldResumeBgm(false);
      return;
    }
    requestBgmPlay();
    setShouldResumeBgm(false);
  }, [audioNoticeOpen, isBgmReady, preference.volume, requestBgmPlay, shouldResumeBgm]);

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
    void syncBgmVolume(audioSettings.bgm.defaultVolume);
    void setSoundVolume(audioSettings.se.defaultVolume);
    resetSoundDetailPreference();
    requestBgmPlay();
  }, [acknowledgeAudioNotice, requestBgmPlay, setSoundVolume, syncBgmVolume]);

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
          preference={preference}
          soundPreference={soundPreference}
          isReady={isReady}
          onVolumeChange={handleStartBgmVolumeChange}
          onSoundVolumeChange={setSoundVolume}
          useDialog
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
          void handleStart();
        }}
        disabled={isSubmitting}
      />
      <AudioNoticeDialog
        open={audioNoticeOpen}
        onClose={acknowledgeAudioNotice}
        onMuteAll={handleMuteAllAudio}
        onEnableAll={handleEnableAllAudio}
      />
    </main>
  );
};
