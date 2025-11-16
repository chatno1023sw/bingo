import { describe, expect, beforeEach, afterEach, it, vi } from "vitest";
import {
  clearVersionedStorage,
  readStorageJson,
  removeStorageKey,
  storageKeys,
  writeStorageJson,
} from "~/common/utils/storage";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("storage utility", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns fallback when storage is unavailable", () => {
    vi.unstubAllGlobals();
    const fallback = { foo: "bar" };
    const result = readStorageJson(storageKeys.gameState, fallback);
    expect(result).toEqual(fallback);
  });

  it("writes and reads JSON data", () => {
    const payload = { currentNumber: 10 };
    writeStorageJson(storageKeys.gameState, payload);
    const result = readStorageJson(storageKeys.gameState, { currentNumber: null });
    expect(result).toEqual(payload);
  });

  it("removes broken JSON and returns fallback", () => {
    const storage = globalThis.localStorage!;
    storage.setItem(storageKeys.gameState, "{ invalid");
    const result = readStorageJson(storageKeys.gameState, { drawHistory: [] });
    expect(result).toEqual({ drawHistory: [] });
    expect(storage.getItem(storageKeys.gameState)).toBeNull();
  });

  it("removes individual keys", () => {
    writeStorageJson(storageKeys.bgm, { enabled: true });
    removeStorageKey(storageKeys.bgm);
    expect(readStorageJson(storageKeys.bgm, { enabled: false })).toEqual({ enabled: false });
  });

  it("clears all versioned keys", () => {
    writeStorageJson(storageKeys.gameState, { currentNumber: 1 });
    writeStorageJson(storageKeys.prizes, []);
    globalThis.localStorage!.setItem("custom", "keep");

    clearVersionedStorage();

    expect(globalThis.localStorage!.getItem(storageKeys.gameState)).toBeNull();
    expect(globalThis.localStorage!.getItem(storageKeys.prizes)).toBeNull();
    expect(globalThis.localStorage!.getItem("custom")).toEqual("keep");
  });
});
