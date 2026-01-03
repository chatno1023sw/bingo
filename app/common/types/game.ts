import type { BgmPreference } from "./bgm";
import type { PrizeList } from "./prize";

/**
 * ゲーム進行中の履歴エントリを表す。
 * sequence は 1 起点で連番を採番する。
 */
export type DrawHistoryEntry = {
  /** 抽選された番号 */
  number: number;
  /** 抽選順序（1 起点） */
  sequence: number;
  /** 抽選日時（ISO 8601 形式） */
  drawnAt: string;
};

/**
 * Start/Game 画面で共有するゲーム状態。
 * currentNumber が null のときは未確定を表す。
 */
export type GameState = {
  /** 現在の当選番号 */
  currentNumber: number | null;
  /** 抽選履歴一覧 */
  drawHistory: DrawHistoryEntry[];
  /** 抽選中フラグ */
  isDrawing: boolean;
  /** 作成日時（ISO 8601 形式） */
  createdAt: string;
  /** 更新日時（ISO 8601 形式） */
  updatedAt: string;
};

/**
 * loader などで gameState/prizes/bgm をまとめて返す際のラッパー。
 */
export type GameStateEnvelope = {
  /** ゲーム状態 */
  gameState: GameState;
  /** 景品一覧 */
  prizes: PrizeList;
  /** BGM 設定 */
  bgm: BgmPreference;
};

/**
 * localStorage へ保存するキーを表す。
 */
export type GameStorageKeys = "bingo.v1.gameState" | "bingo.v1.prizes" | "bingo.v1.bgm";
