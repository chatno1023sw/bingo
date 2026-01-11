import { useCallback } from "react";
import type { PrizeList } from "~/common/types";
import { createEmptyPrize } from "~/common/hooks/setting/prizeDraftUtils";

export type UsePrizeDraftOperationsParams = {
  /** 下書き状態の setter */
  setDraftPrizes: React.Dispatch<React.SetStateAction<PrizeList>>;
  /** CSV サマリーをリセットします */
  resetSummary: () => void;
  /** 削除確認の開閉 setter */
  setDeleteOpen: (open: boolean) => void;
  /** リセット確認の開閉 setter */
  setResetOpen: (open: boolean) => void;
};

export type UsePrizeDraftOperationsResult = {
  handleAddCard: () => void;
  handleDeleteAll: () => void;
  handleResetSelections: () => void;
  handleReorder: (ids: string[]) => void;
  handleRemove: (id: string) => void;
  handleUpdate: (id: string, patch: Partial<PrizeList[number]>) => void;
};

/**
 * Setting 画面の景品下書き操作をまとめて提供するフックです。
 *
 * - 副作用: `setDraftPrizes` とサマリー関連の状態を更新します。
 * - 入力制約: `setDraftPrizes` には `PrizeList` の setter を渡してください。
 * - 戻り値: 各種操作ハンドラを返します。
 * - Chrome DevTools MCP ではカード追加や削除が行えることを確認します。
 */
export const usePrizeDraftOperations = ({
  setDraftPrizes,
  resetSummary,
  setDeleteOpen,
  setResetOpen,
}: UsePrizeDraftOperationsParams): UsePrizeDraftOperationsResult => {
  const handleAddCard = useCallback(() => {
    setDraftPrizes((prev) => [...prev, createEmptyPrize(prev.length)]);
  }, [setDraftPrizes]);

  const handleDeleteAll = useCallback(() => {
    setDraftPrizes([]);
    resetSummary();
    setDeleteOpen(false);
  }, [resetSummary, setDeleteOpen, setDraftPrizes]);

  const handleResetSelections = useCallback(() => {
    setDraftPrizes((prev) =>
      prev.map((prize, index) => ({
        ...prize,
        selected: false,
        order: index,
      })),
    );
    setResetOpen(false);
  }, [setDraftPrizes, setResetOpen]);

  const handleReorder = useCallback(
    (ids: string[]) => {
      setDraftPrizes((prev) => {
        const lookup = new Map(prev.map((prize) => [prize.id, prize]));
        return ids
          .map((id) => lookup.get(id))
          .filter((prize): prize is PrizeList[number] => Boolean(prize))
          .map((prize, index) => ({
            ...prize,
            order: index,
          }));
      });
    },
    [setDraftPrizes],
  );

  const handleRemove = useCallback(
    (id: string) => {
      setDraftPrizes((prev) =>
        prev
          .filter((prize) => prize.id !== id)
          .map((prize, index) => ({
            ...prize,
            order: index,
          })),
      );
    },
    [setDraftPrizes],
  );

  const handleUpdate = useCallback(
    (id: string, patch: Partial<PrizeList[number]>) => {
      setDraftPrizes((prev) =>
        prev.map((prize) => (prize.id === id ? { ...prize, ...patch } : prize)),
      );
    },
    [setDraftPrizes],
  );

  return {
    handleAddCard,
    handleDeleteAll,
    handleResetSelections,
    handleReorder,
    handleRemove,
    handleUpdate,
  };
};
