import type { FC } from "react";
import { Button } from "~/components/common/Button";

export type BulkActionsProps = {
  total: number;
  selected: number;
  onDeleteAll: () => void;
  disabled?: boolean;
};

export const BulkActions: FC<BulkActionsProps> = ({
  total,
  selected,
  onDeleteAll,
  disabled = false,
}) => {
  const remaining = Math.max(total - selected, 0);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-muted-foreground text-sm">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-muted p-3">
          <p className="text-muted-foreground text-xs">総数</p>
          <p className="font-semibold text-2xl text-foreground">{total}</p>
        </div>
        <div className="rounded-2xl bg-accent p-3">
          <p className="text-accent-foreground text-xs">当選済み</p>
          <p className="font-semibold text-2xl text-accent-foreground">{selected}</p>
        </div>
        <div className="rounded-2xl bg-secondary p-3">
          <p className="text-secondary-foreground text-xs">残り</p>
          <p className="font-semibold text-2xl text-secondary-foreground">{remaining}</p>
        </div>
      </div>
      <Button
        type="button"
        className="mt-4 w-full rounded-2xl border border-destructive px-4 py-2 font-semibold text-destructive hover:bg-destructive/10"
        onClick={onDeleteAll}
        disabled={disabled || total === 0}
      >
        すべて削除
      </Button>
    </div>
  );
};
