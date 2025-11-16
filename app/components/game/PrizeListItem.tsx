import type { FC } from "react";
import type { Prize } from "~/common/types";

export type PrizeListItemProps = {
  prize: Prize;
  disabled?: boolean;
  onToggle: (id: string, nextSelected: boolean) => void;
};

export const PrizeListItem: FC<PrizeListItemProps> = ({ prize, disabled = false, onToggle }) => {
  const handleToggle = () => {
    onToggle(prize.id, !prize.selected);
  };

  return (
    <li
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${prize.selected ? "border-emerald-500/40 bg-emerald-900/20" : "border-slate-700 bg-slate-800/40"}`}
    >
      <div className="max-w-[70%]">
        <p
          className={`text-base font-semibold ${prize.selected ? "text-emerald-200 line-through" : "text-white"}`}
        >
          {prize.prizeName}
        </p>
        <p className={`text-sm ${prize.selected ? "text-emerald-300/70 line-through" : "text-slate-400"}`}>
          {prize.itemName}
        </p>
      </div>
      <button
        type="button"
        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${prize.selected ? "bg-slate-800 text-emerald-200" : "bg-emerald-500/90 text-slate-900"}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        {prize.selected ? "戻す" : "当選"}
      </button>
    </li>
  );
};
