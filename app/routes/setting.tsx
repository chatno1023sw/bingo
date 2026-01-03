import Papa from "papaparse";
import { useState } from "react";
import { useNavigate } from "react-router";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { generatePrizesCsv, parsePrizesCsv } from "~/common/utils/csvParser";
import { Button } from "~/components/common/Button";
import { CsvControls } from "~/components/setting/CsvControls";
import { DeleteAllDialog } from "~/components/setting/DeleteAllDialog";
import { PrizeSortableList } from "~/components/setting/PrizeSortableList";
import { ResetSelectionDialog } from "~/components/setting/ResetSelectionDialog";
import { UploadImagesDialog } from "~/components/setting/UploadImagesDialog";

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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<FileList | null>(null);

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

  const handleCsvImportClick = () => {
    const input = document.getElementById("csv-import-simple");
    if (input instanceof HTMLInputElement) {
      input.click();
    }
  };

  const normalizeSelected = (value: string | undefined): boolean => {
    if (!value) {
      return false;
    }
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "selected" ||
      value.trim() === "選出"
    );
  };

  const handleCsvImport = async (file: File) => {
    const text = await file.text();
    type CsvRow = { 賞名?: string; 賞品名?: string; 選出?: string };
    const result = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (result.errors.length > 0) {
      setLocalError("csv-import-error");
      return;
    }
    const parsed = result.data
      .map((row, index) => ({
        id:
          globalThis.crypto?.randomUUID?.() ??
          `prize-${Date.now()}-${Math.random().toString(16).slice(2)}-${index}`,
        order: prizes.length + index,
        prizeName: row.賞名?.trim() ?? "",
        itemName: row.賞品名?.trim() ?? "",
        imagePath: null,
        selected: normalizeSelected(row.選出),
        memo: null,
      }))
      .filter((row) => row.prizeName || row.itemName);
    if (parsed.length === 0) {
      setLocalError("csv-import-empty");
      return;
    }
    await applyPrizes([...prizes, ...parsed]);
    setLocalError(null);
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

  const handleUploadImages = async () => {
    const files = pendingUploads;
    if (!files || files.length === 0) {
      setUploadOpen(false);
      setPendingUploads(null);
      return;
    }
    setIsUploading(true);
    try {
      const mappings = await Promise.all(
        Array.from(files).map((file) => {
          return new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result !== "string") {
                reject(new Error("invalid-image"));
                return;
              }
              resolve({ name: file.name, dataUrl: reader.result });
            };
            reader.onerror = () => reject(new Error("read-error"));
            reader.readAsDataURL(file);
          });
        }),
      );
      const normalizeName = (value: string) =>
        value
          .trim()
          .toLowerCase()
          .replace(/\.[^/.]+$/, "");
      const grouped = mappings.reduce<Record<string, { name: string; dataUrl: string }[]>>(
        (acc, entry) => {
          const key = normalizeName(entry.name);
          acc[key] = acc[key] ? [...acc[key], entry] : [entry];
          return acc;
        },
        {},
      );
      const next = prizes.map((prize) => {
        const itemKey = normalizeName(prize.itemName);
        const matched = Object.entries(grouped).find(([key]) => key.includes(itemKey));
        if (!matched) {
          return prize;
        }
        const images = matched[1];
        if (images.length === 0) {
          return prize;
        }
        return {
          ...prize,
          imagePath: images[0].dataUrl,
        };
      });
      await applyPrizes(next);
      setUploadOpen(false);
      setPendingUploads(null);
    } finally {
      setIsUploading(false);
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
          <Button
            type="button"
            className="rounded bg-primary px-3 py-1.5 text-primary-foreground text-xs shadow-none hover:bg-primary/90 disabled:opacity-50"
            onClick={handleAddCard}
            disabled={isMutating}
          >
            カード追加
          </Button>
          <Button
            type="button"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={handleCsvImportClick}
            disabled={isMutating}
          >
            CSV追加
          </Button>
          <Button
            type="button"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={() => setUploadOpen(true)}
            disabled={isMutating || prizes.length === 0}
          >
            画像追加
          </Button>
          <Button
            type="button"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={() => setResetOpen(true)}
            disabled={isMutating || prizes.length === 0}
          >
            全未選出
          </Button>
          <Button
            type="button"
            className="rounded border border-destructive px-3 py-1.5 text-destructive text-xs shadow-none hover:bg-destructive/10 disabled:opacity-50"
            onClick={() => setDeleteOpen(true)}
            disabled={isMutating || prizes.length === 0}
          >
            カード全削除
          </Button>
        </div>
        <Button
          type="button"
          className="rounded bg-secondary px-3 py-1.5 text-secondary-foreground text-xs shadow-none hover:bg-secondary/80"
          onClick={() => navigate("/start")}
        >
          戻る
        </Button>
      </header>

      <div className="sr-only">
        <input
          id="csv-import-simple"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleCsvImport(file);
            }
            event.currentTarget.value = "";
          }}
        />
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
        <p className="px-4 py-6 text-muted-foreground text-sm">読み込み中...</p>
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
      <UploadImagesDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onConfirm={handleUploadImages}
        onFilesSelected={setPendingUploads}
        disabled={isUploading}
      />
    </section>
  );
};

export default function SettingRoute() {
  return (
    <main className="min-h-screen bg-background p-2 text-foreground">
      <div className="w-full bg-background p-3">
        <PrizeProvider>
          <SettingContent />
        </PrizeProvider>
      </div>
    </main>
  );
}
