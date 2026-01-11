import { useEffect, useState } from "react";
import { getHistoryView } from "~/common/services/historyService";
import { resumeSession, startSession } from "~/common/services/sessionService";
import type { DrawHistoryEntry, GameStateEnvelope } from "~/common/types";
import { getAvailableNumbers } from "~/common/utils/bingoEngine";

export type GameLoaderData = GameStateEnvelope & {
  historyView: DrawHistoryEntry[];
  availableNumbers: number[];
};

export const ensureSession = async (): Promise<GameStateEnvelope> => {
  const resumed = await resumeSession();
  if (resumed) {
    return resumed;
  }
  return startSession();
};

export const buildLoaderData = async (envelope: GameStateEnvelope): Promise<GameLoaderData> => {
  const historyView = getHistoryView(envelope.gameState);
  const availableNumbers = getAvailableNumbers(envelope.gameState.drawHistory);
  return {
    ...envelope,
    historyView,
    availableNumbers,
  };
};

export const useGameSessionLoader = () => {
  const [session, setSession] = useState<GameLoaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  return { session, setSession, isLoading, loadError };
};
