import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type StartOverDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

/**
 * 「はじめから」押下時の確認ダイアログです。
 *
 * - 入力制約: `open` が false の場合は描画せず、`onClose`/`onConfirm` は必須です。
 * - 副作用: CommonDialog の Portal により `document.body` へ描画します。
 * - 戻り値: ダイアログの React 要素、または `null` を返します。
 * - Chrome DevTools MCP では「はじめから」押下時にダイアログが開き、OK で遷移することを確認します。
 */
export const StartOverDialog: FC<StartOverDialogProps> = ({
  open,
  title = "最初から始めますか？",
  description = "過去の履歴は削除されるけど、本当に最初から初めてもいい？",
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
            className="flex-1 rounded-2xl border border-border px-4 py-3 font-semibold text-muted-foreground hover:bg-muted"
            onClick={onClose}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-transparent bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
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
