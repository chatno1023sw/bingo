import type { FC } from "react";
import type { DrawHistoryEntry } from "~/common/types";

export type HistoryPanelProps = {
  recent: DrawHistoryEntry[];
  onOpenModal: () => void;
  className?: string;
};

/**
 * 左ペインの直近履歴表示。
 */
export const HistoryPanel: FC<HistoryPanelProps> = ({ recent, onOpenModal, className = "" }) => {
  const slots = 16;
  const entries = Array.from({ length: slots }, (_, index) => recent[index] ?? null);

  return (
    <section
      className={`flex h-full flex-col rounded-3xl border border-slate-400 bg-white p-4 text-slate-900 ${className}`}
    >
      <div className="grid flex-1 grid-cols-4 gap-3">
        {entries.map((entry, index) => (
          <div
            key={`${entry?.sequence ?? `placeholder-${index}`}`}
            className="flex aspect-square items-center justify-center rounded border border-slate-400 text-xl font-semibold text-slate-800"
          >
            {entry ? entry.number : "--"}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 text-center text-sm font-semibold text-slate-600 underline-offset-4 hover:underline"
        onClick={onOpenModal}
      >
        過去の番号を確認
      </button>
    </section>
  );
};
