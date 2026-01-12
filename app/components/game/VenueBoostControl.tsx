import { type FC, useState } from "react";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type VenueBoostControlProps = {
  /** 現在の会場ブースト状態 */
  isActive: boolean;
  /** ブースト起動操作 */
  onActivate: () => Promise<void> | void;
  /** ブースト解除操作 */
  onDeactivate: () => Promise<void> | void;
};

/**
 * 会場ブーストボタンと確認ダイアログをまとめたコンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: `onActivate` / `onDeactivate` は Promise も返せます。
 * - 戻り値: 音量ダイアログ用のボタンと確認ダイアログを返します。
 * - Chrome DevTools MCP ではボタン操作で確認ダイアログが表示されることを確認します。
 */
export const VenueBoostControl: FC<VenueBoostControlProps> = ({
  isActive,
  onActivate,
  onDeactivate,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const closeDialog = () => {
    if (isProcessing) {
      return;
    }
    setConfirmOpen(false);
  };

  const handleActivate = async () => {
    setIsProcessing(true);
    try {
      await onActivate();
      setConfirmOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivate = async () => {
    setIsProcessing(true);
    try {
      await onDeactivate();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="venue"
        className="w-full rounded-full px-6 py-3 text-base"
        onClick={() => {
          if (isActive) {
            void handleDeactivate();
            return;
          }
          setConfirmOpen(true);
        }}
        disabled={isProcessing}
      >
        {isActive ? "会場ブースト解除" : "会場ブースト"}
      </Button>
      <CommonDialog
        open={confirmOpen}
        onClose={closeDialog}
        title="注意！"
        headerClassName="px-6 pt-8"
        titleClassName="text-2xl font-bold text-destructive"
        contentClassName="w-[min(92vw,420px)]"
        footerClassName="px-6 pb-6"
        showCloseButton
        closeButtonAriaLabel="会場ブースト確認を閉じる"
        closeDisabled={isProcessing}
        preventOutsideClose={isProcessing}
      >
        <div className="space-y-3 px-6 pt-4 pb-2 text-base text-foreground">
          <p>会場ブーストを使うと最大音量が音源の最大値になるよ！</p>
          <p>ボタンを押したら音量をいったん０にするから調節してね！</p>
        </div>
        <div className="px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full px-4 py-3"
              onClick={closeDialog}
              disabled={isProcessing}
            >
              戻る
            </Button>
            <Button
              type="button"
              variant="venue"
              className="flex-1 rounded-full px-4 py-3"
              onClick={() => {
                void handleActivate();
              }}
              disabled={isProcessing}
            >
              起動
            </Button>
          </div>
        </div>
      </CommonDialog>
    </div>
  );
};
