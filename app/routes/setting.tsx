import { useState } from "react";
import { useNavigate } from "react-router";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { parsePrizesCsv, generatePrizesCsv } from "~/common/utils/csvParser";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";
import { CsvControls } from "~/components/setting/CsvControls";
import { DeleteAllDialog } from "~/components/setting/DeleteAllDialog";
import { ResetSelectionDialog } from "~/components/setting/ResetSelectionDialog";
import { PrizeSortableList } from "~/components/setting/PrizeSortableList";

const SettingContent = () => {
  const navigate = useNavigate();
  const { prizes, isLoading, isMutating, error, applyPrizes } = usePrizeManager();
  const [summary, setSummary] = useState<CsvImportResult | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [manualCsv, setManualCsv] = useState(
    "id,order,prizeName,itemName,imagePath,selected,memo\n",
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const summaryFrom = (
    sourceName: string,
    result: ReturnType<typeof parsePrizesCsv>,
  ): CsvImportResult => ({
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
    setIsDeleting(true);
    try {
      await applyPrizes([]);
      setSummary(null);
      setDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetSelections = async () => {
    setIsResetting(true);
    try {
      const next = prizes.map((prize, index) => ({
        ...prize,
        selected: false,
        order: index,
      }));
      await applyPrizes(next);
      setResetOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  const buildEmptyPrize = (order: number) => {
    const nextId =
      globalThis.crypto?.randomUUID?.() ??
      `prize-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return {
      id: nextId,
      order,
      prizeName: "",
      itemName: "",
      imagePath: null,
      selected: false,
      memo: null,
    };
  };

  const handleAddCard = async () => {
    const next = [...prizes, buildEmptyPrize(prizes.length)];
    await applyPrizes(next);
  };

  const handleRemove = async (id: string) => {
    const next = prizes
      .filter((prize) => prize.id !== id)
      .map((prize, index) => ({
        ...prize,
        order: index,
      }));
    await applyPrizes(next);
  };

  const handleUpdate = async (id: string, patch: Partial<PrizeList[number]>) => {
    const next = prizes.map((prize) => (prize.id === id ? { ...prize, ...patch } : prize));
    await applyPrizes(next);
  };

  const handleReorder = async (ids: string[]) => {
    const lookup = new Map(prizes.map((prize) => [prize.id, prize]));
    const ordered = ids
      .map((id) => lookup.get(id))
      .filter((prize): prize is (typeof prizes)[number] => Boolean(prize))
      .map((prize, index) => ({
        ...prize,
        order: index,
      }));
    await applyPrizes(ordered);
  };

  const combinedError = error ?? localError;

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-none transition hover:bg-teal-800 disabled:opacity-50"
            onClick={handleAddCard}
            disabled={isMutating}
          >
            カード追加
          </button>
          <button
            type="button"
            className="rounded border border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-none transition hover:bg-slate-50 disabled:opacity-50"
            onClick={() => setResetOpen(true)}
            disabled={isMutating || prizes.length === 0}
          >
            全未選出
          </button>
          <button
            type="button"
            className="rounded border border-rose-500 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-none transition hover:bg-rose-50 disabled:opacity-50"
            onClick={() => setDeleteOpen(true)}
            disabled={isMutating || prizes.length === 0}
          >
            カード全削除
          </button>
        </div>
        <button
          type="button"
          className="rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-none transition hover:bg-teal-800"
          onClick={() => navigate("/start")}
        >
          戻る
        </button>
      </header>

      <div className="sr-only">
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
      </div>

      {isLoading ? (
        <p className="px-4 py-6 text-sm text-slate-500">読み込み中...</p>
      ) : (
        <PrizeSortableList
          prizes={prizes}
          onReorder={handleReorder}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
          disabled={isMutating}
        />
      )}
      <DeleteAllDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAll}
        disabled={isDeleting}
      />
      <ResetSelectionDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleResetSelections}
        disabled={isResetting}
      />
    </section>
  );
};

export default function SettingRoute() {
  return (
    <main className="min-h-screen bg-white p-2 text-slate-900">
      <div className="w-full bg-white p-3">
        <PrizeProvider>
          <SettingContent />
        </PrizeProvider>
      </div>
    </main>
  );
}
