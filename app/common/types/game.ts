import type { BgmPreference } from "./bgm";
import type { PrizeList } from "./prize";

/**
 * ゲーム進行中の履歴エントリを表す。
 * sequence は 1 起点で連番を採番する。
 */
export type DrawHistoryEntry = {
  number: number;
  sequence: number;
  drawnAt: string;
};

/**
 * Start/Game 画面で共有するゲーム状態。
 * currentNumber が null のときは未確定を表す。
 */
export type GameState = {
  currentNumber: number | null;
  drawHistory: DrawHistoryEntry[];
  isDrawing: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * loader などで gameState/prizes/bgm をまとめて返す際のラッパー。
 */
export type GameStateEnvelope = {
  gameState: GameState;
  prizes: PrizeList;
  bgm: BgmPreference;
};

/**
 * localStorage へ保存するキーを表す。
 */
export type GameStorageKeys =
  | "bingo.v1.gameState"
  | "bingo.v1.prizes"
  | "bingo.v1.bgm";
