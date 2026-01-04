import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type ResetSelectionDialogProps = {
  /** ダイアログの表示状態 */
  open: boolean;
  /** ダイアログのタイトル */
  title?: string;
  /** ダイアログの説明文 */
  description?: ReactNode;
  /** ダイアログを閉じるときに呼び出されるコールバック関数 */
  onClose: () => void;
  /** 確認ボタンが押されたときに呼び出されるコールバック関数 */
  onConfirm: () => void;
  /** ボタンの無効化状態 */
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
  title = "選出状態をリセットする？",
  description = "最初からゲームを始めたいときにオススメ！",
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
            className="flex-1 rounded-2xl px-4 py-3"
            onClick={onClose}
            disabled={disabled}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-2xl px-4 py-3"
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
