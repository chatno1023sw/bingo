import type { FC } from "react";
import type { DrawHistoryEntry } from "~/common/types";
import { cn } from "~/lib/utils";

export type HistoryPanelProps = {
  /** 表示する直近履歴 */
  recent: DrawHistoryEntry[];
  /** 追加のクラス名 */
  className?: string;
};

/**
 * 左ペインの直近履歴表示。
 *
 * - 副作用: ありません。
 * - 入力制約: `recent` は DrawHistoryEntry 配列を渡してください。
 * - 戻り値: 履歴表示の JSX を返します。
 * - Chrome DevTools MCP では履歴表示を確認します。
 */
export const HistoryPanel: FC<HistoryPanelProps> = ({ recent, className = "" }) => {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-3xl border border-border bg-card p-4 text-foreground",
        className,
      )}
    >
      <div
        className={cn(
          "no-scrollbar flex-1 overflow-y-auto pr-2",
          recent.length === 0 ? "flex h-full w-full items-center justify-center" : "",
        )}
      >
        {recent.length === 0 ? (
          <div className="text-muted-foreground text-sm">まだ抽選結果されてないよ</div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {recent.map((entry) => (
              <div
                key={entry.sequence}
                className="flex aspect-square min-h-24 items-center justify-center rounded border border-border text-[clamp(24px,5vw,84px)]"
              >
                {entry.number}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
