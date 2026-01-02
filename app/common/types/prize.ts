/**
 * Setting/Game 双方で共有する景品情報。
 * order は 0 起点で並び順を表す。
 */
export type Prize = {
  id: string;
  order: number;
  prizeName: string;
  itemName: string;
  imagePath: string | null;
  selected: boolean;
  memo: string | null;
};

export type PrizeList = Prize[];

/**
 * CSV import/export の結果を表す。
 */
export type CsvImportResult = {
  sourceName: string;
  addedCount: number;
  skipped: Array<{
    id: string;
    reason: string;
  }>;
  processedAt: string;
};
