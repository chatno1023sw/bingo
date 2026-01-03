import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type ContinueDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

/**
 * 「続きから」押下時の確認ダイアログです。
 *
 * - 入力制約: `open` が false の場合は描画せず、`onConfirm`/`onCancel` は必須です。
 * - 副作用: CommonDialog の Portal 経由で `document.body` へ描画します。
 * - 戻り値: ダイアログの React 要素、または `null` を返します。
 * - Chrome DevTools MCP では「続きから」押下でダイアログが開くことを確認します。
 */
export const ContinueDialog: FC<ContinueDialogProps> = ({
  open,
  title = "前回の状態を復元しますか？",
  description = "保存済みのゲーム状態を読み込みます。現在の進行状況は上書きされます。",
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => {
  return (
    <CommonDialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-2xl border border-transparent bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            復元する
          </Button>
        </>
      }
    />
  );
};
