import type { FC } from "react";
import type { CsvImportResult } from "~/common/types";
import { CsvControls } from "~/components/setting/CsvControls";

export type SettingHiddenInputsProps = {
  /** 操作無効フラグ */
  isMutating: boolean;
  /** 画像アップロード中フラグ */
  isUploading: boolean;
  /** 手入力 CSV */
  manualCsv: string;
  /** 手入力 CSV の更新 */
  onManualCsvChange: (value: string) => void;
  /** 手入力 CSV の取り込み */
  onManualImport: () => Promise<void>;
  /** CSV エクスポート */
  onExport: () => void;
  /** CSV ファイル取り込み */
  onFileImport: (file: File) => Promise<void>;
  /** CSV 追加ファイル取り込み */
  onCsvImport: (file: File) => Promise<void>;
  /** 画像取り込み */
  onImageImport: (files: FileList) => Promise<void>;
  /** 取り込み結果のサマリー */
  summary: CsvImportResult | null;
  /** エラーメッセージ */
  error: string | null;
  /** エクスポートプレビュー文字列 */
  exportText: string | null;
};

/**
 * 設定画面のファイル入力と CSV 操作欄をまとめた非表示ブロックです。
 *
 * - 副作用: ファイル選択時に指定ハンドラを呼び出します。
 * - 入力制約: `onCsvImport` と `onImageImport` は非同期関数を渡してください。
 * - 戻り値: sr-only の入力欄と CSV 操作 UI を返します。
 * - Chrome DevTools MCP ではファイル選択後の反映を確認します。
 */
export const SettingHiddenInputs: FC<SettingHiddenInputsProps> = ({
  isMutating,
  isUploading,
  manualCsv,
  onManualCsvChange,
  onManualImport,
  onExport,
  onFileImport,
  onCsvImport,
  onImageImport,
  summary,
  error,
  exportText,
}) => {
  return (
    <div className="sr-only">
      <input
        id="csv-import-simple"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onCsvImport(file);
          }
          event.currentTarget.value = "";
        }}
      />
      <input
        id="image-import-simple"
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          const files = event.target.files;
          if (files) {
            void onImageImport(files);
          }
          event.currentTarget.value = "";
        }}
        disabled={isUploading || isMutating}
      />
      <CsvControls
        disabled={isMutating}
        onFileImport={onFileImport}
        manualCsv={manualCsv}
        onManualCsvChange={onManualCsvChange}
        onManualImport={onManualImport}
        onExport={onExport}
        summary={summary}
        error={error}
        exportText={exportText}
      />
    </div>
  );
};
