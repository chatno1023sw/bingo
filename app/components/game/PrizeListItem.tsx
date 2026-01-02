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
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${prize.selected ? "border-slate-300 bg-slate-100 opacity-70" : "border-slate-300 bg-white"}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-slate-500">
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <path
            d="m4 18 4.5-4 4 3 3.5-3 4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex-1">
        <p
          className={`font-semibold ${prize.selected ? "text-slate-500 line-through" : "text-slate-900"}`}
        >
          {prize.prizeName}
        </p>
        <p
          className={`text-xs ${prize.selected ? "text-slate-400 line-through" : "text-slate-500"}`}
        >
          {prize.itemName}
        </p>
      </div>
      <button
        type="button"
        className={`rounded-full px-4 py-1 text-xs font-semibold transition ${prize.selected ? "border border-slate-400 text-slate-600" : "bg-[#0F6A86] text-white"}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        {prize.selected ? "戻す" : "当選"}
      </button>
    </li>
  );
};
