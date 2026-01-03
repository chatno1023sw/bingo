import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type ResetSelectionDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

/**
 * 景品カードを未選出に戻す確認ダイアログ。
 *
 * - OK ボタン押下時に `onConfirm` を呼び出し、選出状態の初期化を要求します。
 * - `open` が false の場合は描画せず、CommonDialog の Portal への描画も行いません。
 * - Chrome DevTools MCP では「全未選出」押下後にモーダルが表示されることを確認します。
 */
export const ResetSelectionDialog: FC<ResetSelectionDialogProps> = ({
  open,
  title = "すべてのカードを未選出にします",
  description = "選出済みの状態がすべて解除されます。",
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
            className="flex-1 rounded-2xl border border-transparent bg-secondary px-4 py-3 font-semibold text-secondary-foreground transition hover:bg-secondary/80 focus:outline-none focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={disabled}
          >
            OK
          </Button>
        </>
      }
    />
  );
};
