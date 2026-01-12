import { useCallback, useState } from "react";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { generatePrizesCsv, parsePrizesCsv } from "~/common/utils/csvParser";

export type UsePrizeCsvManagerParams = {
  /** 現在の下書き一覧 */
  draftPrizes: PrizeList;
  /** 下書きの更新 */
  setDraftPrizes: React.Dispatch<React.SetStateAction<PrizeList>>;
  /** エラー状態の更新 */
  setLocalError: (message: string | null) => void;
};

export type UsePrizeCsvManagerResult = {
  /** 取り込みサマリー */
  summary: CsvImportResult | null;
  /** エクスポート CSV */
  exportText: string | null;
  /** 手入力 CSV */
  manualCsv: string;
  /** 手入力 CSV 更新 */
  setManualCsv: (value: string) => void;
  /** CSV ファイル取り込み */
  handleFileImport: (file: File) => Promise<void>;
  /** 手入力 CSV 取り込み */
  handleManualImport: () => Promise<void>;
  /** CSV エクスポート */
  handleExport: () => void;
  /** CSV 選択ダイアログを開く */
  handleCsvImportClick: () => void;
  /** サマリーをリセット */
  resetSummary: () => void;
};

/**
 * Setting 画面の CSV 取り込み/書き出しをまとめるフックです。
 *
 * - 副作用: 下書き状態と CSV プレビューを更新します。
 * - 入力制約: CSV は `parsePrizesCsv` で解析できる形式を渡してください。
 * - 戻り値: CSV 操作用の状態とハンドラを返します。
 * - Chrome DevTools MCP では CSV 入出力が機能することを確認します。
 */
export const usePrizeCsvManager = ({
  draftPrizes,
  setDraftPrizes,
  setLocalError,
}: UsePrizeCsvManagerParams): UsePrizeCsvManagerResult => {
  const [summary, setSummary] = useState<CsvImportResult | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [manualCsv, setManualCsv] = useState(
    "id,order,prizeName,itemName,imagePath,selected,memo\n",
  );

  const summaryFrom = useCallback(
    (sourceName: string, result: ReturnType<typeof parsePrizesCsv>): CsvImportResult => ({
      sourceName,
      addedCount: result.prizes.length,
      skipped: result.skipped,
      processedAt: new Date().toISOString(),
    }),
    [],
  );

  const runImport = useCallback(
    async (text: string, sourceName: string) => {
      try {
        const result = parsePrizesCsv(text);
        setDraftPrizes(result.prizes);
        setSummary(summaryFrom(sourceName, result));
        setLocalError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "csv-import-error";
        setLocalError(message);
      }
    },
    [setDraftPrizes, setLocalError, summaryFrom],
  );

  const handleFileImport = useCallback(
    async (file: File) => {
      const text = await file.text();
      await runImport(text, file.name);
    },
    [runImport],
  );

  const handleManualImport = useCallback(async () => {
    await runImport(manualCsv, "manual-input");
  }, [manualCsv, runImport]);

  const handleExport = useCallback(() => {
    const csv = generatePrizesCsv(draftPrizes);
    setExportText(csv);
  }, [draftPrizes]);

  const handleCsvImportClick = useCallback(() => {
    const input = document.getElementById("csv-import-simple");
    if (input instanceof HTMLInputElement) {
      input.click();
    }
  }, []);

  const resetSummary = useCallback(() => {
    setSummary(null);
  }, []);

  return {
    summary,
    exportText,
    manualCsv,
    setManualCsv,
    handleFileImport,
    handleManualImport,
    handleExport,
    handleCsvImportClick,
    resetSummary,
  };
};
