import type { FC } from "react";
import type { PrizeList as PrizeListData } from "~/common/types";
import { PrizeListItem } from "~/components/game/PrizeListItem";

export type PrizeListProps = {
  /** 表示する景品一覧 */
  prizes: PrizeListData;
  /** 操作無効フラグ */
  disabled?: boolean;
  /** 選出状態の切り替え */
  onToggle: (id: string, nextSelected: boolean) => void;
  /** 景品名表示に切り替える ID 集合 */
  itemNameOverrides: Set<string>;
  /** 表示名切り替え操作 */
  onToggleDisplay: (id: string) => void;
};

/**
 * 景品一覧を表示するリストです。
 *
 * - 副作用: ありません。
 * - 入力制約: `prizes` は PrizeList を渡してください。
 * - 戻り値: 景品一覧の JSX を返します。
 * - Chrome DevTools MCP では一覧表示を確認します。
 */
export const PrizeList: FC<PrizeListProps> = ({
  prizes,
  disabled = false,
  onToggle,
  itemNameOverrides,
  onToggleDisplay,
}) => {
  if (prizes.length === 0) {
    return <p className="text-muted-foreground text-sm">まだ景品が登録されてないよ</p>;
  }

  return (
    <ul className="h-full w-full space-y-3">
      {prizes.map((prize) => (
        <PrizeListItem
          key={prize.id}
          prize={prize}
          disabled={disabled}
          onToggle={onToggle}
          showPrizeNameOnly={!itemNameOverrides.has(prize.id)}
          onToggleDisplay={onToggleDisplay}
        />
      ))}
    </ul>
  );
};
