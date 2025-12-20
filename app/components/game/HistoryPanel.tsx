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
  return (
    <section
      className={`flex h-full flex-col rounded-3xl border border-slate-400 bg-white p-4 text-slate-900 ${className}`}
    >
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-3 gap-4">
          {recent.length === 0 ? (
            <div className="col-span-3 text-center text-sm text-slate-500">まだ抽選結果がありません</div>
          ) : (
            recent.map((entry) => (
              <div
                key={entry.sequence}
                className="flex aspect-square min-h-[120px] items-center justify-center rounded border border-slate-500 text-3xl font-semibold"
              >
                {entry.number}
              </div>
            ))
          )}
        </div>
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
