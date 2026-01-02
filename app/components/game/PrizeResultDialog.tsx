import { Image } from "lucide-react";
import type { FC } from "react";
import { createPortal } from "react-dom";
import type { Prize } from "~/common/types";
import { Button } from "~/components/common/Button";

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
      <div className="flex flex-col items-center justify-center relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <Button
          type="button"
          className="absolute right-4 top-4 rounded-full border border-slate-200 px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </Button>
        <h2 className="text-3xl font-bold text-slate-900 pt-8">おめでとうございます！</h2>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-48 w-full items-center justify-center rounded-2xl">
            {prize.imagePath ? (
              <img
                src={prize.imagePath}
                alt={`${prize.prizeName || "景品"} 画像`}
                className="h-full w-full rounded-2xl object-cover object-center"
              />
            ) : (
              <Image color="black" className="h-48 w-48" strokeWidth={1.5} aria-hidden="true" />
            )}
          </div>
          <div className="flex flex-col items-center justify-center w-full space-y-2 text-3xl text-slate-700">
            <p>{prize.prizeName || "未設定"}</p>
            <p>{prize.itemName || "未設定"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
