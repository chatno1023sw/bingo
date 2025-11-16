import type { GameState, DrawHistoryEntry } from "~/common/types";

export type HistoryView = {
  recent: DrawHistoryEntry[];
  all: DrawHistoryEntry[];
};

/**
 * `/history` 相当のスタブ。
 */
const RECENT_LIMIT = 10;

const sortBySequence = (history: DrawHistoryEntry[]): DrawHistoryEntry[] =>
  [...history].sort((a, b) => a.sequence - b.sequence);

export const getHistoryView = async (gameState: GameState): Promise<HistoryView> => {
  const sorted = sortBySequence(gameState.drawHistory);
  const recent = sorted.slice(-RECENT_LIMIT).reverse();
  return {
    recent,
    all: sorted,
  };
};
