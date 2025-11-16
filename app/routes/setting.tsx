import { useState, ChangeEvent } from "react";
import { json } from "@react-router/node";
import type { LoaderFunctionArgs } from "@react-router/node";
import { useLoaderData } from "react-router";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { parsePrizesCsv, generatePrizesCsv } from "~/common/utils/csvParser";
import { getPrizes } from "~/common/services/prizeService";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";

export const loader = async (_args: LoaderFunctionArgs) => {
  const prizes = await getPrizes();
  return json({ prizes });
};

export type LoaderData = { prizes: PrizeList };

const ImportSummary = ({ summary }: { summary: CsvImportResult }) => {
  return (
    <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-900/10 p-4 text-sm text-emerald-100">
      <p>
        {summary.sourceName} を取り込みました（追加 {summary.addedCount} 件 / スキップ {summary.skipped.length} 件）
      </p>
      {summary.skipped.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {summary.skipped.map((item) => (
            <li key={`${item.id}-${item.reason}`}>{item.id || "(no id)"}: {item.reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SettingContent = () => {
  const { prizes, isLoading, isMutating, error, applyPrizes } = usePrizeManager();
  const [summary, setSummary] = useState<CsvImportResult | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [manualCsv, setManualCsv] = useState("id,order,prizeName,itemName,imagePath,selected,memo\n");

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const result = parsePrizesCsv(text);
      await applyPrizes(result.prizes);
      setSummary({
        sourceName: file.name,
        addedCount: result.prizes.length,
        skipped: result.skipped,
        processedAt: new Date().toISOString(),
      });
      setLocalError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "csv-import-error";
      setLocalError(message);
    } finally {
      event.target.value = "";
    }
  };

  const handleExport = () => {
    const csv = generatePrizesCsv(prizes);
    setExportText(csv);
  };

  const handleDeleteAll = async () => {
    await applyPrizes([]);
    setSummary(null);
  };

  const handleManualImport = async () => {
    try {
      const result = parsePrizesCsv(manualCsv);
      await applyPrizes(result.prizes);
      setSummary({
        sourceName: "manual-input",
        addedCount: result.prizes.length,
        skipped: result.skipped,
        processedAt: new Date().toISOString(),
      });
      setLocalError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "csv-import-error";
      setLocalError(message);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Setting</p>
        <h1 className="text-3xl font-bold text-white">景品マスタ管理</h1>
        <p className="mt-1 text-sm text-slate-300">CSV 取り込み ・ 並び替え ・ 一括削除をここで行います。</p>
      </header>

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
              onChange={handleImport}
              disabled={isMutating}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-semibold text-white"
              onClick={handleExport}
              disabled={isLoading}
            >
              CSV エクスポート
            </button>
            <button
              type="button"
              className="rounded-2xl border border-rose-500/60 px-4 py-2 font-semibold text-rose-200"
              onClick={handleDeleteAll}
              disabled={isMutating || prizes.length === 0}
            >
              すべて削除
            </button>
          </div>
        </div>
        {summary && <ImportSummary summary={summary} />}
        {(error || localError) && (
          <p className="mt-4 text-xs text-rose-300">{error ?? localError}</p>
        )}
        <div className="mt-4 grid gap-3 lg:grid-cols-[2fr,1fr]">
          <textarea
            className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3 text-xs"
            rows={6}
            value={manualCsv}
            onChange={(event) => setManualCsv(event.target.value)}
            aria-label="CSV 貼り付け"
          />
          <button
            type="button"
            className="rounded-2xl border border-indigo-500/40 px-4 py-2 text-sm font-semibold text-indigo-100"
            onClick={handleManualImport}
            disabled={isMutating}
          >
            貼り付け内容を取り込む
          </button>
        </div>
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

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">登録済み景品</h2>
          <span className="text-sm text-slate-400">{prizes.length} 件</span>
        </div>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-400">読み込み中...</p>
        ) : prizes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">景品が登録されていません。</p>
        ) : (
          <ul className="mt-4 space-y-3" data-testid="setting-prize-list">
            {prizes.map((prize) => (
              <li
                key={prize.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/50 px-4 py-3"
              >
                <div>
                  <p className="text-base font-semibold text-white">{prize.prizeName}</p>
                  <p className="text-xs text-slate-400">{prize.itemName}</p>
                </div>
                <span className="text-xs text-slate-400">#{prize.order}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default function SettingRoute() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <PrizeProvider initialPrizes={loaderData.prizes}>
          <SettingContent />
        </PrizeProvider>
      </div>
    </main>
  );
}
