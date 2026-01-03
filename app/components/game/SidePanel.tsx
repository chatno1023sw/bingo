import { useEffect, useMemo, useState } from "react";
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
  const [itemNameOverrides, setItemNameOverrides] = useState<Set<string>>(new Set());

  const summary = useMemo(() => {
    const selected = prizes.filter((prize) => prize.selected).length;
    return {
      total: prizes.length,
      selected,
      remaining: prizes.length - selected,
    };
  }, [prizes]);

  useEffect(() => {
    setItemNameOverrides((prev) => {
      const validIds = new Set(prizes.map((prize) => prize.id));
      const next = new Set<string>();
      if (!showPrizeNameOnly) {
        for (const id of validIds) {
          next.add(id);
        }
        return next;
      }
      for (const id of prev) {
        if (validIds.has(id)) {
          next.add(id);
        }
      }
      return next;
    });
  }, [prizes, showPrizeNameOnly]);

  const handleToggleDisplay = (id: string) => {
    setItemNameOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleDisplayAll = () => {
    setShowPrizeNameOnly((prev) => {
      const next = !prev;
      setItemNameOverrides(next ? new Set() : new Set(prizes.map((prize) => prize.id)));
      return next;
    });
  };

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
      className={`flex h-full flex-col rounded-3xl border border-border bg-card p-4 text-foreground ${className}`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <h2 className="text-base">景品一覧</h2>

          <span className="text-muted-foreground text-xs">
            当選済み {summary.selected} / {summary.total}
          </span>
        </div>

        <Button
          type="button"
          className="rounded-full border border-border px-3 py-1 text-muted-foreground text-xs hover:bg-muted disabled:opacity-50"
          onClick={handleToggleDisplayAll}
          disabled={isLoading}
        >
          {showPrizeNameOnly ? "賞名表示" : "賞品表示"}
        </Button>
      </header>
      <div className="no-scrollbar mt-4 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">景品情報を読み込み中です...</p>
        ) : (
          <PrizeList
            prizes={prizes}
            disabled={isMutating}
            onToggle={togglePrize}
            itemNameOverrides={itemNameOverrides}
            onToggleDisplay={handleToggleDisplay}
          />
        )}
      </div>
      <Button
        type="button"
        className="mt-4 w-full rounded-full bg-primary px-6 py-2 text-primary-foreground text-sm shadow-sm hover:bg-primary/90 disabled:opacity-40"
        onClick={handleRouletteStart}
        disabled={isLoading || prizes.length === 0}
      >
        景品ルーレット
      </Button>
      {error && <p className="mt-3 text-destructive text-xs">{error}</p>}
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
