import type { GameState, GameStateEnvelope, Prize, PrizeList, BgmPreference } from "~/common/types";
import { readStorageJson, writeStorageJson, storageKeys } from "~/common/utils/storage";

export type SessionStartOptions = {
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
