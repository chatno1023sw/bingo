import type { FC } from "react";
import { bingoNumberRanges } from "~/common/constants/bingo";
import { cn } from "~/lib/utils";

export type CurrentNumberProps = {
  /** 表示する数字 */
  value: number | null;
  /** 抽選中フラグ */
  isDrawing: boolean;
};

/**
 * 中央表示のシンプルな数字パネル。
 *
 * - 副作用: ありません。
 * - 入力制約: `value` は number または null を渡してください。
 * - 戻り値: 数字パネルの JSX を返します。
 * - Chrome DevTools MCP では表示の切り替えを確認します。
 */
export const CurrentNumber: FC<CurrentNumberProps> = ({ value, isDrawing }) => {
  const display = value == null ? "" : value.toString();
  const bingoLetter = value == null ? null : bingoNumberRanges.getLetter(value);
  const letterStyles = {
    B: "text-red-100",
    I: "text-yellow-100",
    N: "text-green-100",
    G: "text-sky-100",
    O: "text-violet-100",
  } as const;

  return (
    <div className="flex flex-col items-center gap-6 text-foreground">
      <div
        className={cn(
          "relative flex h-112 w-md items-center justify-center rounded bg-card font-bold text-[20rem] transition",
          isDrawing ? "opacity-50" : "opacity-100",
        )}
      >
        {!isDrawing && bingoLetter ? (
          <span
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center font-black text-[40rem] leading-none",
              letterStyles[bingoLetter],
            )}
            aria-hidden
          >
            {bingoLetter}
          </span>
        ) : null}
        <span className="relative z-10">{display}</span>
      </div>
    </div>
  );
};
