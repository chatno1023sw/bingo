import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { getHistoryView } from "~/common/services/historyService";
import { persistSessionState, resumeSession, startSession } from "~/common/services/sessionService";
import type { DrawHistoryEntry, GameStateEnvelope } from "~/common/types";
import {
  drawNextNumber,
  getAvailableNumbers,
  NoAvailableNumbersError,
} from "~/common/utils/bingoEngine";
import { Button } from "~/components/common/Button";
import { CurrentNumber } from "~/components/game/CurrentNumber";
import { HistoryPanel } from "~/components/game/HistoryPanel";
import { ResetDialog } from "~/components/game/ResetDialog";
import { SidePanel } from "~/components/game/SidePanel";
import { cn } from "~/lib/utils";

const NUMBER_POOL = Array.from({ length: 75 }, (_, index) => index + 1);

const ensureSession = async (): Promise<GameStateEnvelope> => {
  const resumed = await resumeSession();
  if (resumed) {
    return resumed;
  }
  return startSession();
};

type LoaderData = GameStateEnvelope & {
  historyView: DrawHistoryEntry[];
  availableNumbers: number[];
};

const buildLoaderData = async (envelope: GameStateEnvelope): Promise<LoaderData> => {
  const historyView = getHistoryView(envelope.gameState);
  const availableNumbers = getAvailableNumbers(envelope.gameState.drawHistory);
  return {
    ...envelope,
    historyView,
    availableNumbers,
  };
};
export default function GameRoute() {
  const [session, setSession] = useState<LoaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  // const { preference, isReady: isBgmReady, toggle: toggleBgm } = useBgmPreference();
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableNumbers = session?.availableNumbers ?? [];
  // const bgmDisabled = !isBgmReady || isMutating || isResetting;
  const isButtonDisabled =
    isMutating || isResetting || isAnimating || availableNumbers.length === 0;
  const currentNumber = session?.gameState.currentNumber ?? null;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const nextSession = await ensureSession();
        const nextData = await buildLoaderData(nextSession);
        if (!mounted) {
          return;
        }
        setSession(nextData);
        setLoadError(null);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setLoadError(err instanceof Error ? err.message : "load-session-error");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isAnimating) {
      return;
    }
    setDisplayNumber(currentNumber);
  }, [isAnimating, currentNumber]);

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const performDraw = async () => {
    setIsMutating(true);
    try {
      const currentSession = session ?? (await ensureSession());
      const nextGameState = drawNextNumber(currentSession.gameState);
      const updatedEnvelope: GameStateEnvelope = {
        ...currentSession,
        gameState: nextGameState,
      };
      await persistSessionState(updatedEnvelope);
      const nextData = await buildLoaderData(updatedEnvelope);
      setSession(nextData);
      setDrawError(null);
    } catch (error) {
      if (error instanceof NoAvailableNumbersError) {
        setDrawError("no-available-numbers");
        return;
      }
      setDrawError("draw-error");
    } finally {
      setIsMutating(false);
    }
  };

  const handleReset = async () => {
    if (!session) {
      return;
    }
    setIsResetting(true);
    try {
      const now = new Date().toISOString();
      const nextGameState = {
        ...session.gameState,
        currentNumber: null,
        drawHistory: [],
        isDrawing: false,
        updatedAt: now,
      };
      const updatedEnvelope = {
        ...session,
        gameState: nextGameState,
      };
      await persistSessionState(updatedEnvelope);
      const nextData = await buildLoaderData(updatedEnvelope);
      setSession(nextData);
      setDrawError(null);
      setResetOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDraw = () => {
    if (isAnimating || isMutating || isResetting || availableNumbers.length === 0) {
      return;
    }
    const pool = availableNumbers.length > 0 ? availableNumbers : NUMBER_POOL;
    setIsAnimating(true);
    animationIntervalRef.current = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)];
      setDisplayNumber(random);
    }, 120);
    animationTimeoutRef.current = setTimeout(() => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setIsAnimating(false);
      void performDraw();
    }, 3000);
  };

  const handleBackToStart = () => {
    navigate("/start");
  };

  const drawButtonLabel =
    availableNumbers.length === 0
      ? "抽選は完了しました"
      : isAnimating || isMutating
        ? "抽選中"
        : "抽選を開始！";

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
          onClick={() => navigate("/start")}
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
              onClick={() => setResetOpen(true)}
              disabled={isLoading || isResetting}
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
                className="flex w-80 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-primary-foreground text-xl shadow-sm hover:bg-primary/90"
                onClick={handleDraw}
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
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        disabled={isResetting}
      />
    </PrizeProvider>
  );
}
