import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

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
 * - `open` が false の場合は描画せず、CommonDialog の Portal への描画も行いません。
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
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      showCloseButton
      closeDisabled={disabled}
      footer={
        <>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-border px-4 py-3 font-semibold text-muted-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-ring"
            onClick={onClose}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-transparent bg-secondary px-4 py-3 font-semibold text-secondary-foreground transition hover:bg-secondary/80 focus:outline-none focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={disabled}
          >
            OK
          </Button>
        </>
      }
    >
      <div className="mt-6">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => onFilesSelected(event.target.files)}
          disabled={disabled}
        />
      </div>
    </CommonDialog>
  );
};
