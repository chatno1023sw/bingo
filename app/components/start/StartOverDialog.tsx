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
 * 「はじめから」押下時の確認ダイアログです。
 *
 * - 入力制約: `open` が false の場合は描画せず、`onClose`/`onConfirm` は必須です。
 * - 副作用: CommonDialog の Portal により `document.body` へ描画します。
 * - 戻り値: ダイアログの React 要素、または `null` を返します。
 * - Chrome DevTools MCP では「はじめから」押下時にダイアログが開き、OK で遷移することを確認します。
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
