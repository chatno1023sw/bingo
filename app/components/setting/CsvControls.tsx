import type { ChangeEvent, FC } from "react";
import type { CsvImportResult } from "~/common/types";
import { Button } from "~/components/common/Button";

export type CsvControlsProps = {
  /** 操作無効フラグ */
  disabled?: boolean;
  /** ファイル取り込み処理 */
  onFileImport: (file: File) => Promise<void>;
  /** 手入力 CSV */
  manualCsv: string;
  /** 手入力 CSV の更新 */
  onManualCsvChange: (value: string) => void;
  /** 手入力 CSV の取り込み */
  onManualImport: () => Promise<void>;
  /** CSV エクスポートの実行 */
  onExport: () => void;
  /** 取り込み結果のサマリー */
  summary: CsvImportResult | null;
  /** エラーメッセージ */
  error: string | null;
  /** エクスポートプレビュー文字列 */
  exportText: string | null;
};

/**
 * CSV 操作欄のコンポーネントです。
 *
 * - 副作用: ファイル選択時に `onFileImport` を呼び出します。
 * - 入力制約: `onFileImport` は Promise を返す関数を渡してください。
 * - 戻り値: CSV 操作 UI を返します。
 * - Chrome DevTools MCP では CSV 取り込み操作を確認します。
 */
export const CsvControls: FC<CsvControlsProps> = ({
  disabled = false,
  onFileImport,
  manualCsv,
  onManualCsvChange,
  onManualImport,
  onExport,
  summary,
  error,
  exportText,
}) => {
  /**
   * CSV ファイル選択時の処理です。
   *
   * - 副作用: `onFileImport` を呼び出します。
   * - 入力制約: ファイルが選択されている必要があります。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では選択後の反映を確認します。
   */
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await onFileImport(file);
    event.target.value = "";
  };

  return (
    <div className="rounded border border-border bg-muted p-4 text-muted-foreground text-xs">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="block text-[11px] text-muted-foreground" htmlFor="csv-import">
            CSV インポート
          </label>
          <input
            id="csv-import"
            type="file"
            accept=".csv,text/csv"
            className="mt-2 w-full rounded border border-input bg-background px-3 py-2 text-foreground text-xs"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            className="rounded bg-primary px-3 py-2 text-primary-foreground text-xs shadow-sm hover:bg-primary disabled:opacity-50"
            onClick={onExport}
            disabled={disabled}
          >
            CSV エクスポート
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[2fr,1fr]">
        <textarea
          aria-label="CSV 貼り付け"
          className="rounded border border-input bg-background p-3 text-foreground text-xs"
          rows={5}
          value={manualCsv}
          onChange={(event) => onManualCsvChange(event.target.value)}
        />
        <Button
          type="button"
          className="rounded border border-primary px-3 py-2 text-primary text-xs shadow-sm hover:bg-primary/10 disabled:opacity-50"
          onClick={onManualImport}
          disabled={disabled}
        >
          貼り付け内容を取り込む
        </Button>
      </div>

      {summary && (
        <div className="mt-4 rounded border border-border bg-accent p-3 text-[11px] text-accent-foreground">
          <p>
            {summary.sourceName} を取り込みました（追加 {summary.addedCount} 件、スキップ{" "}
            {summary.skipped.length} 件）
          </p>
          {summary.skipped.length > 0 && (
            <ul className="mt-2 list-disc pl-4">
              {summary.skipped.map((item) => (
                <li key={`${item.id}-${item.reason}`}>
                  {item.id || "(no id)"}: {item.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-[11px] text-destructive">{error}</p>}
      {exportText && (
        <textarea
          className="mt-4 w-full rounded border border-input bg-background p-3 text-foreground text-xs"
          rows={5}
          readOnly
          value={exportText}
          data-testid="export-preview"
        />
      )}
    </div>
  );
};
