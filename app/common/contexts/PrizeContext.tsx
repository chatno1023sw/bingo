import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { PrizeList } from "~/common/types";
import {
  getPrizes,
  togglePrize as togglePrizeService,
  savePrizes as savePrizesService,
} from "~/common/services/prizeService";
import { storageKeys } from "~/common/utils/storage";

export type PrizeContextValue = {
  /** 景品一覧 */
  prizes: PrizeList;
  /** 取得中フラグ */
  isLoading: boolean;
  /** 更新中フラグ */
  isMutating: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 景品一覧を再取得する関数 */
  refresh: () => Promise<void>;
  /** 景品の選出状態を切り替える関数 */
  togglePrize: (id: string, nextSelected?: boolean) => Promise<void>;
  /** 景品一覧を保存する関数 */
  applyPrizes: (next: PrizeList) => Promise<void>;
};

type PrizeProviderProps = {
  /** 初期景品一覧 */
  initialPrizes?: PrizeList;
  /** 子要素 */
  children: React.ReactNode;
};

const normalizeInitialPrizes = (prizes?: PrizeList): PrizeList =>
  prizes ? [...prizes].sort((a, b) => a.order - b.order) : [];

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "unknown-error";
};

export const PrizeContext = createContext<PrizeContextValue | undefined>(undefined);

export const PrizeProvider = ({ initialPrizes, children }: PrizeProviderProps) => {
  const [prizes, setPrizes] = useState<PrizeList>(() => normalizeInitialPrizes(initialPrizes));
  const [isLoading, setIsLoading] = useState(!initialPrizes);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getPrizes();
      setPrizes(list);
      setError(null);
    } catch (err) {
      const message = toErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialPrizes) {
      setPrizes(normalizeInitialPrizes(initialPrizes));
      setIsLoading(false);
      return;
    }
    refresh().catch(() => {
      /* エラーメッセージは refresh 内で設定済み */
    });
  }, [initialPrizes, refresh]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => {};
    }
    const handler = (event: StorageEvent) => {
      if (event.key === storageKeys.prizes) {
        refresh().catch(() => {
          /* refresh 内でエラーハンドリング済み */
        });
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const togglePrize = useCallback(
    async (id: string, nextSelected?: boolean) => {
      setIsMutating(true);
      try {
        const current = prizes.find((prize) => prize.id === id);
        const desired =
          typeof nextSelected === "boolean" ? nextSelected : current ? !current.selected : true;
        const list = await togglePrizeService(id, desired);
        setPrizes(list);
        setError(null);
      } catch (err) {
        const message = toErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [prizes],
  );

  const applyPrizes = useCallback(async (next: PrizeList) => {
    setIsMutating(true);
    setPrizes(normalizeInitialPrizes(next));
    try {
      await savePrizesService(next);
      const list = await getPrizes();
      setPrizes(list);
      setError(null);
    } catch (err) {
      const message = toErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const value = useMemo<PrizeContextValue>(
    () => ({
      prizes,
      isLoading,
      isMutating,
      error,
      refresh,
      togglePrize,
      applyPrizes,
    }),
    [prizes, isLoading, isMutating, error, refresh, togglePrize, applyPrizes],
  );

  return <PrizeContext.Provider value={value}>{children}</PrizeContext.Provider>;
};
