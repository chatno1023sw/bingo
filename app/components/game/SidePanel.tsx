import { useMemo } from "react";
import { PrizeList } from "~/components/game/PrizeList";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";

export type SidePanelProps = {
	className?: string;
};

export const SidePanel = ({ className = "" }: SidePanelProps) => {
	const { prizes, isLoading, isMutating, error, togglePrize, refresh } = usePrizeManager();

	const summary = useMemo(() => {
		const selected = prizes.filter((prize) => prize.selected).length;
		return {
			total: prizes.length,
			selected,
			remaining: prizes.length - selected,
		};
	}, [prizes]);

	return (
		<section
			className={`flex h-full flex-col rounded-3xl border border-slate-400 bg-white p-4 text-slate-900 ${className}`}
		>
			<header className="flex items-center justify-between">
				<div>
					<h2 className="text-base font-semibold">景品一覧</h2>
					<p className="text-xs text-slate-500">
						当選済み {summary.selected} / {summary.total}
					</p>
					<p className="text-xs text-slate-400">残り {summary.remaining} 件</p>
				</div>
				<button
					type="button"
					className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
					onClick={() => refresh().catch(() => {})}
					disabled={isLoading}
				>
					再読み込み
				</button>
			</header>
			<div className="mt-4 flex-1 overflow-y-auto pr-1">
				{isLoading ? (
					<p className="text-sm text-slate-500">景品情報を読み込み中です...</p>
				) : (
					<PrizeList prizes={prizes} disabled={isMutating} onToggle={togglePrize} />
				)}
			</div>
			<button
				type="button"
				className="mt-4 w-full rounded-full bg-[#0F6A86] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d5870] disabled:opacity-40"
				disabled
			>
				景品ルーレット
			</button>
			{error && <p className="mt-3 text-xs text-rose-500">{error}</p>}
		</section>
	);
};
