import type { CsvImportResult, Prize, PrizeList } from "~/common/types";
import { parsePrizesCsv, generatePrizesCsv } from "~/common/utils/csvParser";
import {
  clearPrizeImages,
  deletePrizeImages,
  extractPrizeImageId,
  isPrizeImagePath,
} from "~/common/utils/imageStorage";
import { readStorageJson, writeStorageJson, storageKeys } from "~/common/utils/storage";

export type ReorderPayload = {
  /** 並び順の ID 配列 */
  order: string[];
};

/**
 * `/prizes` 相当の取得。
 */
const readPrizes = (): PrizeList => readStorageJson(storageKeys.prizes, []);

const normalizePrizes = (prizes: PrizeList): PrizeList =>
  [...prizes]
    .sort((a, b) => a.order - b.order)
    .map<Prize>((prize, index) => ({
      ...prize,
      order: index,
    }));

const persistPrizes = (prizes: PrizeList): PrizeList => {
  const normalized = normalizePrizes(prizes);
  writeStorageJson(storageKeys.prizes, normalized);
  return normalized;
};

export const getPrizes = async (): Promise<PrizeList> => {
  return normalizePrizes(readPrizes());
};

/**
 * `/prizes/toggle`
 */
export const togglePrize = async (id: string, selected: boolean): Promise<PrizeList> => {
  const prizes = await getPrizes();
  const updated = prizes.map((prize) =>
    prize.id === id
      ? {
          ...prize,
          selected,
        }
      : prize,
  );
  return persistPrizes(updated);
};

/**
 * `/prizes/reorder`
 */
export const reorderPrizes = async (payload: ReorderPayload): Promise<PrizeList> => {
  const prizes = await getPrizes();
  const lookup = new Map(prizes.map((prize) => [prize.id, prize]));
  const ordered: PrizeList = payload.order
    .map((id) => lookup.get(id))
    .filter((prize): prize is Prize => Boolean(prize));
  const remaining = prizes.filter((prize) => !payload.order.includes(prize.id));
  return persistPrizes([...ordered, ...remaining]);
};

/**
 * `/prizes/import`
 */
export const importPrizes = async (file: File): Promise<CsvImportResult> => {
  const text = await file.text();
  const { prizes, skipped } = parsePrizesCsv(text);
  await savePrizes(prizes);
  return {
    sourceName: file.name,
    addedCount: prizes.length,
    skipped,
    processedAt: new Date().toISOString(),
  };
};

/**
 * `/prizes/export`
 */
export const exportPrizes = async (prizes: PrizeList): Promise<Blob> => {
  const csv = generatePrizesCsv(prizes);
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
};

/**
 * `/prizes/delete-all`
 */
export const deleteAllPrizes = async (): Promise<PrizeList> => {
  await clearPrizeImages();
  return persistPrizes([]);
};

/**
 * Prize を直接保存するヘルパー。
 */
export const savePrizes = async (prizes: PrizeList): Promise<void> => {
  const stored = readPrizes();
  const storedImageIds = stored
    .map((prize) => prize.imagePath)
    .filter(isPrizeImagePath)
    .map((imagePath) => extractPrizeImageId(imagePath));
  const nextImageIds = new Set(
    prizes
      .map((prize) => prize.imagePath)
      .filter(isPrizeImagePath)
      .map((imagePath) => extractPrizeImageId(imagePath)),
  );
  const removedImageIds = storedImageIds.filter((id) => !nextImageIds.has(id));
  await deletePrizeImages(removedImageIds);
  persistPrizes(prizes);
};
