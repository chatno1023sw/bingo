import type { CsvImportResult, Prize, PrizeList } from "~/common/types";

export type ReorderPayload = {
  order: string[];
};

/**
 * `/prizes` 相当の取得。
 */
export const getPrizes = async (): Promise<PrizeList> => {
  throw new Error("getPrizes is not implemented yet.");
};

/**
 * `/prizes/toggle`
 */
export const togglePrize = async (_id: string, _selected: boolean): Promise<PrizeList> => {
  throw new Error("togglePrize is not implemented yet.");
};

/**
 * `/prizes/reorder`
 */
export const reorderPrizes = async (_payload: ReorderPayload): Promise<PrizeList> => {
  throw new Error("reorderPrizes is not implemented yet.");
};

/**
 * `/prizes/import`
 */
export const importPrizes = async (_file: File): Promise<CsvImportResult> => {
  throw new Error("importPrizes is not implemented yet.");
};

/**
 * `/prizes/export`
 */
export const exportPrizes = async (_prizes: PrizeList): Promise<Blob> => {
  throw new Error("exportPrizes is not implemented yet.");
};

/**
 * `/prizes/delete-all`
 */
export const deleteAllPrizes = async (): Promise<PrizeList> => {
  throw new Error("deleteAllPrizes is not implemented yet.");
};

/**
 * Prize を直接保存するヘルパー。
 */
export const savePrizes = async (_prizes: PrizeList): Promise<void> => {
  throw new Error("savePrizes is not implemented yet.");
};
