import type { GameState, DrawHistoryEntry } from "~/common/types";

export type HistoryView = {
  recent: DrawHistoryEntry[];
  all: DrawHistoryEntry[];
};

/**
 * `/history` 相当のスタブ。
 */
export const getHistoryView = async (_gameState: GameState): Promise<HistoryView> => {
  throw new Error("getHistoryView is not implemented yet.");
};
