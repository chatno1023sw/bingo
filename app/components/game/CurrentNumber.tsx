import type { FC } from "react";
import { cn } from "~/lib/utils";

export type CurrentNumberProps = {
  value: number | null;
  isDrawing: boolean;
};

/**
 * 中央表示のシンプルな数字パネル。
 */
export const CurrentNumber: FC<CurrentNumberProps> = ({ value, isDrawing }) => {
  const display = value == null ? "--" : value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-6 text-slate-900">
      <div
        className={cn(
          "flex h-112 w-md items-center justify-center rounded border border-slate-500 bg-white text-[15rem] font-bold transition",
          isDrawing ? "opacity-50" : "opacity-100",
        )}
      >
        {display}
      </div>
    </div>
  );
};
