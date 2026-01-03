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
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300 text-sm">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-slate-800/60 p-3">
          <p className="text-slate-400 text-xs">総数</p>
          <p className="font-semibold text-2xl text-white">{total}</p>
        </div>
        <div className="rounded-2xl bg-emerald-900/30 p-3">
          <p className="text-emerald-200 text-xs">当選済み</p>
          <p className="font-semibold text-2xl text-emerald-200">{selected}</p>
        </div>
        <div className="rounded-2xl bg-indigo-900/30 p-3">
          <p className="text-indigo-200 text-xs">残り</p>
          <p className="font-semibold text-2xl text-indigo-200">{remaining}</p>
        </div>
      </div>
      <Button
        type="button"
        className="mt-4 w-full rounded-2xl border border-rose-500/60 px-4 py-2 font-semibold text-rose-200"
        onClick={onDeleteAll}
        disabled={disabled || total === 0}
      >
        すべて削除
      </Button>
    </div>
  );
};
