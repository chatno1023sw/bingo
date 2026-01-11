import { useMemo, type FC } from "react";
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
const buildHistoryRows = (recent: DrawHistoryEntry[], columns: number): HistoryRow[] => {
  const totalCount = recent.length;
  if (totalCount === 0) {
    return [];
  }

  const remainder = totalCount % columns;
  const fullRowCount = Math.floor(totalCount / columns);
  const labelRowOffset = remainder === 0 ? 0 : 1;
  const firstRowSize = remainder === 0 ? columns : remainder;
  const rows: DrawHistoryEntry[][] = [recent.slice(0, firstRowSize)];

  for (let i = firstRowSize; i < totalCount; i += columns) {
    rows.push(recent.slice(i, i + columns));
  }

  return rows.map((row, rowIndex) => {
    const fullRowIndex = rowIndex - labelRowOffset;
    const labelCount =
      // 1 行分未満のときはラベルを出さないため 0 にします。
      totalCount < columns
        ? 0
        : // full 行の場合は残りの列数単位ラベルを出します。
          fullRowIndex >= 0
          ? (fullRowCount - fullRowIndex) * columns
          : // 先頭が余り行の場合は次の列数単位ラベルを出します。
            (fullRowCount + 1) * columns;
    return { entries: row, labelCount };
  });
};

export type HistoryPanelProps = {
  /** 表示する直近履歴 */
  recent: DrawHistoryEntry[];
  /** 追加のクラス名 */
  className?: string;
  /** 表示列数 */
  columns?: 3 | 4;
};

/**
 * 左ペインの直近履歴表示。
 *
 * - 副作用: ありません。
 * - 入力制約: `recent` は DrawHistoryEntry 配列を渡してください。
 * - 戻り値: 履歴表示の JSX を返します。
 * - Chrome DevTools MCP では履歴表示を確認します。
 */
export const HistoryPanel: FC<HistoryPanelProps> = ({ recent, className = "", columns = 4 }) => {
  const rows = useMemo(() => buildHistoryRows(recent, columns), [recent, columns]);
  const gridColumnsClass = columns === 4 ? "grid-cols-4" : "grid-cols-3";
  const gridGapClass = columns === 4 ? "gap-2" : "gap-3";
  const gridPaddingClass = columns === 4 ? "px-1/2" : "px-1";
  const cardPaddingClass = columns === 4 ? "px-2" : "px-3";
  const numberTextClass =
    columns === 4 ? "text-[clamp(1.25rem,3vw,4rem)]" : "text-[clamp(1.5rem,3.6vw,4.8rem)]";
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
          <div className="text-muted-foreground text-sm">まだ抽選されてないよ</div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row, rowIndex) => {
              const rowKey = row.entries[0]?.sequence ?? `row-${rowIndex}`;
              return (
                <div key={`history-row-${rowKey}`} className="flex flex-col gap-3">
                  {row.labelCount > 0 ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">{`${row.labelCount}`}</span>
                      <div className="h-px w-full bg-border" />
                    </div>
                  ) : null}
                  <div className={cn("grid", gridColumnsClass, gridGapClass, gridPaddingClass)}>
                    {row.entries.map((entry) => (
                      <div
                        key={entry.sequence}
                        className="relative w-full"
                        style={{ paddingBottom: "100%" }}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 flex items-center justify-center rounded border border-border bg-card text-center font-semibold leading-none",
                            cardPaddingClass,
                            numberTextClass,
                          )}
                        >
                          {entry.number}
                        </div>
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
