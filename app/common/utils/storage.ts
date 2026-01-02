import type { GameStorageKeys } from "~/common/types";

/**
 * localStorage で使用するプレフィックス。
 */
export const STORAGE_PREFIX = "bingo.v1.";

/**
 * バージョン付きキーを列挙した定数。
 */
export const storageKeys = {
	gameState: "bingo.v1.gameState",
	prizes: "bingo.v1.prizes",
	bgm: "bingo.v1.bgm",
} as const satisfies Record<string, GameStorageKeys>;

const getStorage = (): Storage | null => {
	if (typeof globalThis === "undefined") {
		return null;
	}
	const candidate = (globalThis as { localStorage?: Storage }).localStorage;
	return candidate ?? null;
};

/**
 * JSON を読み出し、存在しない・壊れている場合は fallback を返す。
 */
export const readStorageJson = <T>(key: GameStorageKeys, fallback: T): T => {
	const storage = getStorage();
	if (!storage) {
		return fallback;
	}

	const raw = storage.getItem(key);
	if (!raw) {
		return fallback;
	}

	try {
		return JSON.parse(raw) as T;
	} catch {
		storage.removeItem(key);
		return fallback;
	}
};

/**
 * JSON を保存する。localStorage が無い環境では何も行わない。
 */
export const writeStorageJson = <T>(key: GameStorageKeys, value: T): void => {
	const storage = getStorage();
	if (!storage) {
		return;
	}
	storage.setItem(key, JSON.stringify(value));
};

/**
 * 指定キーを削除する。
 */
export const removeStorageKey = (key: GameStorageKeys): void => {
	const storage = getStorage();
	if (!storage) {
		return;
	}
	storage.removeItem(key);
};

/**
 * `bingo.v1.` で始まるキーを全削除する。
 */
export const clearVersionedStorage = (): void => {
	const storage = getStorage();
	if (!storage) {
		return;
	}

	const keysToDelete: string[] = [];
	for (let i = 0; i < storage.length; i += 1) {
		const key = storage.key(i);
		if (key?.startsWith(STORAGE_PREFIX)) {
			keysToDelete.push(key);
		}
	}

	for (const key of keysToDelete) {
		storage.removeItem(key);
	}
};
