import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BgmPreference, GameState, PrizeList } from "~/common/types";
import { storageKeys } from "~/common/utils/storage";
import { hasStoredPrizeSelection, startSession, resumeSession } from "~/common/services/sessionService";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
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

const baseDate = new Date("2025-01-01T00:00:00.000Z");

/**
 * テスト用の景品一覧を生成します。
 */
const createStoredPrizes = (): PrizeList => [
  {
    id: "p-1",
    order: 0,
    prizeName: "一等",
    itemName: "Switch",
    imagePath: null,
    selected: true,
    memo: null,
  },
  {
    id: "p-2",
    order: 1,
    prizeName: "二等",
    itemName: "ギフト券",
    imagePath: null,
    selected: false,
    memo: null,
  },
];

/**
 * テスト用にセッション情報を保存します。
 */
const storeEnvelope = (payload: {
  gameState: GameState;
  prizes: PrizeList;
  bgm: BgmPreference;
}) => {
  localStorage.setItem(storageKeys.gameState, JSON.stringify(payload.gameState));
  localStorage.setItem(storageKeys.prizes, JSON.stringify(payload.prizes));
  localStorage.setItem(storageKeys.bgm, JSON.stringify(payload.bgm));
};

/**
 * localStorage の JSON を読み取ります。
 */
const parseStoredJson = <T>(key: string): T => {
  const raw = localStorage.getItem(key);
  if (raw === null) {
    throw new Error(`localStorage に ${key} が保存されていることを期待しています`);
  }
  return JSON.parse(raw) as T;
};

describe("sessionService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("startSession initializes fresh game state and resets prize selection while keeping BGM preference", async () => {
    const storedPrizes = createStoredPrizes();
    const storedBgm: BgmPreference = {
      enabled: false,
      volume: 0.25,
      updatedAt: "2024-12-31T23:59:00.000Z",
    };
    localStorage.setItem(storageKeys.prizes, JSON.stringify(storedPrizes));
    localStorage.setItem(storageKeys.bgm, JSON.stringify(storedBgm));
    localStorage.setItem(
      storageKeys.gameState,
      JSON.stringify({
        currentNumber: 42,
        drawHistory: [{ number: 42, sequence: 1, drawnAt: "2024-12-31T23:58:00.000Z" }],
        isDrawing: false,
        createdAt: "2024-12-31T23:58:00.000Z",
        updatedAt: "2024-12-31T23:58:00.000Z",
      }),
    );

    const result = await startSession();

    expect(result.gameState).toEqual({
      currentNumber: null,
      drawHistory: [],
      isDrawing: false,
      createdAt: baseDate.toISOString(),
      updatedAt: baseDate.toISOString(),
    });
    expect(parseStoredJson<GameState>(storageKeys.gameState)).toEqual(result.gameState);
    expect(result.prizes).toEqual(
      storedPrizes.map((prize) => ({
        ...prize,
        selected: false,
      })),
    );
    expect(parseStoredJson<PrizeList>(storageKeys.prizes)).toEqual(result.prizes);
    expect(result.bgm).toEqual(storedBgm);
    expect(parseStoredJson<BgmPreference>(storageKeys.bgm)).toEqual(storedBgm);
  });

  it("startSession respects resetPrizes=false by keeping existing selection", async () => {
    const storedPrizes = createStoredPrizes();
    localStorage.setItem(storageKeys.prizes, JSON.stringify(storedPrizes));

    const result = await startSession({ resetPrizes: false });

    expect(result.prizes).toEqual(storedPrizes);
    expect(parseStoredJson<PrizeList>(storageKeys.prizes)).toEqual(storedPrizes);
  });

  it("resumeSession returns null when there is no saved game state", async () => {
    localStorage.removeItem(storageKeys.gameState);

    await expect(resumeSession()).resolves.toBeNull();
  });

  it("resumeSession returns stored envelope when data exists", async () => {
    const storedPayload = {
      gameState: {
        currentNumber: 10,
        drawHistory: [
          { number: 1, sequence: 1, drawnAt: "2024-12-31T23:00:00.000Z" },
          { number: 10, sequence: 2, drawnAt: "2024-12-31T23:01:00.000Z" },
        ],
        isDrawing: false,
        createdAt: "2024-12-31T22:59:00.000Z",
        updatedAt: "2024-12-31T23:01:00.000Z",
      },
      prizes: createStoredPrizes(),
      bgm: {
        enabled: true,
        volume: 0.6,
        updatedAt: "2024-12-31T22:00:00.000Z",
      },
    };
    storeEnvelope(storedPayload);

    const result = await resumeSession();

    expect(result).toEqual(storedPayload);
  });

  it("hasStoredPrizeSelection returns true when any prize is selected", () => {
    localStorage.setItem(storageKeys.prizes, JSON.stringify(createStoredPrizes()));

    expect(hasStoredPrizeSelection()).toBe(true);
  });

  it("hasStoredPrizeSelection returns false when no selection exists", () => {
    const storedPrizes = createStoredPrizes().map((prize) => ({
      ...prize,
      selected: false,
    }));
    localStorage.setItem(storageKeys.prizes, JSON.stringify(storedPrizes));

    expect(hasStoredPrizeSelection()).toBe(false);
  });
});
