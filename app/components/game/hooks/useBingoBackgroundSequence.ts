import { useCallback, useEffect, useRef, useState } from "react";
import type { BingoLetter } from "~/common/constants/bingo";

export type UseBingoBackgroundSequenceResult = {
  /** 背景に表示する Bingo の文字 */
  bingoBackgroundLetter: BingoLetter | null;
  /** シーケンスを開始します */
  startSequence: (durationMs: number) => void;
  /** シーケンスを停止します */
  clearSequence: () => void;
};

/**
 * 抽選中の Bingo 背景シーケンスを制御します。
 *
 * - 副作用: setTimeout を複数扱います。
 * - 入力制約: durationMs は正の値を渡してください。
 * - 戻り値: 現在の文字と制御関数を返します。
 * - Chrome DevTools MCP では抽選中に文字が順番に変わることを確認します。
 */
export const useBingoBackgroundSequence = (): UseBingoBackgroundSequenceResult => {
  const [bingoBackgroundLetter, setBingoBackgroundLetter] = useState<BingoLetter | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearSequence = useCallback(() => {
    for (const timerId of timersRef.current) {
      clearTimeout(timerId);
    }
    timersRef.current = [];
    setBingoBackgroundLetter(null);
  }, []);

  const startSequence = useCallback(
    (durationMs: number) => {
      clearSequence();
      const letters: BingoLetter[] = ["B", "I", "N", "G", "O"];
      if (durationMs <= 0) {
        setBingoBackgroundLetter(letters[0]);
        return;
      }
      const segmentMs = durationMs / letters.length;
      setBingoBackgroundLetter(letters[0]);
      letters.slice(1).forEach((letter, index) => {
        const timerId = setTimeout(
          () => {
            setBingoBackgroundLetter(letter);
          },
          Math.round(segmentMs * (index + 1)),
        );
        timersRef.current.push(timerId);
      });
    },
    [clearSequence],
  );

  useEffect(() => clearSequence, [clearSequence]);

  return { bingoBackgroundLetter, startSequence, clearSequence };
};
