import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router";
import type { CsvImportResult, PrizeList } from "~/common/types";
import { buildPrizeImagePath, savePrizeImage } from "~/common/utils/imageStorage";
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
  const [isUploading, setIsUploading] = useState(false);
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

  /**
   * 画像追加のファイル入力を開きます。
   *
   * - 副作用: hidden input をクリックします。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP ではファイル選択が開くことを確認します。
   */
  const handleImageUploadClick = () => {
    const input = document.getElementById("image-import-simple");
    if (input instanceof HTMLInputElement) {
      input.click();
    }
  };

  /**
   * CSV の選出値を真偽値へ変換します。
   *
   * - 副作用: ありません。
   * - 入力制約: `value` は文字列を渡してください。
   * - 戻り値: 選出フラグを返します。
   * - Chrome DevTools MCP では選出値の変換を確認します。
   */
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

  /**
   * 追加 CSV を解析して下書きに追加します。
   *
   * - 副作用: 下書きとエラー状態を更新します。
   * - 入力制約: `file` は CSV ファイルを渡してください。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では追加結果を確認します。
   */
  const handleCsvImport = async (file: File) => {
    const text = await file.text();
    /**
     * CSV 取り込み時の行データ。
     */
    type CsvRow = {
      /** 賞名 */
      賞名?: string;
      /** 景品名 */
      景品名?: string;
      /** 選出フラグ */
      選出?: string;
    };
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
        itemName: row.景品名?.trim() ?? "",
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

  /**
   * すべての景品を削除します。
   *
   * - 副作用: 下書きとサマリーを更新します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では一覧が空になることを確認します。
   */
  const handleDeleteAll = () => {
    setDraftPrizes([]);
    resetSummary();
    setDeleteOpen(false);
  };

  /**
   * 選出状態をすべて解除します。
   *
   * - 副作用: 下書きとダイアログ状態を更新します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では選出状態が解除されることを確認します。
   */
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

  /**
   * 画像を一括で取り込みます。
   *
   * - 副作用: IndexedDB と下書きを更新します。
   * - 入力制約: `files` は画像ファイルの FileList を渡してください。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では画像反映を確認します。
   */
  const handleUploadImages = async (files: FileList) => {
    if (files.length === 0) {
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
      setLocalError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "image-upload-error";
      setLocalError(message);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 空の景品カードを生成します。
   *
   * - 副作用: ありません。
   * - 入力制約: `order` は 0 起点の順序を渡してください。
   * - 戻り値: 空の Prize を返します。
   * - Chrome DevTools MCP では追加カードが表示されることを確認します。
   */
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

  /**
   * 空のカードを追加します。
   *
   * - 副作用: 下書きを更新します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP ではカード追加を確認します。
   */
  const handleAddCard = () => {
    setDraftPrizes((prev) => [...prev, buildEmptyPrize(prev.length)]);
  };

  /**
   * 指定 ID のカードを削除します。
   *
   * - 副作用: 下書きを更新します。
   * - 入力制約: `id` は既存 ID を渡してください。
   * - 戻り値: なし。
   * - Chrome DevTools MCP ではカード削除を確認します。
   */
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

  /**
   * 指定 ID のカードを更新します。
   *
   * - 副作用: 下書きを更新します。
   * - 入力制約: `patch` は Prize の部分更新を渡してください。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では更新内容を確認します。
   */
  const handleUpdate = (id: string, patch: Partial<PrizeList[number]>) => {
    setDraftPrizes((prev) =>
      prev.map((prize) => (prize.id === id ? { ...prize, ...patch } : prize)),
    );
  };

  /**
   * カードの並び順を更新します。
   *
   * - 副作用: 下書きを更新します。
   * - 入力制約: `ids` は並び順の配列を渡してください。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では並び替え結果を確認します。
   */
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

  /**
   * 景品一覧の一致判定を行います。
   *
   * - 副作用: ありません。
   * - 入力制約: `left` と `right` は PrizeList を渡してください。
   * - 戻り値: 完全一致なら true を返します。
   * - Chrome DevTools MCP では変更判定を確認します。
   */
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

  /**
   * 未保存警告のキャンセル操作です。
   *
   * - 副作用: ダイアログ状態と blocker を更新します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP ではダイアログが閉じることを確認します。
   */
  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setAllowNavigation(false);
    blocker.reset?.();
  };

  /**
   * 未保存のまま遷移します。
   *
   * - 副作用: ダイアログ状態と blocker を更新します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では遷移が実行されることを確認します。
   */
  const handleConfirmProceed = () => {
    setConfirmOpen(false);
    setAllowNavigation(true);
    blocker.proceed?.();
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
