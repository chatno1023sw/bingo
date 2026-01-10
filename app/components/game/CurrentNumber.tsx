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
    <div className="flex flex-col items-center gap-6 text-foreground">
      <div
        className={cn(
          "relative flex h-112 w-md items-center justify-center rounded bg-card font-bold text-[20rem] transition",
          isDrawing ? "opacity-50" : "opacity-100",
        )}
      >
        {backgroundLetter ? (
          <span
            className={cn(
              "pointer-events-none absolute inset-0 z-0 flex items-center justify-center font-black text-[clamp(8rem,18vw,18rem)] leading-none",
              backgroundLetterStyles[backgroundLetter],
            )}
            aria-hidden
          >
            {backgroundLetter}
          </span>
        ) : null}
        <span className="relative z-10 inline-block">{display}</span>
        {!isDrawing && bingoLetter ? (
          <span
            className={cn(
              "pointer-events-none absolute -right-10 -bottom-8 z-20 flex h-30 w-30 items-center justify-center rounded-full border-2 border-secondary font-black text-[5rem] text-white leading-none",
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
