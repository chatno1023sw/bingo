import type { GameState, GameStateEnvelope, Prize, PrizeList, BgmPreference } from "~/common/types";
import { readStorageJson, writeStorageJson, storageKeys } from "~/common/utils/storage";

export type SessionStartOptions = {
  /** 景品の選出状態を初期化するかどうか */
  resetPrizes?: boolean;
};

const DEFAULT_BGM_VOLUME = 0.6;

const createDefaultGameState = (timestamp: string): GameState => ({
  currentNumber: null,
  drawHistory: [],
  isDrawing: false,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const createDefaultBgmPreference = (timestamp: string): BgmPreference => ({
  enabled: true,
  volume: DEFAULT_BGM_VOLUME,
  updatedAt: timestamp,
});

const readStoredGameState = (): GameState | null =>
  readStorageJson<GameState | null>(storageKeys.gameState, null);

const readStoredPrizes = (): PrizeList => readStorageJson<PrizeList>(storageKeys.prizes, []);

const readStoredBgm = (timestamp: string): BgmPreference => {
  const stored = readStorageJson<BgmPreference | null>(storageKeys.bgm, null);
  return stored ?? createDefaultBgmPreference(timestamp);
};

const resetPrizeSelections = (prizes: PrizeList): PrizeList =>
  prizes.map<Prize>((prize) => ({
    ...prize,
    selected: false,
  }));

/**
 * `/session/start` に対応するスタブ。
 */
export const startSession = async (
  options: SessionStartOptions = {},
): Promise<GameStateEnvelope> => {
  const now = new Date().toISOString();
  const shouldResetPrizes = options.resetPrizes ?? true;
  const storedPrizes = readStoredPrizes();
  const prizes = shouldResetPrizes ? resetPrizeSelections(storedPrizes) : [...storedPrizes];
  const gameState = createDefaultGameState(now);
  const bgm = readStoredBgm(now);

  await persistSessionState({ gameState, prizes, bgm });
  return { gameState, prizes, bgm };
};

/**
 * `/session/resume` に対応するスタブ。
 * 保存データが無い場合は null を返す想定。
 */
export const resumeSession = async (): Promise<GameStateEnvelope | null> => {
  const storedGameState = readStoredGameState();
  if (!storedGameState) {
    return null;
  }

  const now = new Date().toISOString();
  const prizes = readStoredPrizes();
  const bgm = readStoredBgm(now);

  return {
    gameState: storedGameState,
    prizes,
    bgm,
  };
};

/**
 * GameState/Prize/BGM をまとめて永続化する。
 */
export const persistSessionState = async (payload: {
  gameState: GameState;
  prizes: PrizeList;
  bgm: BgmPreference;
}): Promise<void> => {
  writeStorageJson(storageKeys.gameState, payload.gameState);
  writeStorageJson(storageKeys.prizes, payload.prizes);
  writeStorageJson(storageKeys.bgm, payload.bgm);
};

/**
 * 抽選履歴が保存済みかを判定します。
 *
 * - 入力制約: 引数は受け取りません。
 * - 副作用: localStorage から GameState を読み取ります。
 * - 戻り値: 抽選履歴が 1 件以上なら true、それ以外は false です。
 * - Chrome DevTools MCP では Start 画面の「はじめから」押下時に確認ダイアログが開くことを確認します。
 */
export const hasStoredDrawHistory = (): boolean => {
  const storedGameState = readStorageJson<GameState | null>(storageKeys.gameState, null);
  if (!storedGameState) {
    return false;
  }
  return storedGameState.drawHistory.length > 0;
};

/**
 * 保存済みのゲーム状態が存在するかを判定します。
 *
 * - 入力制約: 引数は受け取りません。
 * - 副作用: localStorage から GameState を読み取ります。
 * - 戻り値: GameState が存在する場合は true、それ以外は false です。
 * - Chrome DevTools MCP では Start 画面で「続きから」が表示される条件を確認します。
 */
export const hasStoredGameState = (): boolean => {
  const storedGameState = readStorageJson<GameState | null>(storageKeys.gameState, null);
  return storedGameState !== null;
};
