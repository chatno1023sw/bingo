import type { FC, ChangeEvent } from "react";
import type { CsvImportResult } from "~/common/types";

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
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-400" htmlFor="csv-import">
            CSV インポート
          </label>
          <input
            id="csv-import"
            type="file"
            accept=".csv,text/csv"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-semibold text-white"
            onClick={onExport}
            disabled={disabled}
          >
            CSV エクスポート
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[2fr,1fr]">
        <textarea
          aria-label="CSV 貼り付け"
          className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3 text-xs"
          rows={6}
          value={manualCsv}
          onChange={(event) => onManualCsvChange(event.target.value)}
        />
        <button
          type="button"
          className="rounded-2xl border border-indigo-400/40 px-4 py-2 text-sm font-semibold text-indigo-100"
          onClick={onManualImport}
          disabled={disabled}
        >
          貼り付け内容を取り込む
        </button>
      </div>

      {summary && (
        <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-900/10 p-4 text-xs text-emerald-200">
          <p>
            {summary.sourceName} を取り込みました（追加 {summary.addedCount} 件、スキップ {summary.skipped.length} 件）
          </p>
          {summary.skipped.length > 0 && (
            <ul className="mt-2 list-disc pl-4">
              {summary.skipped.map((item) => (
                <li key={`${item.id}-${item.reason}`}>{item.id || "(no id)"}: {item.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
      {exportText && (
        <textarea
          className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-xs"
          rows={6}
          readOnly
          value={exportText}
          data-testid="export-preview"
        />
      )}
    </div>
  );
};
