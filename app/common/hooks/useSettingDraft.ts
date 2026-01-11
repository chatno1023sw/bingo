import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { arePrizesEqual } from "~/common/hooks/setting/prizeDraftUtils";
import { usePrizeImageUploader } from "~/common/hooks/setting/usePrizeImageUploader";
import { useSettingCsvImport } from "~/common/hooks/setting/useSettingCsvImport";
import { usePrizeDraftOperations } from "~/common/hooks/setting/usePrizeDraftOperations";
import { useUnsavedChangesGuard } from "~/common/hooks/setting/useUnsavedChangesGuard";
import { usePrizeCsvManager } from "~/components/setting/hooks/usePrizeCsvManager";

export type UseSettingDraftOptions = {
  /** 既存の景品一覧 */
  prizes: PrizeList;
  /** 読み込み中フラグ */
  isLoading: boolean;
  /** 画面側のエラー */
  error: string | null;
  /** 保存処理 */
  applyPrizes: (next: PrizeList) => Promise<void>;
};

export type UseSettingDraftResult = {
  /** 下書きの景品一覧 */
  draftPrizes: PrizeList;
  /** CSV 取り込み結果 */
  summary: CsvImportResult | null;
  /** CSV エクスポート文字列 */
  exportText: string | null;
  /** 画面内エラー */
  localError: string | null;
  /** 手入力 CSV */
  manualCsv: string;
  /** 削除確認の表示状態 */
  deleteOpen: boolean;
  /** 選出リセット確認の表示状態 */
  resetOpen: boolean;
  /** 未保存確認の表示状態 */
  confirmOpen: boolean;
  /** 保存処理中フラグ */
  isSaving: boolean;
  /** 画像アップロード中フラグ */
  isUploading: boolean;
  /** 変更済みフラグ */
  isDirty: boolean;
  /** 結合済みエラー */
  combinedError: string | null;
  /** CSV 手入力の更新 */
  setManualCsv: (value: string) => void;
  /** 削除確認の開閉 */
  setDeleteOpen: (open: boolean) => void;
  /** 選出リセット確認の開閉 */
  setResetOpen: (open: boolean) => void;
  /** 追加カード操作 */
  handleAddCard: () => void;
  /** CSV 追加クリック */
  handleCsvImportClick: () => void;
  /** 画像追加クリック */
  handleImageUploadClick: () => void;
  /** CSV ファイル取り込み */
  handleFileImport: (file: File) => Promise<void>;
  /** CSV 手入力取り込み */
  handleManualImport: () => Promise<void>;
  /** CSV エクスポート */
  handleExport: () => void;
  /** CSV 追加入力 */
  handleCsvImport: (file: File) => Promise<void>;
  /** 画像取り込み */
  handleUploadImages: (files: FileList) => Promise<void>;
  /** 全削除 */
  handleDeleteAll: () => void;
  /** 選出リセット */
  handleResetSelections: () => void;
  /** 並び替え */
  handleReorder: (ids: string[]) => void;
  /** 削除 */
  handleRemove: (id: string) => void;
  /** 更新 */
  handleUpdate: (id: string, patch: Partial<PrizeList[number]>) => void;
  /** 保存して戻る */
  handleSaveAndBack: () => Promise<void>;
  /** 破棄キャンセル */
  handleCancelConfirm: () => void;
  /** 破棄して移動 */
  handleConfirmProceed: () => void;
};

/**
 * Setting 画面の下書き状態をまとめて扱うフックです。
 *
 * - 副作用: localStorage からの読み込み結果で初期化し、beforeunload を登録します。
 * - 入力制約: `prizes` は order 済みの配列を想定します。
 * - 戻り値: 画面表示と操作に必要な状態とハンドラを返します。
 * - Chrome DevTools MCP では CSV 取り込みと未保存警告が動くことを確認します。
 */
export const useSettingDraft = ({
  prizes,
  isLoading,
  error,
  applyPrizes,
}: UseSettingDraftOptions): UseSettingDraftResult => {
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [draftPrizes, setDraftPrizes] = useState<PrizeList>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const hasInitializedRef = useRef(false);
  const {
    summary,
    exportText,
    manualCsv,
    setManualCsv,
    handleFileImport,
    handleManualImport,
    handleExport,
    handleCsvImportClick,
    resetSummary,
  } = usePrizeCsvManager({
    draftPrizes,
    setDraftPrizes,
    setLocalError,
  });
  const { handleCsvImport } = useSettingCsvImport({ setDraftPrizes, setLocalError });
  const { isUploading, handleImageUploadClick, handleUploadImages } = usePrizeImageUploader({
    draftPrizes,
    setDraftPrizes,
    setLocalError,
  });
  const {
    handleAddCard,
    handleDeleteAll,
    handleResetSelections,
    handleReorder,
    handleRemove,
    handleUpdate,
  } = usePrizeDraftOperations({
    setDraftPrizes,
    resetSummary,
    setDeleteOpen,
    setResetOpen,
  });

  const isDirty = useMemo(() => !arePrizesEqual(draftPrizes, prizes), [draftPrizes, prizes]);
  const { handleCancelConfirm, handleConfirmProceed } = useUnsavedChangesGuard({
    isDirty,
    allowNavigation,
    setAllowNavigation,
    setConfirmOpen,
  });

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

  /**
   * 保存して Start 画面へ戻ります。
   *
   * - 副作用: 保存処理と画面遷移を行います。
   * - 入力制約: なし。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では保存後の遷移を確認します。
   */
  const handleSaveAndBack = async () => {
    setIsSaving(true);
    try {
      setAllowNavigation(true);
      if (!isDirty) {
        navigate("/");
        return;
      }
      await applyPrizes(draftPrizes);
      navigate("/");
    } finally {
      setIsSaving(false);
      setAllowNavigation(false);
    }
  };

  const combinedError = error ?? localError;

  return {
    draftPrizes,
    summary,
    exportText,
    localError,
    manualCsv,
    deleteOpen,
    resetOpen,
    confirmOpen,
    isSaving,
    isUploading,
    isDirty,
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
  };
};
