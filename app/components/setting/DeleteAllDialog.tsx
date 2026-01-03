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
  title = "本当に削除しますか？",
  description = "すべての景品カードが削除されます。",
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
            className="flex-1 rounded-2xl border border-border px-4 py-3 font-semibold text-muted-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-ring"
            onClick={onClose}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-transparent bg-destructive px-4 py-3 font-semibold text-destructive-foreground transition hover:bg-destructive/90 focus:outline-none focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
