import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { DrawHistoryEntry, GameState } from "~/common/types";
import {
  BINGO_MAX,
  BINGO_MIN,
  NoAvailableNumbersError,
  drawNextNumber,
  getAvailableNumbers,
} from "../bingoEngine";

/**
 * テスト用の抽選履歴を生成します。
 */
const createHistory = (numbers: number[]): DrawHistoryEntry[] =>
  numbers.map((number, index) => ({
    number,
    sequence: index + 1,
    drawnAt: new Date(2025, 0, 1, 0, 0, index).toISOString(),
  }));

/**
 * テスト用の GameState を生成します。
 */
const createState = (history: DrawHistoryEntry[] = []): GameState => ({
  currentNumber: history.length ? history[history.length - 1].number : null,
  drawHistory: history,
  isDrawing: false,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
});

/**
 * 最新の履歴エントリを取得します。
 */
const latestEntry = (history: DrawHistoryEntry[]): DrawHistoryEntry => {
  const entry = history.at(-1);
  if (!entry) {
    throw new Error("抽選履歴が空でないことを期待しています");
  }
  return entry;
};

describe("getAvailableNumbers", () => {
  it("returns every number within the inclusive bingo range when history is empty", () => {
    const available = getAvailableNumbers([]);

    expect(available[0]).toBe(BINGO_MIN);
    expect(available.at(-1)).toBe(BINGO_MAX);
    expect(available).toHaveLength(BINGO_MAX - BINGO_MIN + 1);
  });

  it("removes drawn numbers and keeps the ascending order", () => {
    const history = createHistory([5, 10, 20]);

    const available = getAvailableNumbers(history);

    expect(available).not.toContain(5);
    expect(available).not.toContain(10);
    expect(available).not.toContain(20);
    expect(available[0]).toBe(BINGO_MIN);
    expect(available[available.length - 1]).toBe(BINGO_MAX);
    const sorted = [...available].sort((a, b) => a - b);
    expect(available).toEqual(sorted);
  });
});

describe("drawNextNumber", () => {
  const timestamp = "2025-02-01T12:00:00.000Z";

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.25);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selects a number deterministically when seed is provided", () => {
    const history = createHistory([1, 2, 3]);
    const state = createState(history);

    const next = drawNextNumber(state, { seed: 7, timestamp });

    expect(next.drawHistory).toHaveLength(history.length + 1);
    const entry = latestEntry(next.drawHistory);
    expect(entry.sequence).toBe(4);
    expect(entry.drawnAt).toBe(timestamp);
    expect(next.currentNumber).toBe(entry.number);
    expect(next.updatedAt).toBe(timestamp);
    expect(next.isDrawing).toBe(false);
    // 元の state を破壊しない
    expect(state.drawHistory).toHaveLength(history.length);
  });

  it("falls back to Math.random when seed is not provided", () => {
    const state = createState();

    const next = drawNextNumber(state, { timestamp });

    const entry = latestEntry(next.drawHistory);
    const expectedIndex = Math.floor(0.25 * (BINGO_MAX - BINGO_MIN + 1));
    expect(entry.number).toBe(BINGO_MIN + expectedIndex);
  });

  it("throws when all bingo numbers are already drawn", () => {
    const allNumbers = Array.from({ length: BINGO_MAX - BINGO_MIN + 1 }, (_, i) => BINGO_MIN + i);
    const fullState = createState(createHistory(allNumbers));

    expect(() => drawNextNumber(fullState)).toThrow(NoAvailableNumbersError);
  });
});
