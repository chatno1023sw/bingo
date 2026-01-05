import type { DrawHistoryEntry, GameState } from "~/common/types";

export const BINGO_MIN = 1;
export const BINGO_MAX = 75;

const TOTAL_BINGO_NUMBERS = BINGO_MAX - BINGO_MIN + 1;

export class NoAvailableNumbersError extends Error {
  constructor() {
    super("no-available-numbers");
    this.name = "NoAvailableNumbersError";
  }
}

/**
 * 抽選対象の番号一覧を生成します。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: 1〜75 の配列を返します。
 * - Chrome DevTools MCP では生成結果を確認します。
 */
const createNumberRange = (): number[] =>
  Array.from({ length: TOTAL_BINGO_NUMBERS }, (_, index) => BINGO_MIN + index);

/**
 * 抽選可能な番号を取得します。
 *
 * - 副作用: ありません。
 * - 入力制約: `history` は DrawHistoryEntry 配列を渡してください。
 * - 戻り値: 未抽選の番号配列を返します。
 * - Chrome DevTools MCP では抽選済み番号が除外されることを確認します。
 */
export const getAvailableNumbers = (history: DrawHistoryEntry[]): number[] => {
  const used = new Set(history.map((entry) => entry.number));
  return createNumberRange().filter((candidate) => !used.has(candidate));
};

export type DrawOptions = {
  /** 乱数シード */
  seed?: number;
  /** 抽選日時（ISO 8601 形式） */
  timestamp?: string;
};

/**
 * 抽選候補から 1 つの番号を選びます。
 *
 * - 副作用: ありません。
 * - 入力制約: `available` は空配列にしないでください。
 * - 戻り値: 選択した番号を返します。
 * - Chrome DevTools MCP では seed 指定時の再現性を確認します。
 */
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

/**
 * 次の番号を抽選して GameState を更新します。
 *
 * - 副作用: ありません。
 * - 入力制約: `state` は GameState を渡してください。
 * - 戻り値: 更新後の GameState を返します。
 * - Chrome DevTools MCP では currentNumber の更新を確認します。
 */
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
