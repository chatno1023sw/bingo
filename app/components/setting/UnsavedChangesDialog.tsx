import type { FC } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type UnsavedChangesDialogProps = {
  /** ダイアログの表示状態 */
  open: boolean;
  /** キャンセル操作 */
  onCancel: () => void;
  /** 破棄して移動する操作 */
  onProceed: () => void;
};

/**
 * 未保存の変更がある場合の確認ダイアログです。
 *
 * - 副作用: ボタン押下でコールバックを実行します。
 * - 入力制約: `open` が false の場合は描画しません。
 * - 戻り値: CommonDialog を返します。
 * - Chrome DevTools MCP では戻る操作時の表示を確認します。
 */
export const UnsavedChangesDialog: FC<UnsavedChangesDialogProps> = ({
  open,
  onCancel,
  onProceed,
}) => {
  return (
    <CommonDialog
      open={open}
      onClose={onCancel}
      title="編集中のデータが消えちゃいます！"
      description="保存したかったら戻るボタンを押してね。"
      footer={
        <>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-muted-foreground hover:bg-muted"
            onClick={onCancel}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-2xl px-4 py-3"
            onClick={onProceed}
          >
            移動する！
          </Button>
        </>
      }
    />
  );
};
