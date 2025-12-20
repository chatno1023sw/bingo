import type { FC } from "react";
import type { PrizeList as PrizeListData } from "~/common/types";
import { PrizeListItem } from "~/components/game/PrizeListItem";

export type PrizeListProps = {
  prizes: PrizeListData;
  disabled?: boolean;
  onToggle: (id: string, nextSelected: boolean) => void;
};

export const PrizeList: FC<PrizeListProps> = ({ prizes, disabled = false, onToggle }) => {
  if (prizes.length === 0) {
    return <p className="text-sm text-slate-500">景品が登録されていません。</p>;
  }

  return (
    <ul className="space-y-3">
      {prizes.map((prize) => (
        <PrizeListItem
          key={prize.id}
          prize={prize}
          disabled={disabled}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
};
