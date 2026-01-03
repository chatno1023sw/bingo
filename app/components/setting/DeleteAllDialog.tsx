import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type DeleteAllDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

/**
 * 景品カードを全削除する確認ダイアログ。
 *
 * - 削除ボタン押下時に `onConfirm` を呼び出し、景品の全削除を要求します。
 * - `open` が false の場合は描画せず、CommonDialog の Portal への描画も行いません。
 * - Chrome DevTools MCP では「カード全削除」押下後にモーダルが表示されることを確認します。
 */
export const DeleteAllDialog: FC<DeleteAllDialogProps> = ({
  open,
  title = "本当にすべて削除する？",
  description = "新しく景品を登録するときにオススメ！",
  onClose,
  onConfirm,
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
            variant="outline"
            className="flex-1 rounded-2xl px-4 py-3"
            onClick={onClose}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 rounded-2xl px-4 py-3"
            onClick={onConfirm}
            disabled={disabled}
          >
            削除
          </Button>
        </>
      }
    />
  );
};
