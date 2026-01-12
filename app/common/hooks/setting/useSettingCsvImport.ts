import Papa from "papaparse";
import { useCallback } from "react";
import type { PrizeList } from "~/common/types";
import { buildParsedPrize, normalizeSelected } from "~/common/hooks/setting/prizeDraftUtils";

export type UseSettingCsvImportParams = {
  setDraftPrizes: React.Dispatch<React.SetStateAction<PrizeList>>;
  setLocalError: (message: string | null) => void;
};

/**
 * Setting 画面向けの CSV 取り込みハンドラを提供します。
 *
 * - 副作用: `setDraftPrizes` と `setLocalError` を更新します。
 * - 入力制約: CSV はヘッダー行を含む UTF-8 文字列を想定します。
 * - 戻り値: ハンドラ関数を返します。
 * - Chrome DevTools MCP では CSV 取り込み時にエラーが表示されることを確認します。
 */
export const useSettingCsvImport = ({
  setDraftPrizes,
  setLocalError,
}: UseSettingCsvImportParams) => {
  const handleCsvImport = useCallback(
    async (file: File) => {
      const text = await file.text();
      type CsvRow = {
        賞名?: string;
        景品名?: string;
        選出?: string;
      };
      const result = Papa.parse<CsvRow>(text, {
        header: true,
        skipEmptyLines: true,
      });
      if (result.errors.length > 0) {
        setLocalError("csv-import-error");
        return;
      }
      const parsedRows = result.data
        .map((row) => ({
          prizeName: row.賞名?.trim() ?? "",
          itemName: row.景品名?.trim() ?? "",
          selected: normalizeSelected(row.選出),
        }))
        .filter((row) => row.prizeName.length > 0 || row.itemName.length > 0);
      if (parsedRows.length === 0) {
        setLocalError("csv-import-empty");
        return;
      }
      setDraftPrizes((prev) => {
        const offset = prev.length;
        const appended = parsedRows.map((row, index) => buildParsedPrize(row, offset + index));
        return [...prev, ...appended];
      });
      setLocalError(null);
    },
    [setDraftPrizes, setLocalError],
  );

  return { handleCsvImport };
};
