import { useMemo, useState } from "react";
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

  const latestData = useMemo<LoaderData>(() => {
    if (fetcher.data && isLoaderPayload(fetcher.data)) {
      return fetcher.data;
    }
    return loaderData;
  }, [fetcher.data, loaderData]);

  const errorMessage = fetcher.data && !isLoaderPayload(fetcher.data) ? fetcher.data.error : null;
  const isDrawing = fetcher.state !== "idle";
  const isButtonDisabled = isDrawing || latestData.availableNumbers.length === 0;

  const bgmDisabled = !isBgmReady || isDrawing;

  const handleDraw = () => {
    fetcher.submit(
      { intent: "draw" },
      {
        method: "post",
      },
    );
  };

  const handleBackToStart = () => {
    navigate("/start");
  };

  const drawButtonLabel =
    latestData.availableNumbers.length === 0 ? "抽選は完了しました" : "抽選を開始！";

  return (
    <PrizeProvider initialPrizes={latestData.prizes}>
      <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[32px] border border-slate-400 bg-white px-6 py-6 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
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
              className="flex-[0_0_280px]"
            />

            <section className="flex flex-1 flex-col items-center justify-center gap-6">
              <CurrentNumber value={latestData.gameState.currentNumber} isDrawing={isDrawing} />
              <button
                type="button"
                className="w-64 rounded-full bg-[#0F6A86] px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-[#0d5870] disabled:cursor-not-allowed disabled:opacity-50"
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

            <SidePanel className="flex-[0_0_280px]" />
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
