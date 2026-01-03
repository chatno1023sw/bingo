import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type ResetDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

/**
 * 抽選履歴をクリアする確認ダイアログ。
 *
 * - クリアボタン押下時に `onConfirm` を呼び出し、抽選履歴の削除を要求します。
 * - `open` が false の場合は描画せず、CommonDialog の Portal への描画も行いません。
 * - Chrome DevTools MCP では「抽選クリア」ボタン押下後にモーダルが表示され、×/キャンセルで閉じることを確認します。
 */
export const ResetDialog: FC<ResetDialogProps> = ({
  open,
  title = "抽選履歴をクリアしますか？",
  description = "抽選履歴のみを削除します。",
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
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
            onClick={onClose}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-transparent bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={disabled}
          >
            クリア
          </Button>
        </>
      }
    />
  );
};
