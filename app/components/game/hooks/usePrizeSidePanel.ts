import { useEffect, useMemo, useState } from "react";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";

export type UsePrizeSidePanelResult = {
  prizes: ReturnType<typeof usePrizeManager>["prizes"];
  displayPrizes: ReturnType<typeof usePrizeManager>["prizes"];
  isLoading: boolean;
  isMutating: boolean;
  error: ReturnType<typeof usePrizeManager>["error"];
  summary: {
    total: number;
    selected: number;
    remaining: number;
  };
  showPrizeNameOnly: boolean;
  hideSelected: boolean;
  itemNameOverrides: Set<string>;
  imageVisibleIds: Set<string>;
  rouletteOpen: boolean;
  resultOpen: boolean;
  resultPrize: ReturnType<typeof usePrizeManager>["prizes"][number] | null;
  togglePrize: ReturnType<typeof usePrizeManager>["togglePrize"];
  handleToggleDisplay: (id: string) => void;
  handleToggleDisplayAll: () => void;
  handleToggleSelectedFilter: () => void;
  handleRouletteStart: () => void;
  handleRouletteComplete: (
    prize: ReturnType<typeof usePrizeManager>["prizes"][number],
  ) => Promise<void>;
  closeRouletteDialog: () => void;
  closeResultDialog: () => void;
};

/**
 * SidePanel で利用する表示ロジックをまとめたカスタムフックです。
 *
 * - 副作用: 景品情報の取得と表示状態の同期を行います。
 * - 入力制約: PrizeProvider 配下で呼び出してください。
 * - 戻り値: 画面表示に必要な状態とハンドラ群を返します。
 * - Chrome DevTools MCP では景品の表示切り替え・フィルタ操作・ルーレット操作が行えることを確認します。
 */
export const usePrizeSidePanel = (): UsePrizeSidePanelResult => {
  const { prizes, isLoading, isMutating, error, togglePrize } = usePrizeManager();
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultPrize, setResultPrize] = useState<(typeof prizes)[number] | null>(null);
  const [showPrizeNameOnly, setShowPrizeNameOnly] = useState(true);
  const [hideSelected, setHideSelected] = useState(false);
  const [itemNameOverrides, setItemNameOverrides] = useState<Set<string>>(new Set());
  const [imageVisibleIds, setImageVisibleIds] = useState<Set<string>>(new Set());

  const summary = useMemo(() => {
    const selected = prizes.filter((prize) => prize.selected).length;
    return {
      total: prizes.length,
      selected,
      remaining: prizes.length - selected,
    };
  }, [prizes]);

  const displayPrizes = useMemo(
    () => (hideSelected ? prizes.filter((prize) => !prize.selected) : prizes),
    [hideSelected, prizes],
  );

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

  useEffect(() => {
    setImageVisibleIds(new Set(prizes.filter((prize) => prize.selected).map((prize) => prize.id)));
  }, [prizes]);

  const handleToggleDisplayAll = () => {
    setShowPrizeNameOnly((prev) => {
      const next = !prev;
      setItemNameOverrides(next ? new Set() : new Set(prizes.map((prize) => prize.id)));
      return next;
    });
  };

  const handleToggleSelectedFilter = () => {
    setHideSelected((prev) => !prev);
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

  const closeRouletteDialog = () => setRouletteOpen(false);
  const closeResultDialog = () => setResultOpen(false);

  return {
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
  };
};
