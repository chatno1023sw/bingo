import { useMemo, useState } from "react";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";
import { Button } from "~/components/common/Button";
import { PrizeList } from "~/components/game/PrizeList";
import { PrizeResultDialog } from "~/components/game/PrizeResultDialog";
import { PrizeRouletteDialog } from "~/components/game/PrizeRouletteDialog";

export type SidePanelProps = {
  className?: string;
};

export const SidePanel = ({ className = "" }: SidePanelProps) => {
  const { prizes, isLoading, isMutating, error, togglePrize } = usePrizeManager();
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultPrize, setResultPrize] = useState<(typeof prizes)[number] | null>(null);
  const [showPrizeNameOnly, setShowPrizeNameOnly] = useState(true);

  const summary = useMemo(() => {
    const selected = prizes.filter((prize) => prize.selected).length;
    return {
      total: prizes.length,
      selected,
      remaining: prizes.length - selected,
    };
  }, [prizes]);

  const handleRouletteStart = () => {
    setResultOpen(false);
    setRouletteOpen(true);
  };

  const handleRouletteComplete = async (prize: (typeof prizes)[number]) => {
    setRouletteOpen(false);
    if (!prize.selected) {
      try {
        await togglePrize(prize.id, true);
      } catch {
        /* 失敗時は結果表示だけ行う */
      }
    }
    setResultPrize(prize);
    setResultOpen(true);
  };

  return (
    <section
      className={`flex h-full flex-col rounded-3xl border border-slate-400 bg-white p-4 text-slate-900 ${className}`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <h2 className="text-base font-semibold">景品一覧</h2>

          <span className="text-xs text-slate-500">
            当選済み {summary.selected} / {summary.total}
          </span>
        </div>

        <Button
          type="button"
          className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          onClick={() => setShowPrizeNameOnly((prev) => !prev)}
          disabled={isLoading}
        >
          表示切替
        </Button>
      </header>
      <div className="no-scrollbar mt-4 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-sm text-slate-500">景品情報を読み込み中です...</p>
        ) : (
          <PrizeList
            prizes={prizes}
            disabled={isMutating}
            onToggle={togglePrize}
            showPrizeNameOnly={showPrizeNameOnly}
          />
        )}
      </div>
      <Button
        type="button"
        className="mt-4 w-full rounded-full bg-[#0F6A86] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d5870] disabled:opacity-40"
        onClick={handleRouletteStart}
        disabled={isLoading || prizes.length === 0}
      >
        景品ルーレット
      </Button>
      {error && <p className="mt-3 text-xs text-rose-500">{error}</p>}
      <PrizeRouletteDialog
        open={rouletteOpen}
        prizes={prizes}
        onClose={() => setRouletteOpen(false)}
        onComplete={handleRouletteComplete}
      />
      <PrizeResultDialog
        open={resultOpen}
        prize={resultPrize}
        onClose={() => setResultOpen(false)}
      />
    </section>
  );
};
