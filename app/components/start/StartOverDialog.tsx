import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type StartOverDialogProps = {
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
 * 最初から始める確認ダイアログコンポーネント
 * @param props StartOverDialogProps
 * @returns JSX.Element
 */
export const StartOverDialog: FC<StartOverDialogProps> = ({
  open,
  title = "最初から始める？",
  description = "前回の抽選結果を忘れて再スタート！",
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
