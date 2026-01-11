import { useCallback, useMemo, useState } from "react";

export type UseGameLayoutControlsParams = {
  /** リセットダイアログを開くハンドラ */
  onRequestReset: () => void;
};

export type UseGameLayoutControlsResult = {
  /** 抽選初回フラグ */
  isFirstState: { isFirst: boolean; setIsFirst: (value: boolean) => void };
  /** 履歴列数 */
  historyColumns: 3 | 4;
  /** 履歴切り替えラベル */
  historyToggleLabel: string;
  /** 列切り替え */
  handleToggleHistoryColumns: () => void;
  /** 履歴クリア開始 */
  handleClearHistory: () => void;
};

/**
 * Game 画面のレイアウト状態をまとめて管理します。
 *
 * - 副作用: ありません。
 * - 入力制約: `onRequestReset` はダイアログ表示ハンドラを渡してください。
 * - 戻り値: 履歴列数や初回フラグを含むユーティリティを返します。
 * - Chrome DevTools MCP では列切り替え動作が行えることを確認します。
 */
export const useGameLayoutControls = ({
  onRequestReset,
}: UseGameLayoutControlsParams): UseGameLayoutControlsResult => {
  const [isFirst, setIsFirst] = useState(true);
  const [historyColumns, setHistoryColumns] = useState<3 | 4>(4);
  const isFirstState = useMemo(
    () => ({
      isFirst,
      setIsFirst,
    }),
    [isFirst],
  );
  const handleToggleHistoryColumns = useCallback(() => {
    setHistoryColumns((prev) => (prev === 4 ? 3 : 4));
  }, []);
  const handleClearHistory = useCallback(() => {
    setIsFirst(true);
    onRequestReset();
  }, [onRequestReset]);
  const historyToggleLabel = historyColumns === 4 ? "3列表示" : "4列表示";
  return {
    isFirstState,
    historyColumns,
    historyToggleLabel,
    handleToggleHistoryColumns,
    handleClearHistory,
  };
};
