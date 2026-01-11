import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { Image } from "lucide-react";
import type { FC } from "react";
import { resolveAudioPath } from "~/common/constants/audio";
import { useAudioPreferences } from "~/common/contexts/AudioPreferenceContext";
import { getSoundDetailPreference } from "~/common/services/soundDetailPreferenceService";
import { useStoredImage } from "~/common/hooks/useStoredImage";
import type { Prize } from "~/common/types";
import { CommonDialog } from "~/components/common/CommonDialog";

export type PrizeResultDialogProps = {
  /** ダイアログの表示状態 */
  open: boolean;
  /** 当選した景品 */
  prize: Prize | null;
  /** 閉じる操作 */
  onClose: () => void;
};

/**
 * 景品ルーレットの結果表示ダイアログ。
 *
 * - 当選した景品の画像・賞名・景品名を表示します。
 * - `open` が false の場合は描画せず、CommonDialog の Portal への描画も行いません。
 * - Chrome DevTools MCP では結果ダイアログが自動表示されることを確認します。
 */
export const PrizeResultDialog: FC<PrizeResultDialogProps> = ({ open, prize, onClose }) => {
  const prizeVoiceRef = useRef<Howl | null>(null);
  const { sound } = useAudioPreferences();
  const soundDetail = getSoundDetailPreference();
  const resolvedImagePath = useStoredImage(prize?.imagePath ?? null);
  const hasImage = Boolean(resolvedImagePath);
  useEffect(() => {
    if (!open || !prize) {
      prizeVoiceRef.current?.stop();
      return;
    }
    const prizeVoice = new Howl({
      src: [resolveAudioPath("prize-roulette.wav")],
      volume: sound.preference.volume * soundDetail.voiceVolume,
      onend: () => {
        prizeVoice.unload();
        prizeVoiceRef.current = null;
      },
    });
    prizeVoiceRef.current = prizeVoice;
    prizeVoice.play();
    return () => {
      prizeVoice.stop();
      prizeVoice.unload();
      prizeVoiceRef.current = null;
    };
  }, [open, prize, sound.preference.volume, soundDetail.voiceVolume]);
  if (!prize) {
    return null;
  }
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      titleClassName="pt-8 text-3xl"
      headerClassName="text-center"
      contentClassName="flex flex-col items-center justify-center"
      showCloseButton
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex h-48 w-full items-center justify-center rounded-2xl">
          {hasImage ? (
            <img
              src={resolvedImagePath ?? ""}
              alt={`${prize.prizeName || "景品"} 画像`}
              className="h-full w-full rounded-2xl object-cover object-center"
            />
          ) : (
            <Image
              className="h-48 w-48 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden="true"
            />
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
