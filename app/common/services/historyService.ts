import type { GameState, DrawHistoryEntry } from "~/common/types";

export const getHistoryView = (gameState: GameState): DrawHistoryEntry[] => {
  return [...gameState.drawHistory].sort((a, b) => b.sequence - a.sequence);
};
