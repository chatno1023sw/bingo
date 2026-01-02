import type { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "~/components/common/Button";

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
 * - 副作用: `createPortal` により `document.body` へ描画します。
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
  if (!open) {
    return null;
  }
  if (typeof document === "undefined") {
    return null;
  }

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <Button
          type="button"
          className="absolute right-4 top-4 rounded-full border border-slate-200 px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
          onClick={onClose}
          aria-label="閉じる"
          disabled={disabled}
        >
          ×
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm text-slate-600">{description}</p>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
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
            className="flex-1 rounded-2xl border border-transparent bg-[#0F6A86] px-4 py-3 font-semibold text-white transition hover:bg-[#0d5870] focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={disabled}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
