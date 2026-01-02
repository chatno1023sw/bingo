import type { FC } from "react";
import type { Prize } from "~/common/types";
import { cn } from "~/lib/utils";
import { Image } from "lucide-react";

export type PrizeListItemProps = {
  prize: Prize;
  disabled?: boolean;
  onToggle: (id: string, nextSelected: boolean) => void;
  showPrizeNameOnly: boolean;
};

export const PrizeListItem: FC<PrizeListItemProps> = ({
  prize,
  disabled = false,
  onToggle,
  showPrizeNameOnly,
}) => {
  const handleToggle = () => {
    onToggle(prize.id, !prize.selected);
  };
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition",
        prize.selected ? "border-slate-300 bg-slate-100 opacity-70" : "border-slate-300 bg-white",
      )}
    >
      <Image className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex-1">
        {showPrizeNameOnly ? (
          <p
            className={cn(
              "text-3xl font-semibold",
              prize.selected ? "text-slate-400 line-through" : "text-slate-500",
            )}
          >
            {prize.prizeName}
          </p>
        ) : (
          <p
            className={cn(
              "text-3xl font-semibold",
              prize.selected ? "text-slate-400 line-through" : "text-slate-500",
            )}
          >
            {prize.itemName}
          </p>
        )}
      </div>
      <button
        type="button"
        className={cn(
          "rounded-full px-4 py-1 text-xs font-semibold transition",
          prize.selected ? "border border-slate-400 text-slate-600" : "bg-[#0F6A86] text-white",
        )}
        onClick={handleToggle}
        disabled={disabled}
      >
        {prize.selected ? "戻す" : "除外"}
      </button>
    </li>
  );
};
