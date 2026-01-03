import type { FC } from "react";
import { usePrizeManager } from "~/common/hooks/usePrizeManager";
import { useSettingDraft } from "~/common/hooks/useSettingDraft";
import { DeleteAllDialog } from "~/components/setting/DeleteAllDialog";
import { PrizeSortableList } from "~/components/setting/PrizeSortableList";
import { ResetSelectionDialog } from "~/components/setting/ResetSelectionDialog";
import { SettingHiddenInputs } from "~/components/setting/SettingHiddenInputs";
import { SettingToolbar } from "~/components/setting/SettingToolbar";
import { UnsavedChangesDialog } from "~/components/setting/UnsavedChangesDialog";

/**
 * Setting 画面のメインコンテンツです。
 *
 * - 副作用: 下書きの更新や beforeunload の登録を行います。
 * - 入力制約: PrizeProvider 配下で利用してください。
 * - 戻り値: 設定画面の JSX を返します。
 * - Chrome DevTools MCP では CSV 取り込みと保存フローを確認します。
 */
export const SettingContent: FC = () => {
  const { prizes, isLoading, isMutating, error, applyPrizes } = usePrizeManager();
  const {
    draftPrizes,
    summary,
    exportText,
    manualCsv,
    deleteOpen,
    resetOpen,
    confirmOpen,
    isSaving,
    isUploading,
    combinedError,
    setManualCsv,
    setDeleteOpen,
    setResetOpen,
    handleAddCard,
    handleCsvImportClick,
    handleImageUploadClick,
    handleFileImport,
    handleManualImport,
    handleExport,
    handleCsvImport,
    handleUploadImages,
    handleDeleteAll,
    handleResetSelections,
    handleReorder,
    handleRemove,
    handleUpdate,
    handleSaveAndBack,
    handleCancelConfirm,
    handleConfirmProceed,
  } = useSettingDraft({
    prizes,
    isLoading,
    error,
    applyPrizes,
  });

  return (
    <section className="space-y-3">
      <SettingToolbar
        isMutating={isMutating}
        isSaving={isSaving}
        hasPrizes={draftPrizes.length > 0}
        onAddCard={handleAddCard}
        onCsvImportClick={handleCsvImportClick}
        onImageUploadClick={handleImageUploadClick}
        onResetSelections={() => setResetOpen(true)}
        onDeleteAll={() => setDeleteOpen(true)}
        onBack={() => void handleSaveAndBack()}
      />

      <SettingHiddenInputs
        isMutating={isMutating}
        isUploading={isUploading}
        manualCsv={manualCsv}
        onManualCsvChange={setManualCsv}
        onManualImport={handleManualImport}
        onExport={handleExport}
        onFileImport={handleFileImport}
        onCsvImport={handleCsvImport}
        onImageImport={handleUploadImages}
        summary={summary}
        error={combinedError}
        exportText={exportText}
      />

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
      <UnsavedChangesDialog
        open={confirmOpen}
        onCancel={handleCancelConfirm}
        onProceed={handleConfirmProceed}
      />
    </section>
  );
};
