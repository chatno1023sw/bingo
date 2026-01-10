import { Howl } from "howler";
import { Loader2, X } from "lucide-react";
import { type FC, useCallback, useEffect, useRef } from "react";
import {
  audioPaths,
  audioSettings,
  buildNumberVoicePath,
  resolveAudioPath,
} from "~/common/constants/audio";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { useBgmPlayers } from "~/common/hooks/useBgmPlayers";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";
import { useGameSession } from "~/common/hooks/useGameSession";
import { storageKeys } from "~/common/utils/storage";
import { BgmControl } from "~/components/common/BgmControl";
import { Button } from "~/components/common/Button";
import { CurrentNumber } from "~/components/game/CurrentNumber";
import { HistoryPanel } from "~/components/game/HistoryPanel";
import { ResetDialog } from "~/components/game/ResetDialog";
import { SidePanel } from "~/components/game/SidePanel";
import { cn } from "~/lib/utils";

/**
 * Game 画面のメインコンテンツです。
 *
 * - 副作用: セッションの読み込み/更新を行います。
 * - 入力制約: ありません。
 * - 戻り値: ゲーム画面の JSX を返します。
 * - Chrome DevTools MCP では抽選操作が動作することを確認します。
 */
export const GameContent: FC = () => {
  const {
    session,
    isLoading,
    isMutating,
    isResetting,
    loadError,
    drawError,
    resetOpen,
    displayNumber,
    isAnimating,
    availableNumbers,
    isButtonDisabled,
    drawButtonLabel,
    openResetDialog,
    closeResetDialog,
    startDrawAnimation,
    completeDrawAnimation,
    handleReset,
    handleBackToStart,
  } = useGameSession();
  const { preference, isReady, setVolume } = useBgmPreference({
    defaultVolume: audioSettings.bgm.defaultVolume,
  });
  const { preference: soundPreference, setVolume: setSoundVolume } = useBgmPreference({
    storageKey: storageKeys.se,
    defaultVolume: audioSettings.se.defaultVolume,
  });

  const numberVoiceRef = useRef<Howl | null>(null);
  const pendingAnnounceRef = useRef(false);
  const pendingNumberRef = useRef<number | null>(null);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnnouncedRef = useRef<number | null>(null);
  const ANNOUNCE_DELAY_MS = audioSettings.number.announceDelayMs;

  const playNumberVoice = useCallback(
    (number: number) => {
      if (soundPreference.volume <= 0) {
        return;
      }
      if (numberVoiceRef.current) {
        numberVoiceRef.current.stop();
        numberVoiceRef.current.unload();
        numberVoiceRef.current = null;
      }
      const voice = new Howl({
        src: [resolveAudioPath(buildNumberVoicePath(number))],
        preload: true,
        volume: audioSettings.number.voiceVolume,
        onend: () => {
          voice.unload();
          if (numberVoiceRef.current === voice) {
            numberVoiceRef.current = null;
          }
        },
      });
      numberVoiceRef.current = voice;
      voice.play();
    },
    [soundPreference.volume],
  );

  const tryAnnounceNumber = useCallback(() => {
    if (!pendingAnnounceRef.current) {
      return;
    }
    const number = pendingNumberRef.current;
    if (number === null) {
      return;
    }
    if (lastAnnouncedRef.current === number) {
      pendingAnnounceRef.current = false;
      pendingNumberRef.current = null;
      return;
    }
    if (announceTimerRef.current) {
      clearTimeout(announceTimerRef.current);
    }
    announceTimerRef.current = setTimeout(() => {
      playNumberVoice(number);
      lastAnnouncedRef.current = number;
      pendingAnnounceRef.current = false;
      pendingNumberRef.current = null;
      announceTimerRef.current = null;
    }, ANNOUNCE_DELAY_MS);
  }, [playNumberVoice, ANNOUNCE_DELAY_MS]);

  const { playDrumroll } = useBgmPlayers({
    onDrumrollEnd: completeDrawAnimation,
    enabled: soundPreference.volume > 0,
    volume: soundPreference.volume,
  });

  const bgmRef = useRef<Howl | null>(null);
  const bgmPlayingRef = useRef(false);
  const bgmPendingRef = useRef(false);
  const bgmUnlockAttachedRef = useRef(false);

  const requestBgmPlay = useCallback(() => {
    const bgm = bgmRef.current;
    if (!bgm) {
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
      // maou_bgm_acoustic02.mp3
      src: [resolveAudioPath(audioPaths.bgm.game)],
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
    bgm.volume(preference.volume * audioSettings.bgm.gameVolumeScale);
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
    return () => {
      if (announceTimerRef.current) {
        clearTimeout(announceTimerRef.current);
        announceTimerRef.current = null;
      }
      if (numberVoiceRef.current) {
        numberVoiceRef.current.stop();
        numberVoiceRef.current.unload();
        numberVoiceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingAnnounceRef.current) {
      return;
    }
    if (drawError) {
      pendingAnnounceRef.current = false;
      pendingNumberRef.current = null;
      if (announceTimerRef.current) {
        clearTimeout(announceTimerRef.current);
        announceTimerRef.current = null;
      }
    }
  }, [drawError]);

  useEffect(() => {
    if (!pendingAnnounceRef.current) {
      return;
    }
    const currentNumber = session?.gameState.currentNumber ?? null;
    if (currentNumber === null) {
      return;
    }
    pendingNumberRef.current = currentNumber;
    tryAnnounceNumber();
  }, [session?.gameState.currentNumber, tryAnnounceNumber]);

  const handleDrawWithBgm = () => {
    if (isButtonDisabled) {
      return;
    }
    pendingAnnounceRef.current = soundPreference.volume > 0;
    pendingNumberRef.current = null;
    startDrawAnimation();
    playDrumroll();
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      </main>
    );
  }

  if (loadError || !session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <p className="text-destructive text-sm">データの読み込みに失敗しました。</p>
        <Button
          type="button"
          className="rounded border border-border px-4 py-2 text-muted-foreground text-sm hover:bg-muted"
          onClick={handleBackToStart}
        >
          Start 画面に戻る
        </Button>
      </main>
    );
  }

  return (
    <PrizeProvider initialPrizes={session.prizes}>
      <main className="h-screen overflow-hidden bg-background text-foreground">
        <div className="flex h-full w-full flex-col border border-border bg-card shadow-[0_4px_20px_hsl(var(--foreground)/0.08)]">
          <header className="flex items-center justify-between px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              className={cn(
                "rounded-full border border-border px-3 py-1 text-sm hover:bg-muted",
                "relative top-2",
              )}
              onClick={openResetDialog}
              disabled={isLoading || isResetting || session.historyView.length === 0}
            >
              クリア
            </Button>
            <div className="relative flex items-center gap-3">
              <BgmControl
                preference={preference}
                soundPreference={soundPreference}
                isReady={isReady}
                onVolumeChange={setVolume}
                onSoundVolumeChange={setSoundVolume}
              />
              <Button
                type="button"
                variant="secondary"
                className="rounded-full!"
                aria-label="Start 画面に戻る"
                onClick={handleBackToStart}
              >
                <X className="aspect-square h-6 w-6" />
              </Button>
            </div>
          </header>
          <div className="flex flex-1 gap-6 overflow-hidden px-6 pb-6">
            <HistoryPanel recent={session.historyView} className="flex-[0_0_30vw]" />
            <section className="flex flex-1 flex-col items-center justify-center gap-8">
              <CurrentNumber value={displayNumber} isDrawing={isAnimating || isMutating} />
              <Button
                type="button"
                className="flex w-80 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-primary-foreground text-xl shadow-sm hover:bg-primary"
                onClick={handleDrawWithBgm}
                disabled={isButtonDisabled}
              >
                {(isAnimating || isMutating) && <Loader2 className={"animate-spin"} />}
                {drawButtonLabel}
              </Button>
              {drawError === "no-available-numbers" && (
                <p className="text-destructive text-sm">すべての番号が抽選済みです。</p>
              )}
              <p className="text-muted-foreground text-xs">残り {availableNumbers.length} / 75</p>
            </section>

            <SidePanel className="flex-[0_0_30vw]" />
          </div>
        </div>
      </main>
      <ResetDialog
        open={resetOpen}
        onClose={closeResetDialog}
        onConfirm={handleReset}
        disabled={isResetting}
      />
    </PrizeProvider>
  );
};
