import { Image } from "lucide-react";
import type { FC } from "react";
import type { Prize } from "~/common/types";
import { CommonDialog } from "~/components/common/CommonDialog";

export type PrizeResultDialogProps = {
  open: boolean;
  prize: Prize | null;
  onClose: () => void;
};

/**
 * 景品ルーレットの結果表示ダイアログ。
 *
 * - 当選した景品の画像・賞名・賞品名を表示します。
 * - `open` が false の場合は描画せず、CommonDialog の Portal への描画も行いません。
 * - Chrome DevTools MCP では結果ダイアログが自動表示されることを確認します。
 */
export const PrizeResultDialog: FC<PrizeResultDialogProps> = ({ open, prize, onClose }) => {
  if (!prize) {
    return null;
  }
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="おめでとうございます！"
      titleClassName="pt-8 text-3xl"
      headerClassName="text-center"
      contentClassName="flex flex-col items-center justify-center"
      showCloseButton
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex h-48 w-full items-center justify-center rounded-2xl">
          {prize.imagePath ? (
            <img
              src={prize.imagePath}
              alt={`${prize.prizeName || "景品"} 画像`}
              className="h-full w-full rounded-2xl object-cover object-center"
            />
          ) : (
            <Image className="h-48 w-48 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>
        <div className="flex w-full flex-col items-center justify-center space-y-2 text-3xl text-foreground">
          <p>{prize.prizeName || "未設定"}</p>
          <p>{prize.itemName || "未設定"}</p>
        </div>
      </div>
    </CommonDialog>
  );
};
