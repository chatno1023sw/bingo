import { useMemo } from "react";
import { PrizeList } from "~/components/game/PrizeList";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";

export const SidePanel = () => {
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
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">景品の当選管理</h2>
          <p className="text-sm text-slate-400">当選ステータスを手動で更新できます</p>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-slate-600 px-4 py-2 text-xs text-slate-300 hover:border-slate-400"
          onClick={() => refresh().catch(() => {})}
          disabled={isLoading}
        >
          再読み込み
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-2xl bg-slate-800/60 p-3">
          <p className="text-slate-400">総数</p>
          <p className="text-2xl font-semibold text-white">{summary.total}</p>
        </div>
        <div className="rounded-2xl bg-emerald-900/20 p-3">
          <p className="text-emerald-200">当選済み</p>
          <p className="text-2xl font-semibold text-emerald-200">{summary.selected}</p>
        </div>
        <div className="rounded-2xl bg-indigo-900/20 p-3">
          <p className="text-indigo-200">残り</p>
          <p className="text-2xl font-semibold text-indigo-200">{summary.remaining}</p>
        </div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">景品情報を読み込み中です...</p>
        ) : (
          <PrizeList prizes={prizes} disabled={isMutating} onToggle={togglePrize} />
        )}
      </div>
      {error && <p className="mt-4 text-xs text-rose-300">{error}</p>}
    </section>
  );
};
