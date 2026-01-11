import { type FC, useEffect } from "react";
import { type BingoLetter, bingoNumberRanges } from "~/common/constants/bingo";
import { cn } from "~/lib/utils";

export type CurrentNumberProps = {
  /** 表示する数字 */
  value: number | null;
  /** 抽選中フラグ */
  isDrawing: boolean;
  /** 背景で表示する BINGO 文字 */
  backgroundLetter?: BingoLetter | null;
  /** 初回表示フラグ */
  isFirstState: { isFirst: boolean; setIsFirst: (isFirst: boolean) => void };
};

const NUMBER_PANEL_MAX_SIZE = "min(44rem, calc(100vh - 18rem))";
const NUMBER_TRANSLATE = "translateY(calc(-6% - 3.2rem))";

/**
 * 中央表示のシンプルな数字パネル。
 *
 * - 副作用: ありません。
 * - 入力制約: `value` は number または null を渡してください。
 * - 戻り値: 数字パネルの JSX を返します。
 * - Chrome DevTools MCP では表示の切り替えを確認します。
 */
export const CurrentNumber: FC<CurrentNumberProps> = ({
  value,
  isDrawing,
  backgroundLetter,
  isFirstState,
}) => {
  useEffect(() => {
    if (isDrawing) {
      isFirstState.setIsFirst(false);
      return;
    }
    if (value != null && isFirstState.isFirst) {
      isFirstState.setIsFirst(false);
    }
  }, [isDrawing, isFirstState, value]);
  const display = isFirstState.isFirst ? "--" : value == null ? "" : value.toString();
  const bingoLetter = value == null ? null : bingoNumberRanges.getLetter(value);
  const letterStyles = {
    B: "bg-red-300",
    I: "bg-yellow-300",
    N: "bg-green-300",
    G: "bg-sky-300",
    O: "bg-violet-300",
  } as const;
  const backgroundLetterStyles = {
    B: "text-red-300",
    I: "text-yellow-300",
    N: "text-green-300",
    G: "text-sky-300",
    O: "text-violet-300",
  } as const;

  return (
    <div className="flex w-full flex-col items-center gap-8 text-foreground">
      <div
        className={cn(
          "relative flex aspect-square w-full items-center justify-center rounded-3xl bg-card px-6 font-bold text-[clamp(7rem,16vw,22rem)] transition",
          isDrawing ? "opacity-50" : "opacity-100",
        )}
        style={{ maxWidth: NUMBER_PANEL_MAX_SIZE, maxHeight: NUMBER_PANEL_MAX_SIZE }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ transform: NUMBER_TRANSLATE }}
        >
          {backgroundLetter ? (
            <span
              className={cn(
                "pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 font-black text-[clamp(10rem,22vw,28rem)] leading-none",
                backgroundLetterStyles[backgroundLetter],
              )}
              aria-hidden
            >
              {backgroundLetter}
            </span>
          ) : null}
          <span className="relative z-10 inline-block">{display}</span>
        </div>
        {!isDrawing && bingoLetter ? (
          <span
            className={cn(
              "pointer-events-none absolute right-0 bottom-6 z-20 flex h-28 w-28 translate-x-[55%] translate-y-[25%] items-center justify-center rounded-full border-2 border-secondary font-black text-[3.25rem] text-white leading-none shadow-[0_10px_25px_hsl(var(--secondary)/0.45)]",
              letterStyles[bingoLetter],
            )}
            aria-hidden
          >
            {bingoLetter}
          </span>
        ) : null}
      </div>
    </div>
  );
};
