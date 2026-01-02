import type { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "~/components/common/Button";

export type UploadImagesDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  onFilesSelected: (files: FileList | null) => void;
  disabled?: boolean;
};

/**
 * 賞品名に紐づく画像を追加する確認ダイアログ。
 *
 * - OK 押下時に選択済みのファイル群を `onConfirm` で渡します。
 * - `open` が false の場合は描画せず、ポータル生成も行いません。
 * - Chrome DevTools MCP では「画像追加」押下後にモーダルが表示されることを確認します。
 */
export const UploadImagesDialog: FC<UploadImagesDialogProps> = ({
  open,
  title = "賞品名に紐づけて写真を複数追加できます。",
  description,
  onClose,
  onConfirm,
  onFilesSelected,
  disabled = false,
}) => {
  if (!open) {
    return null;
  }
  if (typeof document === "undefined") {
    return null;
  }

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <Button
          type="button"
          className="absolute right-4 top-4 rounded-full border border-slate-200 px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
          onClick={onClose}
          aria-label="閉じる"
          disabled={disabled}
        >
          ×
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {description ? <p className="mt-3 text-sm text-slate-600">{description}</p> : null}
        <div className="mt-6">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => onFilesSelected(event.target.files)}
            disabled={disabled}
          />
        </div>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
            onClick={onClose}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-transparent bg-slate-800 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={disabled}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
