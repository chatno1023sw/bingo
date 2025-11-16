import { useState } from "react";
import { json } from "@react-router/node";
import type { LoaderFunctionArgs } from "@react-router/node";
import { useLoaderData } from "react-router";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { parsePrizesCsv, generatePrizesCsv } from "~/common/utils/csvParser";
import { getPrizes } from "~/common/services/prizeService";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";
import { CsvControls } from "~/components/setting/CsvControls";
import { BulkActions } from "~/components/setting/BulkActions";
import { PrizeSortableList } from "~/components/setting/PrizeSortableList";

export const loader = async (_args: LoaderFunctionArgs) => {
  const prizes = await getPrizes();
  return json({ prizes });
};

export type LoaderData = { prizes: PrizeList };

const SettingContent = () => {
  const { prizes, isLoading, isMutating, error, applyPrizes } = usePrizeManager();
  const [summary, setSummary] = useState<CsvImportResult | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [manualCsv, setManualCsv] = useState("id,order,prizeName,itemName,imagePath,selected,memo\n");

  const summaryFrom = (sourceName: string, result: ReturnType<typeof parsePrizesCsv>): CsvImportResult => ({
    sourceName,
    addedCount: result.prizes.length,
    skipped: result.skipped,
    processedAt: new Date().toISOString(),
  });

  const runImport = async (text: string, sourceName: string) => {
    try {
      const result = parsePrizesCsv(text);
      await applyPrizes(result.prizes);
      setSummary(summaryFrom(sourceName, result));
      setLocalError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "csv-import-error";
      setLocalError(message);
    }
  };

  const handleFileImport = async (file: File) => {
    const text = await file.text();
    await runImport(text, file.name);
  };

  const handleManualImport = async () => {
    await runImport(manualCsv, "manual-input");
  };

  const handleExport = () => {
    const csv = generatePrizesCsv(prizes);
    setExportText(csv);
  };

  const handleDeleteAll = async () => {
    await applyPrizes([]);
    setSummary(null);
  };

  const handleReorder = async (ids: string[]) => {
    const lookup = new Map(prizes.map((prize) => [prize.id, prize]));
    const ordered = ids
      .map((id) => lookup.get(id))
      .filter((prize): prize is typeof prizes[number] => Boolean(prize))
      .map((prize, index) => ({
        ...prize,
        order: index,
      }));
    await applyPrizes(ordered);
  };

  const selectedCount = prizes.filter((prize) => prize.selected).length;
  const combinedError = error ?? localError;

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Setting</p>
        <h1 className="text-3xl font-bold text-white">景品マスタ管理</h1>
        <p className="mt-1 text-sm text-slate-300">CSV 取り込み ・ 並び替え ・ 一括削除をここで行います。</p>
      </header>

      <CsvControls
        disabled={isMutating}
        onFileImport={handleFileImport}
        manualCsv={manualCsv}
        onManualCsvChange={setManualCsv}
        onManualImport={handleManualImport}
        onExport={handleExport}
        summary={summary}
        error={combinedError}
        exportText={exportText}
      />

      <BulkActions total={prizes.length} selected={selectedCount} onDeleteAll={handleDeleteAll} disabled={isMutating} />

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">登録済み景品</h2>
          <span className="text-sm text-slate-400">{prizes.length} 件</span>
        </div>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-400">読み込み中...</p>
        ) : (
          <PrizeSortableList prizes={prizes} onReorder={handleReorder} disabled={isMutating} />
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
