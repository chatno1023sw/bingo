import type { FC } from "react";
import type { DrawHistoryEntry } from "~/common/types";
import { cn } from "~/lib/utils";

type HistoryRow = {
  entries: DrawHistoryEntry[];
  labelCount: number;
};

/**
 * 履歴の表示行と件数ラベルを組み立てます。
 *
 * - 副作用: ありません。
 * - 入力制約: `recent` は最新が先頭の履歴配列を渡してください。
 * - 戻り値: 先頭行の余り件数を考慮した行配列と件数ラベルを返します。
 * - Chrome DevTools MCP では 1〜12 件の追加表示を確認します。
 */
const buildHistoryRows = (recent: DrawHistoryEntry[]): HistoryRow[] => {
  const totalCount = recent.length;
  if (totalCount === 0) {
    return [];
  }

  const remainder = totalCount % 4;
  const fullRowCount = Math.floor(totalCount / 4);
  const labelRowOffset = remainder === 0 ? 0 : 1;
  const firstRowSize = remainder === 0 ? 4 : remainder;
  const rows: DrawHistoryEntry[][] = [recent.slice(0, firstRowSize)];

  for (let i = firstRowSize; i < totalCount; i += 4) {
    rows.push(recent.slice(i, i + 4));
  }

  return rows.map((row, rowIndex) => {
    const fullRowIndex = rowIndex - labelRowOffset;
    const labelCount =
      // 1〜3件のときはラベルを出さないため 0 にします。
      totalCount < 4
        ? 0
        : // 4件以上で通常行の場合は残りの4件単位ラベルを出します。
          fullRowIndex >= 0
          ? (fullRowCount - fullRowIndex) * 4
          : // 先頭が余り行の場合は次の4件単位ラベルを出します。
            (fullRowCount + 1) * 4;
    return { entries: row, labelCount };
  });
};

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
  const rows = buildHistoryRows(recent);
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
          <div className="flex flex-col gap-3">
            {rows.map((row, rowIndex) => {
              const rowKey = row.entries[0]?.sequence ?? `row-${rowIndex}`;
              return (
                <div key={`history-row-${rowKey}`} className="flex flex-col gap-3">
                  {row.labelCount > 0 ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">{`${row.labelCount}件目`}</span>
                      <div className="h-px w-full bg-border" />
                    </div>
                  ) : null}
                  <div className="grid grid-cols-4 gap-3">
                    {row.entries.map((entry) => (
                      <div
                        key={entry.sequence}
                        className="flex aspect-square min-h-24 items-center justify-center rounded border border-border text-[clamp(24px,5vw,84px)]"
                      >
                        {entry.number}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
