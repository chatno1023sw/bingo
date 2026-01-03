import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { generatePrizesCsv, parsePrizesCsv } from "~/common/utils/csvParser";
import { buildPrizeImagePath, savePrizeImage } from "~/common/utils/imageStorage";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";
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
  const [resetOpen, setResetOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<FileList | null>(null);
  const [draftPrizes, setDraftPrizes] = useState<PrizeList>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const hasInitializedRef = useRef(false);

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
      setDraftPrizes(result.prizes);
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
    const csv = generatePrizesCsv(draftPrizes);
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
        order: draftPrizes.length + index,
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
    setDraftPrizes((prev) => [...prev, ...parsed]);
    setLocalError(null);
  };

  const handleDeleteAll = () => {
    setDraftPrizes([]);
    setSummary(null);
    setDeleteOpen(false);
  };

  const handleResetSelections = () => {
    setDraftPrizes((prev) =>
      prev.map((prize, index) => ({
        ...prize,
        selected: false,
        order: index,
      })),
    );
    setResetOpen(false);
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
      const mappings = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => ({ name: file.name, file }));
      const normalizeName = (value: string) =>
        value
          .trim()
          .toLowerCase()
          .replace(/\.[^/.]+$/, "");
      const grouped = mappings.reduce<Record<string, { name: string; file: File }[]>>(
        (acc, entry) => {
          const key = normalizeName(entry.name);
          if (!key) {
            return acc;
          }
          acc[key] = acc[key] ? [...acc[key], entry] : [entry];
          return acc;
        },
        {},
      );
      const keys = Object.keys(grouped);
      const remaining = mappings.slice();
      const next: PrizeList = [];
      for (const prize of draftPrizes) {
        const candidates = [prize.itemName, prize.prizeName]
          .map((value) => normalizeName(value))
          .filter((value) => value.length > 0);
        const matchedKey =
          candidates.find((candidate) => grouped[candidate]?.length) ??
          keys.find((key) => candidates.some((candidate) => key.includes(candidate)));
        if (!matchedKey && candidates.length === 0) {
          const fallback = remaining.shift();
          if (!fallback) {
            next.push(prize);
            continue;
          }
          await savePrizeImage(prize.id, fallback.file);
          next.push({
            ...prize,
            imagePath: buildPrizeImagePath(prize.id),
          });
          continue;
        }
        if (!matchedKey) {
          next.push(prize);
          continue;
        }
        const images = grouped[matchedKey];
        if (!images || images.length === 0) {
          next.push(prize);
          continue;
        }
        const nextImage = images.shift();
        if (!nextImage) {
          next.push(prize);
          continue;
        }
        const usedIndex = remaining.findIndex((entry) => entry.name === nextImage.name);
        if (usedIndex >= 0) {
          remaining.splice(usedIndex, 1);
        }
        await savePrizeImage(prize.id, nextImage.file);
        next.push({
          ...prize,
          imagePath: buildPrizeImagePath(prize.id),
        });
      }
      setDraftPrizes(next);
      setUploadOpen(false);
      setPendingUploads(null);
      setLocalError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "image-upload-error";
      setLocalError(message);
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

  const handleAddCard = () => {
    setDraftPrizes((prev) => [...prev, buildEmptyPrize(prev.length)]);
  };

  const handleRemove = (id: string) => {
    setDraftPrizes((prev) =>
      prev
        .filter((prize) => prize.id !== id)
        .map((prize, index) => ({
          ...prize,
          order: index,
        })),
    );
  };

  const handleUpdate = (id: string, patch: Partial<PrizeList[number]>) => {
    setDraftPrizes((prev) =>
      prev.map((prize) => (prize.id === id ? { ...prize, ...patch } : prize)),
    );
  };

  const handleReorder = (ids: string[]) => {
    const lookup = new Map(draftPrizes.map((prize) => [prize.id, prize]));
    const ordered = ids
      .map((id) => lookup.get(id))
      .filter((prize): prize is (typeof prizes)[number] => Boolean(prize))
      .map((prize, index) => ({
        ...prize,
        order: index,
      }));
    setDraftPrizes(ordered);
  };

  const isPrizesEqual = (left: PrizeList, right: PrizeList) => {
    if (left.length !== right.length) {
      return false;
    }
    return left.every((prize, index) => {
      const target = right[index];
      return (
        prize.id === target.id &&
        prize.order === target.order &&
        prize.prizeName === target.prizeName &&
        prize.itemName === target.itemName &&
        prize.imagePath === target.imagePath &&
        prize.selected === target.selected &&
        prize.memo === target.memo
      );
    });
  };

  const isDirty = !isPrizesEqual(draftPrizes, prizes);

  useEffect(() => {
    if (!hasInitializedRef.current && !isLoading) {
      setDraftPrizes(prizes);
      hasInitializedRef.current = true;
      return;
    }
    if (!isDirty) {
      setDraftPrizes(prizes);
    }
  }, [isDirty, isLoading, prizes]);

  const blocker = useBlocker(isDirty && !allowNavigation);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setConfirmOpen(true);
    }
  }, [blocker.state]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isDirty]);

  const handleSaveAndBack = async () => {
    setIsSaving(true);
    try {
      setAllowNavigation(true);
      if (!isDirty) {
        navigate("/start");
        return;
      }
      await applyPrizes(draftPrizes);
      navigate("/start");
    } finally {
      setIsSaving(false);
      setAllowNavigation(false);
    }
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
            追加
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={handleCsvImportClick}
            disabled={isMutating}
          >
            CSV追加
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={() => setUploadOpen(true)}
            disabled={isMutating || draftPrizes.length === 0}
          >
            画像追加
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={() => setResetOpen(true)}
            disabled={isMutating || draftPrizes.length === 0}
          >
            全未選出
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded border border-destructive px-3 py-1.5 text-destructive text-xs shadow-none hover:bg-destructive/10 disabled:opacity-50"
            onClick={() => setDeleteOpen(true)}
            disabled={isMutating || draftPrizes.length === 0}
          >
            カード全削除
          </Button>
        </div>
        <Button
          type="button"
          className="rounded bg-secondary px-3 py-1.5 text-secondary-foreground text-xs shadow-none hover:bg-secondary/80"
          onClick={() => void handleSaveAndBack()}
          disabled={isSaving || isMutating}
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
          prizes={draftPrizes}
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
        disabled={isMutating}
      />
      <ResetSelectionDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleResetSelections}
        disabled={isMutating}
      />
      <UploadImagesDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onConfirm={handleUploadImages}
        onFilesSelected={setPendingUploads}
        disabled={isUploading || isMutating}
      />
      <CommonDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setAllowNavigation(false);
          blocker.reset?.();
        }}
        title="いま編集中のデータは保存されません"
        description="よろしいですか？戻るボタン押下で保存されます。"
        footer={
          <>
            <Button
              type="button"
              className="flex-1 rounded-2xl border border-border px-4 py-3 text-muted-foreground hover:bg-muted"
              onClick={() => {
                setConfirmOpen(false);
                setAllowNavigation(false);
                blocker.reset?.();
              }}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-2xl border border-transparent bg-destructive px-4 py-3 text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setConfirmOpen(false);
                setAllowNavigation(true);
                blocker.proceed?.();
              }}
            >
              破棄して移動
            </Button>
          </>
        }
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
