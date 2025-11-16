import { useMemo, useState } from "react";
import { json } from "@react-router/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@react-router/node";
import { useFetcher, useLoaderData } from "react-router";
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
  return json(await buildLoaderData(session));
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
      return json(await buildLoaderData(updatedEnvelope));
    } catch (error) {
      if (error instanceof NoAvailableNumbersError) {
        return json({ error: "no-available-numbers" }, { status: 409 });
      }
      throw error;
    }
  }

  return json({ error: "unsupported-intent" }, { status: 400 });
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

  const latestData = isLoaderPayload(fetcher.data) ? fetcher.data : loaderData;
  const errorMessage = !isLoaderPayload(fetcher.data) ? fetcher.data?.error : null;
  const isDrawing = fetcher.state !== "idle";
  const isButtonDisabled = isDrawing || latestData.availableNumbers.length === 0;

  const rouletteNumbers = useMemo(() => WHEEL_NUMBERS, []);

  const handleDraw = () => {
    fetcher.submit(
      { intent: "draw" },
      {
        method: "post",
      },
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px,1fr,320px]">
        <HistoryPanel recent={latestData.historyView.recent} onOpenModal={() => setHistoryOpen(true)} />

        <section className="flex flex-col items-center rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
          <GameRoulette numbers={rouletteNumbers} currentNumber={latestData.gameState.currentNumber} spinning={isDrawing} />
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

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-400">
          <h2 className="text-lg font-semibold text-white">景品パネル（準備中）</h2>
          <p className="mt-3 text-sm">
            景品の当選管理は User Story 4 で実装予定です。現時点では Game 画面の抽選フローと履歴表示のみ確認できます。
          </p>
        </section>
      </div>
      <HistoryModal
        open={historyOpen}
        entries={latestData.historyView.all}
        onClose={() => setHistoryOpen(false)}
      />
    </main>
  );
}
