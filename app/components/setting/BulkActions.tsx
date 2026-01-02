import type { FC } from "react";

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
		<div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
			<div className="grid grid-cols-3 gap-3 text-center">
				<div className="rounded-2xl bg-slate-800/60 p-3">
					<p className="text-xs text-slate-400">総数</p>
					<p className="text-2xl font-semibold text-white">{total}</p>
				</div>
				<div className="rounded-2xl bg-emerald-900/30 p-3">
					<p className="text-xs text-emerald-200">当選済み</p>
					<p className="text-2xl font-semibold text-emerald-200">{selected}</p>
				</div>
				<div className="rounded-2xl bg-indigo-900/30 p-3">
					<p className="text-xs text-indigo-200">残り</p>
					<p className="text-2xl font-semibold text-indigo-200">{remaining}</p>
				</div>
			</div>
			<button
				type="button"
				className="mt-4 w-full rounded-2xl border border-rose-500/60 px-4 py-2 font-semibold text-rose-200"
				onClick={onDeleteAll}
				disabled={disabled || total === 0}
			>
				すべて削除
			</button>
		</div>
	);
};
