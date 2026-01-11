import { useCallback, useEffect, useRef, useState } from "react";

const NUMBER_POOL = Array.from({ length: 75 }, (_, index) => index + 1);

export type UseDrawAnimationParams = {
  /** 抽選実行時に呼び出す処理 */
  onFinalizeDraw: () => void;
  /** 抽選対象の番号一覧 */
  availableNumbers: number[];
  /** 抽選処理中フラグ */
  isMutating: boolean;
  /** リセット中フラグ */
  isResetting: boolean;
  /** 現在の番号 */
  currentNumber: number | null;
};

export type UseDrawAnimationResult = {
  displayNumber: number | null;
  isAnimating: boolean;
  startDrawAnimation: () => void;
  completeDrawAnimation: () => void;
};

/**
 * 抽選演出と表示番号を管理します。
 *
 * - 副作用: interval を用いてランダム表示を行います。
 * - 入力制約: `availableNumbers` が空の場合は演出を開始しません。
 * - 戻り値: 表示番号と演出制御関数を返します。
 * - Chrome DevTools MCP では演出の開始/停止が動作することを確認します。
 */
export const useDrawAnimation = ({
  onFinalizeDraw,
  availableNumbers,
  isMutating,
  isResetting,
  currentNumber,
}: UseDrawAnimationParams): UseDrawAnimationResult => {
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drawActiveRef = useRef(false);
  const lastSyncedNumberRef = useRef<number | null>(null);

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

  const startDrawAnimation = useCallback(() => {
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
  }, [availableNumbers, isAnimating, isMutating, isResetting]);

  const completeDrawAnimation = useCallback(() => {
    if (!drawActiveRef.current) {
      return;
    }
    drawActiveRef.current = false;
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setIsAnimating(false);
    onFinalizeDraw();
  }, [onFinalizeDraw]);

  return { displayNumber, isAnimating, startDrawAnimation, completeDrawAnimation };
};
