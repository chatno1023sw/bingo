import type { Prize, PrizeList } from "~/common/types";
import { normalizeKeyText } from "~/common/utils/text";

export type CsvParseResult = {
  /** 正常に取り込めた景品一覧 */
  prizes: PrizeList;
  /** スキップした行の情報 */
  skipped: Array<{ id: string; reason: string }>;
};

export const PRIZE_CSV_HEADER = [
  "id",
  "order",
  "prizeName",
  "itemName",
  "imagePath",
  "selected",
  "memo",
] as const;

/**
 * CSV 1 行を分割します。
 *
 * - 副作用: ありません。
 * - 入力制約: `line` は CSV の 1 行を渡してください。
 * - 戻り値: 各カラムの配列を返します。
 * - Chrome DevTools MCP では CSV の分割結果を確認します。
 */
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

/**
 * ヘッダー行を正規化します。
 *
 * - 副作用: ありません。
 * - 入力制約: `line` はヘッダー行を渡してください。
 * - 戻り値: 正規化済みヘッダー配列を返します。
 * - Chrome DevTools MCP ではヘッダー一致を確認します。
 */
const normalizeHeader = (line: string): string[] => parseCsvLine(line).map((value) => value.trim());

/**
 * CSV の真偽値を判定します。
 *
 * - 副作用: ありません。
 * - 入力制約: `value` は文字列を渡してください。
 * - 戻り値: 真偽値を返します。
 * - Chrome DevTools MCP では true/false の解釈を確認します。
 */
const parseBoolean = (value: string): boolean => {
  const normalized = normalizeKeyText(value);
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

/**
 * 空文字列を null に変換します。
 *
 * - 副作用: ありません。
 * - 入力制約: `value` は文字列を渡してください。
 * - 戻り値: 空なら null、それ以外は文字列を返します。
 * - Chrome DevTools MCP では空値の扱いを確認します。
 */
const toNullable = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

/**
 * CSV ヘッダーの妥当性を検証します。
 *
 * - 副作用: ありません。
 * - 入力制約: `values` はヘッダー配列を渡してください。
 * - 戻り値: 妥当であれば true を返します。
 * - Chrome DevTools MCP ではヘッダー不一致時の挙動を確認します。
 */
const validateHeader = (values: string[]): boolean => {
  if (values.length !== PRIZE_CSV_HEADER.length) {
    return false;
  }
  return values.every((value, index) => value === PRIZE_CSV_HEADER[index]);
};

/**
 * 景品 CSV を解析します。
 *
 * - 副作用: ありません。
 * - 入力制約: `input` は CSV 全文を渡してください。
 * - 戻り値: 解析結果を返します。
 * - Chrome DevTools MCP では CSV 取り込み結果を確認します。
 */
export const parsePrizesCsv = (input: string): CsvParseResult => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { prizes: [], skipped: [] };
  }

  const header = normalizeHeader(lines[0]);
  if (!validateHeader(header)) {
    throw new Error("invalid-csv-header");
  }

  const prizes: PrizeList = [];
  const skipped: Array<{ id: string; reason: string }> = [];
  const seenIds = new Set<string>();

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line).map((value) => value.trim());
    if (values.length !== header.length) {
      skipped.push({ id: values[0] ?? "", reason: "column-mismatch" });
      continue;
    }

    const [id, orderValue, prizeName, itemName, imagePath, selectedValue, memo] = values;
    if (!id || !prizeName || !itemName) {
      skipped.push({ id: id ?? "", reason: "missing-required" });
      continue;
    }

    if (seenIds.has(id)) {
      skipped.push({ id, reason: "duplicate-id" });
      continue;
    }

    const order = Number.parseInt(orderValue, 10);
    if (Number.isNaN(order)) {
      skipped.push({ id, reason: "invalid-order" });
      continue;
    }

    const prize: Prize = {
      id,
      order,
      prizeName,
      itemName,
      imagePath: toNullable(imagePath),
      selected: parseBoolean(selectedValue),
      memo: toNullable(memo),
    };
    prizes.push(prize);
    seenIds.add(id);
  }

  const normalized = prizes
    .sort((a, b) => a.order - b.order)
    .map<Prize>((prize, index) => ({
      ...prize,
      order: index,
    }));

  return { prizes: normalized, skipped };
};

/**
 * CSV フィールドをエスケープします。
 *
 * - 副作用: ありません。
 * - 入力制約: `value` は文字列または null を渡してください。
 * - 戻り値: エスケープ済み文字列を返します。
 * - Chrome DevTools MCP ではクォート処理を確認します。
 */
const escapeCsvField = (value: string | null | undefined): string => {
  if (value == null) {
    return "";
  }
  const needsQuote = /[",\n]/.test(value);
  const normalized = value.replace(/"/g, '""');
  return needsQuote ? `"${normalized}"` : normalized;
};

/**
 * 景品一覧から CSV を生成します。
 *
 * - 副作用: ありません。
 * - 入力制約: `prizes` は PrizeList を渡してください。
 * - 戻り値: CSV 文字列を返します。
 * - Chrome DevTools MCP ではエクスポート結果を確認します。
 */
export const generatePrizesCsv = (prizes: PrizeList): string => {
  const header = PRIZE_CSV_HEADER.join(",");
  const rows = prizes
    .sort((a, b) => a.order - b.order)
    .map((prize) =>
      [
        prize.id,
        prize.order.toString(),
        prize.prizeName,
        prize.itemName,
        prize.imagePath ?? "",
        prize.selected ? "true" : "false",
        prize.memo ?? "",
      ]
        .map((value) => escapeCsvField(value))
        .join(","),
    );

  return [header, ...rows].join("\n");
};
