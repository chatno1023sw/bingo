import type { FC } from "react";
import { createPortal } from "react-dom";
import type { Prize } from "~/common/types";

export type PrizeResultDialogProps = {
  open: boolean;
  prize: Prize | null;
  onClose: () => void;
};

/**
 * 景品ルーレットの結果表示ダイアログ。
 *
 * - 当選した景品の画像・賞名・賞品名を表示します。
 * - `open` が false の場合は描画せず、ポータル生成も行いません。
 * - Chrome DevTools MCP では結果ダイアログが自動表示されることを確認します。
 */
export const PrizeResultDialog: FC<PrizeResultDialogProps> = ({ open, prize, onClose }) => {
  if (!open) {
    return null;
  }
  if (!prize) {
    return null;
  }
  if (typeof document === "undefined") {
    return null;
  }

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full border border-slate-200 px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-slate-900">当選結果</h2>
        <div className="mt-6 space-y-4">
          <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-slate-300 bg-slate-50">
            {prize.imagePath ? (
              <img
                src={prize.imagePath}
                alt={`${prize.prizeName || "景品"} 画像`}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-sm text-slate-400">画像が登録されていません</span>
            )}
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">賞名</span>：{prize.prizeName || "未設定"}
            </p>
            <p>
              <span className="font-semibold">賞品名</span>：{prize.itemName || "未設定"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
