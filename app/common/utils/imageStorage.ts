const imageStorageName = "bingo-prize-images";
const imageStoreName = "prize-images";
const imageKeyPrefix = "idb:";

const isIndexedDbAvailable = (): boolean =>
  typeof globalThis !== "undefined" && typeof globalThis.indexedDB !== "undefined";

const openImageDatabase = (): Promise<IDBDatabase> => {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error("indexeddb-unavailable"));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(imageStorageName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(imageStoreName)) {
        db.createObjectStore(imageStoreName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexeddb-open-error"));
  });
};

const withImageDatabase = async <T>(task: (db: IDBDatabase) => Promise<T>): Promise<T> => {
  const db = await openImageDatabase();
  try {
    return await task(db);
  } finally {
    db.close();
  }
};

/**
 * IndexedDB 上に保存する画像キーを組み立てます。
 *
 * - 副作用: なし。
 * - 入力制約: `prizeId` は空文字列にしないでください。
 * - 戻り値: IndexedDB の参照に使う接頭辞付きキーを返します。
 * - Chrome DevTools MCP: Application タブで `bingo-prize-images` のキーが追加されることを確認します。
 */
export const buildPrizeImagePath = (prizeId: string): string => `${imageKeyPrefix}${prizeId}`;

/**
 * 画像キーが IndexedDB 管理の形式かどうか判定します。
 *
 * - 副作用: なし。
 * - 入力制約: `value` は `string | null` を想定します。
 * - 戻り値: 接頭辞が一致する場合に true を返します。
 * - Chrome DevTools MCP: 画像保存後に `idb:` から始まるキーを確認します。
 */
export const isPrizeImagePath = (value: string | null): value is string =>
  typeof value === "string" && value.startsWith(imageKeyPrefix);

/**
 * IndexedDB キーから賞品 ID を取り出します。
 *
 * - 副作用: なし。
 * - 入力制約: `imagePath` は `idb:` で始まる文字列を渡してください。
 * - 戻り値: 接頭辞を除いた賞品 ID を返します。
 * - Chrome DevTools MCP: `idb:` プレフィックスの解除結果をコンソールで確認します。
 */
export const extractPrizeImageId = (imagePath: string): string =>
  imagePath.slice(imageKeyPrefix.length);

/**
 * 賞品画像を IndexedDB に保存します。
 *
 * - 副作用: `bingo-prize-images` に Blob を保存します。
 * - 入力制約: `prizeId` は空文字列にせず、`file` は画像ファイルを渡してください。
 * - 戻り値: 保存完了後に resolve する Promise を返します。
 * - Chrome DevTools MCP: Application > IndexedDB でキーが作成されることを確認します。
 */
export const savePrizeImage = async (prizeId: string, file: Blob): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    throw new Error("indexeddb-unavailable");
  }
  await withImageDatabase(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(imageStoreName, "readwrite");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error("image-storage-write-error"));
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("image-storage-write-error"));
        const store = transaction.objectStore(imageStoreName);
        store.put(file, prizeId);
      }),
  );
};

/**
 * 賞品画像を IndexedDB から読み取ります。
 *
 * - 副作用: なし。
 * - 入力制約: `prizeId` は空文字列にしないでください。
 * - 戻り値: Blob が存在しない場合は null を返します。
 * - Chrome DevTools MCP: Application > IndexedDB で値を確認し、取得結果を表示します。
 */
export const readPrizeImage = async (prizeId: string): Promise<Blob | null> => {
  if (!isIndexedDbAvailable()) {
    return null;
  }
  return withImageDatabase(
    (db) =>
      new Promise<Blob | null>((resolve, reject) => {
        const transaction = db.transaction(imageStoreName, "readonly");
        const store = transaction.objectStore(imageStoreName);
        const request = store.get(prizeId);
        request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
        request.onerror = () => reject(request.error ?? new Error("image-storage-read-error"));
      }),
  );
};

/**
 * 賞品画像を IndexedDB から削除します。
 *
 * - 副作用: `bingo-prize-images` から該当キーを削除します。
 * - 入力制約: `prizeId` は空文字列にしないでください。
 * - 戻り値: 削除完了後に resolve する Promise を返します。
 * - Chrome DevTools MCP: Application > IndexedDB でキー削除を確認します。
 */
export const deletePrizeImage = async (prizeId: string): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    return;
  }
  await withImageDatabase(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(imageStoreName, "readwrite");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error("image-storage-delete-error"));
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("image-storage-delete-error"));
        const store = transaction.objectStore(imageStoreName);
        store.delete(prizeId);
      }),
  );
};

/**
 * 賞品画像をまとめて削除します。
 *
 * - 副作用: 受け取った賞品 ID に対応する画像を削除します。
 * - 入力制約: `prizeIds` は重複のない配列を渡してください。
 * - 戻り値: 削除処理が完了したら resolve する Promise を返します。
 * - Chrome DevTools MCP: Application > IndexedDB で削除対象が消えることを確認します。
 */
export const deletePrizeImages = async (prizeIds: string[]): Promise<void> => {
  if (!isIndexedDbAvailable() || prizeIds.length === 0) {
    return;
  }
  await Promise.all(prizeIds.map((id) => deletePrizeImage(id)));
};

/**
 * すべての賞品画像を削除します。
 *
 * - 副作用: 画像ストア全体を空にします。
 * - 入力制約: なし。
 * - 戻り値: 削除完了後に resolve する Promise を返します。
 * - Chrome DevTools MCP: Application > IndexedDB のレコードが空になることを確認します。
 */
export const clearPrizeImages = async (): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    return;
  }
  await withImageDatabase(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(imageStoreName, "readwrite");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error("image-storage-clear-error"));
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("image-storage-clear-error"));
        const store = transaction.objectStore(imageStoreName);
        store.clear();
      }),
  );
};
