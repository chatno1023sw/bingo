import type { GameState, DrawHistoryEntry } from "~/common/types";

export const BINGO_MIN = 1;
export const BINGO_MAX = 75;

const TOTAL_BINGO_NUMBERS = BINGO_MAX - BINGO_MIN + 1;

export class NoAvailableNumbersError extends Error {
  constructor() {
    super("no-available-numbers");
    this.name = "NoAvailableNumbersError";
  }
}

const createNumberRange = (): number[] =>
  Array.from({ length: TOTAL_BINGO_NUMBERS }, (_, index) => BINGO_MIN + index);

export const getAvailableNumbers = (history: DrawHistoryEntry[]): number[] => {
  const used = new Set(history.map((entry) => entry.number));
  return createNumberRange().filter((candidate) => !used.has(candidate));
};

export type DrawOptions = {
  seed?: number;
  timestamp?: string;
};

const chooseNumber = (available: number[], seed?: number): number => {
  if (available.length === 0) {
    throw new NoAvailableNumbersError();
  }

  if (typeof seed === "number" && Number.isFinite(seed)) {
    const normalized = Math.abs(Math.trunc(seed));
    const index = normalized % available.length;
    return available[index];
  }

  const randomIndex = Math.min(available.length - 1, Math.floor(Math.random() * available.length));
  return available[randomIndex];
};

export const drawNextNumber = (state: GameState, options: DrawOptions = {}): GameState => {
  const available = getAvailableNumbers(state.drawHistory);
  if (available.length === 0) {
    throw new NoAvailableNumbersError();
  }

  const timestamp = options.timestamp ?? new Date().toISOString();
  const number = chooseNumber(available, options.seed);
  const nextEntry: DrawHistoryEntry = {
    number,
    sequence: state.drawHistory.length + 1,
    drawnAt: timestamp,
  };

  return {
    ...state,
    currentNumber: number,
    drawHistory: [...state.drawHistory, nextEntry],
    isDrawing: false,
    updatedAt: timestamp,
  };
};
