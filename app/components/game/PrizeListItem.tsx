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
        prize.selected ? "border-border bg-muted opacity-70" : "border-border bg-card",
      )}
    >
      <Image className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex-1">
        {showPrizeNameOnly ? (
          <p
            className={cn(
              "text-3xl",
              prize.selected ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {prize.prizeName}
          </p>
        ) : (
          <p
            className={cn(
              "text-3xl",
              prize.selected ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {prize.itemName}
          </p>
        )}
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
