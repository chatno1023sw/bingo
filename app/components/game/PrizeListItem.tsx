import { Image } from "lucide-react";
import type { FC } from "react";
import type { Prize } from "~/common/types";
import { Button } from "~/components/common/Button";
import { cn } from "~/lib/utils";

export type PrizeListItemProps = {
  prize: Prize;
  disabled?: boolean;
  onToggle: (id: string, nextSelected: boolean) => void;
  showPrizeNameOnly: boolean;
  onToggleDisplay: (id: string) => void;
};

export const PrizeListItem: FC<PrizeListItemProps> = ({
  prize,
  disabled = false,
  onToggle,
  showPrizeNameOnly,
  onToggleDisplay,
}) => {
  const handleToggle = () => {
    onToggle(prize.id, !prize.selected);
  };
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition",
        prize.selected ? "border-border bg-muted opacity-70" : "border-border bg-card",
      )}
    >
      <Image className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex-1">
        <button
          type="button"
          className={cn(
            "w-full cursor-pointer text-left text-3xl focus:outline-none",
            prize.selected ? "text-muted-foreground line-through" : "text-foreground",
          )}
          onClick={() => onToggleDisplay(prize.id)}
          disabled={disabled}
        >
          {showPrizeNameOnly ? prize.prizeName : prize.itemName}
        </button>
      </div>
      <Button
        type="button"
        className={cn(
          "rounded-full px-4 py-1 text-xs",
          prize.selected
            ? "border border-border text-muted-foreground"
            : "bg-primary text-primary-foreground",
        )}
        onClick={handleToggle}
        disabled={disabled}
      >
        {prize.selected ? "戻す" : "除外"}
      </Button>
    </li>
  );
};
