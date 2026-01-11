import type { PrizeList } from "~/common/types";

/**
 * 景品 ID を生成します。
 */
const generatePrizeId = () =>
  globalThis.crypto?.randomUUID?.() ?? `prize-${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * CSV の選出値を真偽値へ変換します。
 *
 * - 副作用: ありません。
 * - 入力制約: `value` には文字列または undefined を渡してください。
 * - 戻り値: 選出フラグの真偽値を返します。
 * - Chrome DevTools MCP では CSV パース時のフラグ変換を確認します。
 */
export const normalizeSelected = (value?: string): boolean => {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "selected" ||
    value.trim() === "選出"
  );
};

/**
 * 空の景品カードを生成します。
 *
 * - 副作用: ありません。
 * - 入力制約: `order` には 0 起点の並び順を渡してください。
 * - 戻り値: 初期値を設定した Prize を返します。
 * - Chrome DevTools MCP では追加カードの初期化を確認します。
 */
export const createEmptyPrize = (order: number) => ({
  id: generatePrizeId(),
  order,
  prizeName: "",
  itemName: "",
  imagePath: null,
  selected: false,
  memo: null,
});

/**
 * 既存景品との一致判定を行います。
 *
 * - 副作用: ありません。
 * - 入力制約: `left`/`right` には順序済みの PrizeList を渡してください。
 * - 戻り値: 完全一致なら true を返します。
 * - Chrome DevTools MCP では変更検知が正しく行われることを確認します。
 */
export const arePrizesEqual = (left: PrizeList, right: PrizeList) => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((prize, index) => {
    const target = right[index];
    return (
      prize.id === target.id &&
      prize.order === target.order &&
      prize.prizeName === target.prizeName &&
      prize.itemName === target.itemName &&
      prize.imagePath === target.imagePath &&
      prize.selected === target.selected &&
      prize.memo === target.memo
    );
  });
};

export type CsvParsedPrize = {
  prizeName: string;
  itemName: string;
  selected: boolean;
};

/**
 * CSV 行を下書き用のデータに整形します。
 *
 * - 副作用: ありません。
 * - 入力制約: `row` には前処理済みの CSV 行を渡してください。
 * - 戻り値: 下書きへ追加する Prize を返します。
 * - Chrome DevTools MCP では CSV 取り込み後の値を確認します。
 */
export const buildParsedPrize = (row: CsvParsedPrize, order: number) => ({
  id: generatePrizeId(),
  order,
  prizeName: row.prizeName,
  itemName: row.itemName,
  imagePath: null,
  selected: row.selected,
  memo: null,
});
