import { Loader2 } from "lucide-react";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { audioSettings } from "~/common/constants/audio";
import { useAudioNotice } from "~/common/contexts/AudioNoticeContext";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { useBgmPlayers } from "~/common/hooks/useBgmPlayers";
import { useGameSession } from "~/common/hooks/useGameSession";
import { getSoundDetailPreference } from "~/common/services/soundDetailPreferenceService";
import { AudioNoticeDialog } from "~/components/common/AudioNoticeDialog";
import { Button } from "~/components/common/Button";
import { Toast } from "~/components/common/Toast";
import { CurrentNumber } from "~/components/game/CurrentNumber";
import { GameHeader } from "~/components/game/GameHeader";
import { HistoryPanel } from "~/components/game/HistoryPanel";
import { ResetDialog } from "~/components/game/ResetDialog";
import { SidePanel } from "~/components/game/SidePanel";
import { useBingoBackgroundSequence } from "~/components/game/hooks/useBingoBackgroundSequence";
import { useGameBgmController } from "~/components/game/hooks/useGameBgmController";
import { useGameLayoutControls } from "~/components/game/hooks/useGameLayoutControls";
import { useGameSoundDetail } from "~/components/game/hooks/useGameSoundDetail";
import { useNumberAnnouncement } from "~/components/game/hooks/useNumberAnnouncement";
import { VenueBoostControl } from "~/components/game/VenueBoostControl";

export type GameContentProps = {
  /** Start ビューへ戻る */
  onNavigateStart?: () => void;
};

/**
 * Game 画面のメインコンテンツです。
 *
 * - 副作用: セッションの読み込み/更新を行います。
 * - 入力制約: ありません。
 * - 戻り値: ゲーム画面の JSX を返します。
 * - Chrome DevTools MCP では抽選操作が動作することを確認します。
 */
export const GameContent: FC<GameContentProps> = ({ onNavigateStart }) => {
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
  } = useGameSession({ onNavigateToStart: onNavigateStart });
  const { preference, soundPreference, isReady, requestBgmPlay, setBgmVolume, setSoundVolume } =
    useGameBgmController();
  const initialSoundDetail = useMemo(() => getSoundDetailPreference(), []);
  const {
    isFirstState,
    historyColumns,
    historyToggleLabel,
    handleToggleHistoryColumns,
    handleClearHistory,
  } = useGameLayoutControls({
    onRequestReset: openResetDialog,
  });
  const { acknowledged: audioNoticeAcknowledged, markAcknowledged } = useAudioNotice();
  const acknowledgeAudioNotice = useCallback(() => {
    markAcknowledged();
  }, [markAcknowledged]);
  const {
    voiceVolume,
    drumrollVolumeScale,
    cymbalVolumeScale,
    extraSoundSliders,
    handleMuteAllAudio,
    handleEnableAllAudio,
    handleGameBgmVolumeChange,
    resetSoundDetailToDefault,
  } = useGameSoundDetail({
    initialDetail: initialSoundDetail,
    bgmVolume: preference.volume,
    soundVolume: soundPreference.volume,
    acknowledgeAudioNotice,
    setBgmVolume,
    setSoundVolume,
    requestBgmPlay,
  });

  const {
    bingoBackgroundLetter,
    startSequence: startBingoBackgroundSequence,
    clearSequence,
  } = useBingoBackgroundSequence();
  const { prepareAnnouncement, cancelAnnouncement, handleCurrentNumberChange } =
    useNumberAnnouncement({
      voiceVolume,
      soundVolume: soundPreference.volume,
    });

  const { playDrumroll, getDrumrollDurationMs } = useBgmPlayers({
    onDrumrollEnd: completeDrawAnimation,
    enabled: soundPreference.volume > 0,
    volume: soundPreference.volume,
    drumrollVolumeScale,
    cymbalVolumeScale,
  });

  useEffect(() => {
    handleCurrentNumberChange(session?.gameState.currentNumber ?? null);
  }, [handleCurrentNumberChange, session?.gameState.currentNumber]);

  useEffect(() => {
    if (drawError) {
      cancelAnnouncement();
    }
  }, [drawError, cancelAnnouncement]);

  useEffect(() => {
    if (isAnimating) {
      return;
    }
    clearSequence();
  }, [clearSequence, isAnimating]);

  const handleDrawWithBgm = () => {
    if (isButtonDisabled) {
      return;
    }
    prepareAnnouncement(soundPreference.volume > 0);
    startDrawAnimation();
    playDrumroll();
    const drumrollDurationMs = getDrumrollDurationMs();
    const sequenceDurationMs =
      drumrollDurationMs > 0 ? drumrollDurationMs : audioSettings.se.fallbackWaitMs;
    startBingoBackgroundSequence(sequenceDurationMs);
  };

  const [isVenueBoostActive, setIsVenueBoostActive] = useState(false);
  const [isVolumeDialogOpen, setIsVolumeDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const baseBgmBounds = useMemo(
    () => ({
      min: audioSettings.bgm.volumeRange.min,
      max: audioSettings.bgm.volumeRange.max,
      step: 0.01,
    }),
    [],
  );
  const boostedBgmBounds = useMemo(
    () => ({
      min: audioSettings.bgm.volumeRange.min,
      max: audioSettings.bgm.defaultVolume * 5,
      step: 0.05,
    }),
    [],
  );
  const baseSoundBounds = useMemo(
    () => ({
      min: audioSettings.se.volumeRange.min,
      max: audioSettings.se.volumeRange.max,
      step: 0.01,
    }),
    [],
  );
  const boostedSoundBounds = useMemo(
    () => ({
      min: audioSettings.se.volumeRange.min,
      max: audioSettings.se.defaultVolume * 5,
      step: 0.05,
    }),
    [],
  );

  const handleShowToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const handleActivateVenueBoost = useCallback(async () => {
    await handleGameBgmVolumeChange(audioSettings.bgm.volumeRange.min);
    await setSoundVolume(audioSettings.se.volumeRange.min);
    setIsVenueBoostActive(true);
    handleShowToast("会場ブースト起動中！");
  }, [handleGameBgmVolumeChange, handleShowToast, setSoundVolume]);

  const handleDeactivateVenueBoost = useCallback(async () => {
    await handleGameBgmVolumeChange(audioSettings.bgm.volumeRange.min);
    await setSoundVolume(audioSettings.se.volumeRange.min);
    setIsVenueBoostActive(false);
    handleShowToast("会場ブースト解除！");
  }, [handleGameBgmVolumeChange, handleShowToast, setSoundVolume]);

  const shouldShowVenueLabel = isVenueBoostActive && !isVolumeDialogOpen;

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
          <GameHeader
            onClear={handleClearHistory}
            clearDisabled={isLoading || isResetting || session.historyView.length === 0}
            historyToggleLabel={historyToggleLabel}
            onToggleHistoryColumns={handleToggleHistoryColumns}
            onNavigateBack={handleBackToStart}
            bgmControl={{
              preference,
              soundPreference,
              isReady,
              onVolumeChange: handleGameBgmVolumeChange,
              onSoundVolumeChange: setSoundVolume,
              extraSliders: extraSoundSliders,
              onResetToDefault: resetSoundDetailToDefault,
              onMuteAll: handleMuteAllAudio,
              mainSliderBounds: isVenueBoostActive ? boostedBgmBounds : baseBgmBounds,
              soundSliderBounds: isVenueBoostActive ? boostedSoundBounds : baseSoundBounds,
              footerExtras: (
                <VenueBoostControl
                  isActive={isVenueBoostActive}
                  onActivate={handleActivateVenueBoost}
                  onDeactivate={handleDeactivateVenueBoost}
                />
              ),
              onDialogOpenChange: setIsVolumeDialogOpen,
            }}
            venueLabel={{
              text: "会場ブースト起動中！",
              visible: shouldShowVenueLabel,
            }}
          />
          <div className="flex flex-1 flex-col gap-6 overflow-hidden px-3 pb-6 lg:flex-row lg:px-4">
            <aside className="min-h-[18rem] lg:min-h-0 lg:min-w-[20rem] lg:flex-[0_0_28vw]">
              <HistoryPanel
                recent={session.historyView}
                columns={historyColumns}
                className="h-full"
              />
            </aside>
            <section className="flex min-w-0 flex-1 flex-col px-1 py-4 lg:px-4 lg:py-6">
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <CurrentNumber
                  value={displayNumber}
                  isDrawing={isAnimating || isMutating}
                  backgroundLetter={bingoBackgroundLetter}
                  isFirstState={isFirstState}
                />
              </div>
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="w-full max-w-[min(36rem,92%)]">
                  <Button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground text-xl shadow-sm disabled:opacity-40"
                    onClick={handleDrawWithBgm}
                    disabled={isButtonDisabled}
                  >
                    {(isAnimating || isMutating) && <Loader2 className="h-7 w-7 animate-spin" />}
                    {drawButtonLabel}
                  </Button>
                </div>
                {drawError === "no-available-numbers" && (
                  <p className="font-semibold text-base text-destructive">
                    すべての番号が抽選済みです。
                  </p>
                )}
                <p className="font-semibold text-base text-muted-foreground">
                  残り {availableNumbers.length} / 75
                </p>
              </div>
            </section>
            <aside className="min-h-[18rem] lg:min-h-0 lg:min-w-[20rem] lg:flex-[0_0_28vw]">
              <SidePanel className="h-full" />
            </aside>
          </div>
        </div>
      </main>
      <ResetDialog
        open={resetOpen}
        onClose={closeResetDialog}
        onConfirm={handleReset}
        disabled={isResetting}
      />
      <AudioNoticeDialog
        open={!audioNoticeAcknowledged}
        onClose={acknowledgeAudioNotice}
        onMuteAll={handleMuteAllAudio}
        onEnableAll={handleEnableAllAudio}
      />
      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage ?? ""}
        onClose={handleCloseToast}
        className="fixed right-6 bottom-6 z-60 max-w-xs"
      />
    </PrizeProvider>
  );
};
