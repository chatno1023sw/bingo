import { Howl } from "howler";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, type FC } from "react";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { useGameSession } from "~/common/hooks/useGameSession";
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
  const drumrollHowlRef = useRef<Howl | null>(null);
  const cymbalHowlRef = useRef<Howl | null>(null);
  const completeAnimationRef = useRef<() => void>(() => undefined);
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

  useEffect(() => {
    completeAnimationRef.current = completeDrawAnimation;
  }, [completeDrawAnimation]);

  const handleDrawComplete = () => {
    completeAnimationRef.current();
    const cymbal = cymbalHowlRef.current;
    if (cymbal) {
      cymbal.stop();
      cymbal.seek(0);
      cymbal.play();
    }
  };

  useEffect(() => {
    const drumroll = new Howl({
      src: ["/drumroll.mp3"],
      preload: true,
      onend: handleDrawComplete,
      onstop: handleDrawComplete,
      onloaderror: handleDrawComplete,
      onplayerror: handleDrawComplete,
    });
    const cymbal = new Howl({
      src: ["/cymbal.mp3"],
      preload: true,
    });
    drumrollHowlRef.current = drumroll;
    cymbalHowlRef.current = cymbal;
    return () => {
      drumroll.unload();
      cymbal.unload();
      drumrollHowlRef.current = null;
      cymbalHowlRef.current = null;
    };
  }, []);

  const handleDrawWithBgm = () => {
    if (isButtonDisabled) {
      return;
    }
    startDrawAnimation();
    if (drumrollHowlRef.current) {
      drumrollHowlRef.current.seek(0);
      drumrollHowlRef.current.play();
      return;
    }
    handleDrawComplete();
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
            <div className="flex items-center gap-2">
              {/* todo: あとで音を出す設定を入れたい */}
              {/* <BgmToggle
                enabled={preference.enabled}
                onToggle={() => toggleBgm()}
                disabled={bgmDisabled}
              /> */}
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
            <HistoryPanel recent={session.historyView} className="flex-[0_0_420px]" />
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

            <SidePanel className="flex-[0_0_420px]" />
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
