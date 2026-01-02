import type { FC, ChangeEvent } from "react";
import type { CsvImportResult } from "~/common/types";
import { Button } from "~/components/common/Button";

export type CsvControlsProps = {
  disabled?: boolean;
  onFileImport: (file: File) => Promise<void>;
  manualCsv: string;
  onManualCsvChange: (value: string) => void;
  onManualImport: () => Promise<void>;
  onExport: () => void;
  summary: CsvImportResult | null;
  error: string | null;
  exportText: string | null;
};

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
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await onFileImport(file);
    event.target.value = "";
  };

  return (
    <div className="rounded border border-slate-300 bg-slate-50 p-4 text-xs text-slate-700">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-slate-500" htmlFor="csv-import">
            CSV インポート
          </label>
          <input
            id="csv-import"
            type="file"
            accept=".csv,text/csv"
            className="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            className="rounded bg-sky-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:opacity-50"
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
          className="rounded border border-slate-300 bg-white p-3 text-xs"
          rows={5}
          value={manualCsv}
          onChange={(event) => onManualCsvChange(event.target.value)}
        />
        <Button
          type="button"
          className="rounded border border-sky-700 px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
          onClick={onManualImport}
          disabled={disabled}
        >
          貼り付け内容を取り込む
        </Button>
      </div>

      {summary && (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-700">
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
      {error && <p className="mt-3 text-[11px] text-rose-600">{error}</p>}
      {exportText && (
        <textarea
          className="mt-4 w-full rounded border border-slate-300 bg-white p-3 text-xs"
          rows={5}
          readOnly
          value={exportText}
          data-testid="export-preview"
        />
      )}
    </div>
  );
};
