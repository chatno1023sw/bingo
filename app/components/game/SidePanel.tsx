import { Button } from "~/components/common/Button";
import { usePrizeSidePanel } from "~/components/game/hooks/usePrizeSidePanel";
import { PrizeList } from "~/components/game/PrizeList";
import { PrizeResultDialog } from "~/components/game/PrizeResultDialog";
import { PrizeRouletteDialog } from "~/components/game/PrizeRouletteDialog";
import { cn } from "~/lib/utils";

export type SidePanelProps = {
  /** 追加のクラス名 */
  className?: string;
};

/**
 * Game 画面右側の景品一覧パネルです。
 *
 * - 副作用: 景品操作で状態更新を行います。
 * - 入力制約: PrizeProvider 配下で利用してください。
 * - 戻り値: パネルの JSX を返します。
 * - Chrome DevTools MCP では景品操作を確認します。
 */
export const SidePanel = ({ className = "" }: SidePanelProps) => {
  const {
    prizes,
    displayPrizes,
    isLoading,
    isMutating,
    error,
    summary,
    showPrizeNameOnly,
    hideSelected,
    itemNameOverrides,
    imageVisibleIds,
    rouletteOpen,
    resultOpen,
    resultPrize,
    togglePrize,
    handleToggleDisplay,
    handleToggleDisplayAll,
    handleToggleSelectedFilter,
    handleRouletteStart,
    handleRouletteComplete,
    closeRouletteDialog,
    closeResultDialog,
  } = usePrizeSidePanel();

  return (
    <section
      className={cn(
        "flex h-full min-w-0 flex-col rounded-3xl border border-border bg-card p-4 text-foreground",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base">景品一覧</h2>
            <span className="text-muted-foreground text-xs">
              当選済み {summary.selected} / {summary.total}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border border-border px-3 py-1 text-xs disabled:opacity-50"
              onClick={handleToggleDisplayAll}
              disabled={isLoading}
            >
              {showPrizeNameOnly ? "賞名表示" : "賞品表示"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs disabled:opacity-50",
                hideSelected && "bg-primary/30",
              )}
              onClick={handleToggleSelectedFilter}
              disabled={isLoading}
            >
              {hideSelected ? "フィルタ解除" : "当選除外"}
            </Button>
          </div>
        </header>
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-muted px-2 py-3">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground text-sm">景品情報を読み込み中...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              <PrizeList
                prizes={displayPrizes}
                disabled={isMutating}
                onToggle={togglePrize}
                itemNameOverrides={itemNameOverrides}
                onToggleDisplay={handleToggleDisplay}
                imageVisibleIds={imageVisibleIds}
              />
            </div>
          )}
        </div>
        <div className="space-y-3 pt-1">
          <Button
            type="button"
            className="w-full rounded-full bg-primary px-6 py-2 text-primary-foreground text-sm shadow-sm disabled:opacity-40"
            onClick={handleRouletteStart}
            disabled={isLoading || prizes.length === 0}
          >
            景品ルーレット
          </Button>
          {error && (
            <p className="text-destructive text-xs" aria-live="polite">
              {error}
            </p>
          )}
        </div>
      </div>
      <PrizeRouletteDialog
        open={rouletteOpen}
        prizes={prizes}
        onClose={closeRouletteDialog}
        onComplete={handleRouletteComplete}
      />
      <PrizeResultDialog open={resultOpen} prize={resultPrize} onClose={closeResultDialog} />
    </section>
  );
};
