import type { FC, ReactNode } from "react";
import { createPortal } from "react-dom";

export type ContinueDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

/**
 * 「続きから」押下時の確認ダイアログ。
 */
export const ContinueDialog: FC<ContinueDialogProps> = ({
  open,
  title = "前回の状態を復元しますか？",
  description = "保存済みのゲーム状態を読み込みます。現在の進行状況は上書きされます。",
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => {
  if (!open) {
    return null;
  }
  if (typeof document === "undefined") {
    return null;
  }
  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm text-slate-600">{description}</p>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="flex-1 rounded-2xl border border-transparent bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            復元する
          </button>
        </div>
      </div>
    </div>
  );
  return createPortal(dialog, document.body);
};
