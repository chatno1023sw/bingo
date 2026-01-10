import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { getHistoryView } from "~/common/services/historyService";
import { persistSessionState, resumeSession, startSession } from "~/common/services/sessionService";
import type { DrawHistoryEntry, GameStateEnvelope } from "~/common/types";
import {
  drawNextNumber,
  getAvailableNumbers,
  NoAvailableNumbersError,
} from "~/common/utils/bingoEngine";
import { markStartBgmUnlock } from "~/common/utils/audioUnlock";

const NUMBER_POOL = Array.from({ length: 75 }, (_, index) => index + 1);

/**
 * セッションを取得または新規作成します。
 *
 * - 副作用: セッション復元/開始を実行します。
 * - 入力制約: なし。
 * - 戻り値: GameStateEnvelope を返します。
 * - Chrome DevTools MCP ではセッション作成を確認します。
 */
const ensureSession = async (): Promise<GameStateEnvelope> => {
  const resumed = await resumeSession();
  if (resumed) {
    return resumed;
  }
  return startSession();
};

/**
 * Game 画面のローダー相当データ。
 */
export type GameLoaderData = GameStateEnvelope & {
  /** 表示用の抽選履歴 */
  historyView: DrawHistoryEntry[];
  /** 抽選可能な番号一覧 */
  availableNumbers: number[];
};

/**
 * Game 画面の表示用データを構築します。
 *
 * - 副作用: ありません。
 * - 入力制約: `envelope` は GameStateEnvelope を渡してください。
 * - 戻り値: GameLoaderData を返します。
 * - Chrome DevTools MCP では履歴/候補の算出を確認します。
 */
const buildLoaderData = async (envelope: GameStateEnvelope): Promise<GameLoaderData> => {
  const historyView = getHistoryView(envelope.gameState);
  const availableNumbers = getAvailableNumbers(envelope.gameState.drawHistory);
  return {
    ...envelope,
    historyView,
    availableNumbers,
  };
};

export type UseGameSessionResult = {
  /** セッション情報 */
  session: GameLoaderData | null;
  /** 読み込み中フラグ */
  isLoading: boolean;
  /** 更新中フラグ */
  isMutating: boolean;
  /** リセット中フラグ */
  isResetting: boolean;
  /** 読み込みエラー */
  loadError: string | null;
  /** 抽選エラー */
  drawError: string | null;
  /** リセットダイアログの表示状態 */
  resetOpen: boolean;
  /** 表示番号 */
  displayNumber: number | null;
  /** 抽選演出中フラグ */
  isAnimating: boolean;
  /** 抽選可能な番号一覧 */
  availableNumbers: number[];
  /** ボタン無効化フラグ */
  isButtonDisabled: boolean;
  /** 抽選ボタンのラベル */
  drawButtonLabel: string;
  /** リセットダイアログを開く */
  openResetDialog: () => void;
  /** リセットダイアログを閉じる */
  closeResetDialog: () => void;
  /** 抽選演出を開始 */
  startDrawAnimation: () => void;
  /** 抽選演出を完了して抽選結果を確定 */
  completeDrawAnimation: () => void;
  /** 抽選リセット */
  handleReset: () => Promise<void>;
  /** Start 画面へ戻る */
  handleBackToStart: () => void;
};

/**
 * Game 画面のセッション制御フックです。
 *
 * - 副作用: セッションの読み込みと保存を行います。
 * - 入力制約: ありません。
 * - 戻り値: 画面表示に必要な状態と操作関数を返します。
 * - Chrome DevTools MCP では抽選とリセットが動作することを確認します。
 */
export const useGameSession = (): UseGameSessionResult => {
  const [session, setSession] = useState<GameLoaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drawActiveRef = useRef(false);
  const lastSyncedNumberRef = useRef<number | null>(null);

  const availableNumbers = session?.availableNumbers ?? [];
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
    if (currentNumber === lastSyncedNumberRef.current) {
      return;
    }
    setDisplayNumber(currentNumber);
    lastSyncedNumberRef.current = currentNumber;
  }, [isAnimating, currentNumber]);

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  /**
   * 抽選処理を実行します。
   *
   * - 副作用: セッション保存と状態更新を行います。
   * - 入力制約: なし。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では抽選結果の保存を確認します。
   */
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

  /**
   * 抽選履歴をリセットします。
   *
   * - 副作用: セッション保存とダイアログ状態更新を行います。
   * - 入力制約: セッションが存在する必要があります。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では履歴が消えることを確認します。
   */
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

  /**
   * 抽選演出を開始します。
   *
   * - 副作用: 抽選演出のタイマーを起動します。
   * - 入力制約: 抽選可能な番号が存在する必要があります。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では演出開始を確認します。
   */
  const startDrawAnimation = () => {
    if (isAnimating || isMutating || isResetting || availableNumbers.length === 0) {
      return;
    }
    const pool = availableNumbers.length > 0 ? availableNumbers : NUMBER_POOL;
    setDisplayNumber(null);
    setIsAnimating(true);
    drawActiveRef.current = true;
    animationIntervalRef.current = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)];
      setDisplayNumber(random);
    }, 120);
  };

  /**
   * 抽選演出を終了して抽選結果を確定します。
   *
   * - 副作用: 抽選演出タイマーを停止し、抽選結果を保存します。
   * - 入力制約: 抽選演出中である必要があります。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では抽選結果の反映を確認します。
   */
  const completeDrawAnimation = () => {
    if (!drawActiveRef.current) {
      return;
    }
    drawActiveRef.current = false;
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setIsAnimating(false);
    void performDraw();
  };

  /**
   * Start 画面へ戻ります。
   *
   * - 副作用: 画面遷移を行います。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では遷移を確認します。
   */
  const handleBackToStart = () => {
    markStartBgmUnlock();
    navigate("/start");
  };

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
