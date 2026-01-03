import type { GameState, DrawHistoryEntry } from "~/common/types";

/**
 * 抽選履歴を表示順に整形します。
 *
 * - 副作用: ありません。
 * - 入力制約: `gameState` は GameState を渡してください。
 * - 戻り値: 新しい配列を返します。
 * - Chrome DevTools MCP では履歴の並び順を確認します。
 */
export const getHistoryView = (gameState: GameState): DrawHistoryEntry[] => {
  return [...gameState.drawHistory].sort((a, b) => b.sequence - a.sequence);
};
