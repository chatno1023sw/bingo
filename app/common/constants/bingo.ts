/**
 * BINGO の数字範囲と対応文字をまとめた定数クラスです。
 *
 * - 副作用: ありません。
 * - 入力制約: `getLetter` の number は 1〜75 を想定します。
 * - 戻り値: 対応する B/I/N/G/O を返し、範囲外は null を返します。
 * - Chrome DevTools MCP では抽選番号に応じた文字が表示されることを確認します。
 */
export type BingoLetter = "B" | "I" | "N" | "G" | "O";

export class BingoNumberRanges {
  readonly B = { letter: "B", min: 1, max: 15 } as const;
  readonly I = { letter: "I", min: 16, max: 30 } as const;
  readonly N = { letter: "N", min: 31, max: 45 } as const;
  readonly G = { letter: "G", min: 46, max: 60 } as const;
  readonly O = { letter: "O", min: 61, max: 75 } as const;
  readonly ALL = [this.B, this.I, this.N, this.G, this.O] as const;

  /**
   * 数字に対応する BINGO の文字を返します。
   *
   * - 副作用: ありません。
   * - 入力制約: `number` は 1〜75 の範囲で渡してください。
   * - 戻り値: 対応する B/I/N/G/O を返し、範囲外は null を返します。
   * - Chrome DevTools MCP では抽選番号ごとの背景文字が表示されることを確認します。
   */
  getLetter(number: number): BingoLetter | null {
    const range = this.ALL.find((entry) => number >= entry.min && number <= entry.max);
    return range?.letter ?? null;
  }
}

/**
 * BINGO の範囲定義を参照するためのシングルトンです。
 *
 * - 副作用: ありません。
 * - 入力制約: ありません。
 * - 戻り値: BINGO の定数定義にアクセスできます。
 * - Chrome DevTools MCP では背景文字の切り替えを確認します。
 */
export const bingoNumberRanges = new BingoNumberRanges();
