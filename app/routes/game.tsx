import { useMemo, useState } from "react";
import { type ActionFunctionArgs, type LoaderFunctionArgs, useFetcher, useLoaderData } from "react-router";
import type { GameStateEnvelope } from "~/common/types";
import { startSession, resumeSession, persistSessionState } from "~/common/services/sessionService";
import { getHistoryView, type HistoryView } from "~/common/services/historyService";
import {
  drawNextNumber,
  getAvailableNumbers,
  NoAvailableNumbersError,
} from "~/common/utils/bingoEngine";
import { GameRoulette } from "~/components/game/GameRoulette";
import { CurrentNumber } from "~/components/game/CurrentNumber";
import { HistoryPanel } from "~/components/game/HistoryPanel";
import { HistoryModal } from "~/components/game/HistoryModal";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { SidePanel } from "~/components/game/SidePanel";

const WHEEL_NUMBERS = Array.from({ length: 75 }, (_, index) => index + 1);

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

  const latestData = useMemo<LoaderData>(() => {
    if (fetcher.data && isLoaderPayload(fetcher.data)) {
      return fetcher.data;
    }
    return loaderData;
  }, [fetcher.data, loaderData]);

  const errorMessage = fetcher.data && !isLoaderPayload(fetcher.data) ? fetcher.data.error : null;
  const isDrawing = fetcher.state !== "idle";
  const isButtonDisabled = isDrawing || latestData.availableNumbers.length === 0;

  const rouletteNumbers = useMemo(() => {
    if (latestData.availableNumbers.length > 0) {
      return latestData.availableNumbers;
    }
    return WHEEL_NUMBERS;
  }, [latestData.availableNumbers]);

  const handleDraw = () => {
    fetcher.submit(
      { intent: "draw" },
      {
        method: "post",
      },
    );
  };

  return (
    <PrizeProvider initialPrizes={latestData.prizes}>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px,1fr,320px]">
          <HistoryPanel recent={latestData.historyView.recent} onOpenModal={() => setHistoryOpen(true)} />

          <section className="flex flex-col items-center rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
            <GameRoulette
              numbers={rouletteNumbers}
              currentNumber={latestData.gameState.currentNumber}
              spinning={isDrawing}
            />
            <CurrentNumber value={latestData.gameState.currentNumber} isDrawing={isDrawing} />
            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleDraw}
              disabled={isButtonDisabled}
            >
              {latestData.availableNumbers.length === 0 ? "すべて抽選済み" : "抽選開始"}
            </button>
            {errorMessage === "no-available-numbers" && (
              <p className="mt-3 text-sm text-rose-300">すべての番号が抽選済みです。</p>
            )}
            <p className="mt-4 text-xs text-slate-400">
              残り {latestData.availableNumbers.length} / 75
            </p>
          </section>

          <SidePanel />
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
