import { useCallback, useEffect, useRef, useState } from "react";

const NUMBER_POOL = Array.from({ length: 75 }, (_, index) => index + 1);

export type UseDrawAnimationParams = {
  onFinalizeDraw: () => void;
  availableNumbers: number[];
  isMutating: boolean;
  isResetting: boolean;
  currentNumber: number | null;
};

export type UseDrawAnimationResult = {
  displayNumber: number | null;
  isAnimating: boolean;
  startDrawAnimation: () => void;
  completeDrawAnimation: () => void;
};

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
