import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { persistSessionState } from "~/common/services/sessionService";
import type { GameStateEnvelope } from "~/common/types";
import { drawNextNumber, NoAvailableNumbersError } from "~/common/utils/bingoEngine";
import { markStartBgmUnlock } from "~/common/utils/audioUnlock";
import { useDrawAnimation } from "~/common/hooks/useDrawAnimation";
import {
  useGameSessionLoader,
  ensureSession,
  buildLoaderData,
  type GameLoaderData,
} from "~/common/hooks/useGameSessionLoader";

export type UseGameSessionResult = {
  session: GameLoaderData | null;
  isLoading: boolean;
  isMutating: boolean;
  isResetting: boolean;
  loadError: string | null;
  drawError: string | null;
  resetOpen: boolean;
  displayNumber: number | null;
  isAnimating: boolean;
  availableNumbers: number[];
  isButtonDisabled: boolean;
  drawButtonLabel: string;
  openResetDialog: () => void;
  closeResetDialog: () => void;
  startDrawAnimation: () => void;
  completeDrawAnimation: () => void;
  handleReset: () => Promise<void>;
  handleBackToStart: () => void;
};

export type UseGameSessionOptions = {
  onNavigateToStart?: () => void;
};

export const useGameSession = (options: UseGameSessionOptions = {}): UseGameSessionResult => {
  const { session, setSession, isLoading, loadError } = useGameSessionLoader();
  const [isMutating, setIsMutating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();

  const availableNumbers = session?.availableNumbers ?? [];
  const currentNumber = session?.gameState.currentNumber ?? null;

  const performDraw = useCallback(async () => {
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
  }, [session, setSession]);

  const { displayNumber, isAnimating, startDrawAnimation, completeDrawAnimation } =
    useDrawAnimation({
      onFinalizeDraw: () => {
        void performDraw();
      },
      availableNumbers,
      isMutating,
      isResetting,
      currentNumber,
    });

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

  const handleBackToStart = () => {
    markStartBgmUnlock();
    if (options.onNavigateToStart) {
      options.onNavigateToStart();
      return;
    }
    navigate("/");
  };

  const isButtonDisabled =
    isMutating || isResetting || isAnimating || availableNumbers.length === 0;

  const drawButtonLabel =
    availableNumbers.length === 0
      ? "抽選は完了しました"
      : isAnimating || isMutating
        ? "抽選中"
        : "抽選を開始！";

  return {
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
    openResetDialog: () => setResetOpen(true),
    closeResetDialog: () => setResetOpen(false),
    startDrawAnimation,
    completeDrawAnimation,
    handleReset,
    handleBackToStart,
  };
};
