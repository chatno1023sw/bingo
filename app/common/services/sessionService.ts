import type {
  GameState,
  GameStateEnvelope,
  PrizeList,
  BgmPreference,
} from "~/common/types";

export type SessionStartOptions = {
  resetPrizes?: boolean;
};

/**
 * `/session/start` に対応するスタブ。
 */
export const startSession = async (
  _options: SessionStartOptions = {},
): Promise<GameStateEnvelope> => {
  throw new Error("startSession is not implemented yet.");
};

/**
 * `/session/resume` に対応するスタブ。
 * 保存データが無い場合は null を返す想定。
 */
export const resumeSession = async (): Promise<GameStateEnvelope | null> => {
  throw new Error("resumeSession is not implemented yet.");
};

/**
 * GameState/Prize/BGM をまとめて永続化する。
 */
export const persistSessionState = async (
  _payload: {
    gameState: GameState;
    prizes: PrizeList;
    bgm: BgmPreference;
  },
): Promise<void> => {
  throw new Error("persistSessionState is not implemented yet.");
};
