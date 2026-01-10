import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";
import {
  muteSoundDetailPreference,
  resetSoundDetailPreference,
} from "~/common/services/soundDetailPreferenceService";
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
import { StartMenu } from "~/components/start/StartMenu";
import { markGameBgmUnlock } from "~/common/utils/audioUnlock";
import {
  hasAudioNoticeAcknowledged,
  markAudioNoticeAcknowledged,
} from "~/common/utils/audioNoticeState";
import { StartOverDialog } from "~/components/start/StartOverDialog";

/**
 * Start 画面のルートコンポーネント。
 *
 * - Chrome DevTools MCP の SF-START-001〜003 を想定し、BGM トグル状態を localStorage と同期します。
 * - 画面遷移の前に localStorage を更新し、ブラウザ完結のフローで開始状態を整えます。
 */
export default function StartRoute() {
  const [startOverDialogOpen, setStartOverDialogOpen] = useState(false);
  const [audioNoticeOpen, setAudioNoticeOpen] = useState(() => !hasAudioNoticeAcknowledged());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const bgmRef = useRef<Howl | null>(null);
  const bgmPlayingRef = useRef(false);
  const bgmPendingRef = useRef(false);
  const bgmUnlockAttachedRef = useRef(false);
  const navigate = useNavigate();
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

  /**
   * セッション開始処理を実行します。
   *
   * - 副作用: セッション開始 API を呼び出し、画面遷移します。
   * - 入力制約: なし。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では Start→Game の遷移を確認します。
   */
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
      navigate("/game");
    } catch {
      setIsSubmitting(false);
    }
  };

  /**
   * 「はじめから」押下時の処理です。
   *
   * - 副作用: 必要に応じて確認ダイアログを開きます。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では確認ダイアログの表示を確認します。
   */
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

  /**
   * 「続きから」確定時の処理です。
   *
   * - 副作用: セッション復元/開始と画面遷移を行います。
   * - 入力制約: なし。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では続きからの遷移を確認します。
   */
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
      navigate("/game");
    } catch {
      setIsSubmitting(false);
    }
  };

  /**
   * 設定画面へ遷移します。
   *
   * - 副作用: 画面遷移を実行します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では Setting 画面への遷移を確認します。
   */
  const handleSetting = () => {
    navigate("/setting");
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
      // maou_bgm_orchestra05.mp3
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
    return () => {
      bgm.stop();
      bgm.unload();
      bgmRef.current = null;
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
}
