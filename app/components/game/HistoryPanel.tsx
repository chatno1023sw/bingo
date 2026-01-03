import type { FC } from "react";
import type { DrawHistoryEntry } from "~/common/types";

export type HistoryPanelProps = {
  recent: DrawHistoryEntry[];
  className?: string;
};

/**
 * 左ペインの直近履歴表示。
 */
export const HistoryPanel: FC<HistoryPanelProps> = ({ recent, className = "" }) => {
  return (
    <section
      className={`flex h-full flex-col rounded-3xl border border-border bg-card p-4 text-foreground ${className}`}
    >
      <div className="no-scrollbar flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-3 gap-4">
          {recent.length === 0 ? (
            <div className="col-span-3 text-center text-muted-foreground text-sm">
              まだ抽選結果がありません
            </div>
          ) : (
            recent.map((entry) => (
              <div
                key={entry.sequence}
                className="flex aspect-square min-h-30 items-center justify-center rounded border border-border text-6xl"
              >
                {entry.number}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
