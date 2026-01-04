import type { FC } from "react";
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
  const display = value == null ? "--" : value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-6 text-foreground">
      <div
        className={cn(
          "flex h-112 w-md items-center justify-center rounded border border-border bg-card font-bold text-[15rem] transition",
          isDrawing ? "opacity-50" : "opacity-100",
        )}
      >
        {display}
      </div>
    </div>
  );
};
