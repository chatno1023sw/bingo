import type { CsvImportResult, Prize, PrizeList } from "~/common/types";
import { readStorageJson, writeStorageJson, storageKeys } from "~/common/utils/storage";

export type ReorderPayload = {
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
  return persistPrizes([]);
};

/**
 * Prize を直接保存するヘルパー。
 */
export const savePrizes = async (prizes: PrizeList): Promise<void> => {
  persistPrizes(prizes);
};
