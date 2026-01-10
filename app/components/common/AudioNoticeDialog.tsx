import type { FC } from "react";
import { SoundProvider } from "~/common/contexts/SoundContext";
import { Button } from "~/components/common/Button";
import { CommonDialog } from "~/components/common/CommonDialog";

export type AudioNoticeDialogProps = {
  /** 表示状態 */
  open: boolean;
  /** 閉じる操作 */
  onClose: () => void;
  /** すべての音量をデフォルト値へ戻す */
  onEnableAll: () => void;
  /** すべての音量を 0 にする */
  onMuteAll: () => void;
};

/**
 * Start / Game 画面で表示する音量注意ダイアログです。
 *
 * - 副作用: ありません。
 * - 入力制約: `open` が true のときのみ Portal へ描画します。
 * - 戻り値: 注意喚起と 3 つの操作ボタンを含むダイアログ要素を返します。
 * - Chrome DevTools MCP では各ボタンを操作し、音量設定が更新されることを確認します。
 */
export const AudioNoticeDialog: FC<AudioNoticeDialogProps> = ({
  open,
  onClose,
  onEnableAll,
  onMuteAll,
}) => {
  if (!open) {
    return null;
  }
  return (
    <SoundProvider enabled={false}>
      <CommonDialog
        open={open}
        onClose={onClose}
        title="このゲームは音が流れるよ！"
        description="スピーカーの音量に気をつけてね。操作に合わせて賑やかなサウンドが再生されます。"
        contentClassName="w-[min(92vw,520px)]"
        headerClassName="space-y-4 text-center"
        titleClassName="text-3xl"
        showCloseButton
        closeButtonAriaLabel="音量注意ダイアログを閉じる"
        footerClassName="flex flex-col gap-3 pt-4 md:flex-row"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-2xl border border-border px-4 py-3 text-lg hover:bg-muted"
              onClick={onMuteAll}
            >
              音なし
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-2xl border border-transparent bg-primary px-4 py-3 text-lg text-primary-foreground shadow-sm hover:bg-primary"
              onClick={onEnableAll}
            >
              音あり
            </Button>
          </>
        }
      >
        <div className="mt-4 space-y-4 text-left text-base text-muted-foreground leading-relaxed">
          <p>Start 画面と Game 画面の音量調節で変えられるすべての音に影響するよ。</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
            <li>音なし: BGM と効果音、番号読み上げをすべてミュートします。</li>
            <li>音あり: BGM と効果音をおすすめの音量に戻します。</li>
            <li>× ボタン: 今回だけ閉じて、あとでまた設定できます。</li>
          </ul>
        </div>
      </CommonDialog>
    </SoundProvider>
  );
};
