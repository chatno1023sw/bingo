import { useEffect, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";
import type { Prize } from "~/common/types";
import { cn } from "~/lib/utils";

export type PrizeRouletteDialogProps = {
  open: boolean;
  prizes: Prize[];
  onClose: () => void;
  onComplete: (prize: Prize) => void;
};

/**
 * 景品ルーレットの抽選ダイアログ。
 *
 * - 開始から 5 秒間、賞名カードのハイライトを切り替え続けます。
 * - 5 秒後に当選カードを 2 回点滅させ、完了時に `onComplete` を呼び出します。
 * - Chrome DevTools MCP では「景品ルーレット」押下でダイアログが表示されることを確認します。
 */
export const PrizeRouletteDialog: FC<PrizeRouletteDialogProps> = ({
  open,
  prizes,
  onClose,
  onComplete,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open || prizes.length === 0) {
      return;
    }
    const entries = prizes.slice(0, 25);
    const selectable = entries
      .map((prize, index) => ({ prize, index }))
      .filter(({ prize }) => !prize.selected);
    if (selectable.length === 0) {
      return;
    }

    setActiveIndex(selectable[0].index);
    setWinnerIndex(null);
    setIsFlashing(false);

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        if (selectable.length === 1) {
          return selectable[0].index;
        }
        let next = selectable[Math.floor(Math.random() * selectable.length)].index;
        if (next === prev) {
          next =
            selectable[
              (Math.floor(Math.random() * (selectable.length - 1)) + 1) % selectable.length
            ].index;
        }
        return next;
      });
    }, 120);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const winnerIndex = selectable[Math.floor(Math.random() * selectable.length)].index;
      setActiveIndex(winnerIndex);
      setWinnerIndex(winnerIndex);
      setIsFlashing(true);
      flashTimeoutRef.current = setTimeout(() => {
        setIsFlashing(false);
        onComplete(prizes[winnerIndex]);
      }, 800);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = null;
      }
    };
  }, [open, prizes, onComplete]);

  if (!open) {
    return null;
  }
  if (typeof document === "undefined") {
    return null;
  }

  const entries = prizes.slice(0, 25);
  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full border border-slate-200 px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-slate-900">景品ルーレット</h2>
        <div className="mt-6 grid grid-cols-5 gap-1.25">
          {entries.map((prize, index) => {
            const isActive = index === activeIndex;
            const isWinner = isFlashing && index === winnerIndex;
            const isDisabled = prize.selected;
            return (
              <div
                key={prize.id}
                className={cn(
                  "flex items-center justify-center roulette-card aspect-square text-xs",
                  isDisabled && "roulette-card--disabled",
                  isActive && !isDisabled && "roulette-card--active",
                  isWinner && !isDisabled && "roulette-card--winner",
                )}
              >
                {prize.prizeName || "賞名未設定"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
