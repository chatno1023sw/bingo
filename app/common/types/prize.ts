/**
 * Setting/Game 双方で共有する景品情報。
 * order は 0 起点で並び順を表す。
 */
export type Prize = {
  /** 景品 ID */
  id: string;
  /** 並び順（0 起点） */
  order: number;
  /** 賞名 */
  prizeName: string;
  /** 賞品名 */
  itemName: string;
  /** 画像参照パス */
  imagePath: string | null;
  /** 選出済みフラグ */
  selected: boolean;
  /** メモ */
  memo: string | null;
};

/**
 * 景品一覧の配列型。
 */
export type PrizeList = Prize[];

/**
 * CSV import/export の結果を表す。
 */
export type CsvImportResult = {
  /** 取り込み元のファイル名 */
  sourceName: string;
  /** 追加件数 */
  addedCount: number;
  /** スキップした行の情報 */
  skipped: Array<{
    /** 対象行の ID */
    id: string;
    /** スキップ理由 */
    reason: string;
  }>;
  /** 処理日時（ISO 8601 形式） */
  processedAt: string;
};
