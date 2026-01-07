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
  bgmStart: "bingo.v1.bgm.start",
  se: "bingo.v1.se",
} as const satisfies Record<string, GameStorageKeys>;

/**
 * localStorage を取得します。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: Storage が無い場合は null を返します。
 * - Chrome DevTools MCP では localStorage の取得を確認します。
 */
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
/**
 * localStorage から JSON を読み取ります。
 *
 * - 副作用: localStorage を読み取ります。
 * - 入力制約: `key` は GameStorageKeys を渡してください。
 * - 戻り値: パース結果、失敗時は fallback を返します。
 * - Chrome DevTools MCP では保存値の読み込みを確認します。
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
/**
 * localStorage に JSON を保存します。
 *
 * - 副作用: localStorage に書き込みます。
 * - 入力制約: `key` は GameStorageKeys を渡してください。
 * - 戻り値: なし。
 * - Chrome DevTools MCP では保存値を確認します。
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
/**
 * localStorage のキーを削除します。
 *
 * - 副作用: localStorage から削除します。
 * - 入力制約: `key` は GameStorageKeys を渡してください。
 * - 戻り値: なし。
 * - Chrome DevTools MCP では削除結果を確認します。
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
/**
 * プレフィックス一致のキーを削除します。
 *
 * - 副作用: localStorage を走査して削除します。
 * - 入力制約: なし。
 * - 戻り値: なし。
 * - Chrome DevTools MCP では削除対象が消えることを確認します。
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
