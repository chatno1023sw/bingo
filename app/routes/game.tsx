import { useEffect, useMemo, useRef, useState } from "react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "react-router";
import type { GameStateEnvelope } from "~/common/types";
import { startSession, resumeSession, persistSessionState } from "~/common/services/sessionService";
import { getHistoryView, type HistoryView } from "~/common/services/historyService";
import {
  drawNextNumber,
  getAvailableNumbers,
  NoAvailableNumbersError,
} from "~/common/utils/bingoEngine";
import { CurrentNumber } from "~/components/game/CurrentNumber";
import { HistoryPanel } from "~/components/game/HistoryPanel";
import { HistoryModal } from "~/components/game/HistoryModal";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { SidePanel } from "~/components/game/SidePanel";
import { BgmToggle } from "~/components/common/BgmToggle";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";

const NUMBER_POOL = Array.from({ length: 75 }, (_, index) => index + 1);

const ensureSession = async (): Promise<GameStateEnvelope> => {
  const resumed = await resumeSession();
  if (resumed) {
    return resumed;
  }
  return startSession();
};

export type LoaderData = GameStateEnvelope & {
  historyView: HistoryView;
  availableNumbers: number[];
};

const buildLoaderData = async (envelope: GameStateEnvelope): Promise<LoaderData> => {
  const historyView = await getHistoryView(envelope.gameState);
  const availableNumbers = getAvailableNumbers(envelope.gameState.drawHistory);
  return {
    ...envelope,
    historyView,
    availableNumbers,
  };
};
export type ActionResult = LoaderData | { error: string };

export const loader = async (_args: LoaderFunctionArgs) => {
  const session = await ensureSession();
  return buildLoaderData(session);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "draw") {
    const session = await ensureSession();

    try {
      const nextGameState = drawNextNumber(session.gameState);
      const updatedEnvelope: GameStateEnvelope = {
        ...session,
        gameState: nextGameState,
      };
      await persistSessionState(updatedEnvelope);
      return buildLoaderData(updatedEnvelope);
    } catch (error) {
      if (error instanceof NoAvailableNumbersError) {
        return Response.json({ error: "no-available-numbers" }, { status: 409 });
      }
      throw error;
    }
  }

  return Response.json({ error: "unsupported-intent" }, { status: 400 });
};

const isLoaderPayload = (payload: unknown): payload is LoaderData => {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "gameState" in payload &&
      "historyView" in payload &&
      "availableNumbers" in payload,
  );
};

export default function GameRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionResult>();
  const [historyOpen, setHistoryOpen] = useState(false);
  const navigate = useNavigate();
  const { preference, isReady: isBgmReady, toggle: toggleBgm, error: bgmError } = useBgmPreference();
  const [displayNumber, setDisplayNumber] = useState<number | null>(loaderData.gameState.currentNumber);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestData = useMemo<LoaderData>(() => {
    if (fetcher.data && isLoaderPayload(fetcher.data)) {
      return fetcher.data;
    }
    return loaderData;
  }, [fetcher.data, loaderData]);

  const errorMessage = fetcher.data && !isLoaderPayload(fetcher.data) ? fetcher.data.error : null;
  const isFetcherPending = fetcher.state !== "idle";
  const isButtonDisabled = isFetcherPending || isAnimating || latestData.availableNumbers.length === 0;

  const bgmDisabled = !isBgmReady || isFetcherPending;

  useEffect(() => {
    if (isAnimating) {
      return;
    }
    setDisplayNumber(latestData.gameState.currentNumber);
  }, [isAnimating, latestData.gameState.currentNumber]);

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

  const handleDraw = () => {
    if (isAnimating || isFetcherPending || latestData.availableNumbers.length === 0) {
      return;
    }
    const pool =
      latestData.availableNumbers.length > 0 ? latestData.availableNumbers : NUMBER_POOL;
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
      fetcher.submit(
        { intent: "draw" },
        {
          method: "post",
        },
      );
    }, 3000);
  };

  const handleBackToStart = () => {
    navigate("/start");
  };

  const drawButtonLabel =
    latestData.availableNumbers.length === 0
      ? "抽選は完了しました"
      : isAnimating || isFetcherPending
        ? "抽選中..."
        : "抽選を開始！";

  return (
    <PrizeProvider initialPrizes={latestData.prizes}>
      <main className="h-screen overflow-hidden bg-white text-slate-900">
        <div className="flex h-full w-full flex-col border border-slate-400 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
          <header className="flex items-center justify-end gap-4">
            <BgmToggle enabled={preference.enabled} onToggle={() => toggleBgm()} disabled={bgmDisabled} />
            <button
              type="button"
              className="rounded-full border border-slate-300 px-3 py-1 text-xl text-slate-600 transition hover:bg-slate-50"
              aria-label="Start 画面に戻る"
              onClick={handleBackToStart}
            >
              ×
            </button>
          </header>
          {bgmError ? (
            <p className="text-right text-xs text-rose-500">BGM 設定の保存に失敗しました</p>
          ) : null}
          <div className="flex flex-1 gap-6 overflow-hidden px-6 py-6">
            <HistoryPanel
              recent={latestData.historyView.recent}
              onOpenModal={() => setHistoryOpen(true)}
              className="flex-[0_0_420px]"
            />

            <section className="flex flex-1 flex-col items-center justify-center gap-8">
              <CurrentNumber value={displayNumber} isDrawing={isAnimating || isFetcherPending} />
              <button
                type="button"
                className="w-80 rounded-full bg-[#0F6A86] px-8 py-4 text-xl font-semibold text-white shadow-sm transition hover:bg-[#0d5870] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDraw}
                disabled={isButtonDisabled}
              >
                {drawButtonLabel}
              </button>
              {errorMessage === "no-available-numbers" && (
                <p className="text-sm text-rose-500">すべての番号が抽選済みです。</p>
              )}
              <p className="text-xs text-slate-500">残り {latestData.availableNumbers.length} / 75</p>
            </section>

            <SidePanel className="flex-[0_0_420px]" />
          </div>
        </div>
        <HistoryModal
          open={historyOpen}
          entries={latestData.historyView.all}
          onClose={() => setHistoryOpen(false)}
        />
      </main>
    </PrizeProvider>
  );
}
