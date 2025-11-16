import type { FC } from "react";

export type CurrentNumberProps = {
  value: number | null;
  isDrawing: boolean;
};

/**
 * 中央の番号表示パネル。
 */
export const CurrentNumber: FC<CurrentNumberProps> = ({ value, isDrawing }) => {
  const display = value == null ? "--" : value.toString().padStart(2, "0");

  return (
    <div className="mt-6 rounded-3xl border border-indigo-300/40 bg-gradient-to-br from-slate-900 to-indigo-900 px-8 py-6 text-center shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">現在の当選番号</p>
      <p className="mt-2 text-7xl font-extrabold text-white">{display}</p>
      <p className="mt-3 text-sm text-slate-300">
        {isDrawing ? "抽選中..." : value == null ? "抽選を開始してください" : "おめでとうございます！"}
      </p>
    </div>
  );
};
