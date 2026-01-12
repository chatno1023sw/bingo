import { X } from "lucide-react";
import type { FC, ReactNode } from "react";
import type { BgmPreference } from "~/common/types";
import {
  BgmControl,
  type SliderBounds,
  type VolumeSliderConfig,
} from "~/components/common/BgmControl";
import { Button } from "~/components/common/Button";
import { cn } from "~/lib/utils";

export type GameHeaderProps = {
  /** 抽選履歴をクリアする */
  onClear: () => void;
  /** クリアボタンの無効化 */
  clearDisabled: boolean;
  /** 履歴列数トグルボタンのラベル */
  historyToggleLabel: string;
  /** 履歴列数トグル操作 */
  onToggleHistoryColumns: () => void;
  /** Start 画面へ戻る */
  onNavigateBack: () => void;
  /** BGM コントロール設定 */
  bgmControl: {
    preference: BgmPreference;
    soundPreference: BgmPreference;
    isReady: boolean;
    onVolumeChange: (volume: number) => Promise<void>;
    onSoundVolumeChange: (volume: number) => Promise<void>;
    extraSliders: VolumeSliderConfig[];
    onResetToDefault: () => void;
    onMuteAll: () => void;
    mainSliderBounds?: SliderBounds;
    soundSliderBounds?: SliderBounds;
    footerExtras?: ReactNode;
    onDialogOpenChange?: (open: boolean) => void;
    venueBoostActive?: boolean;
  };
};

/**
 * ゲーム画面ヘッダーを表示します。
 *
 * - 副作用: ありません。
 * - 入力制約: props に必要な操作コールバックを渡してください。
 * - 戻り値: ヘッダー JSX を返します。
 * - Chrome DevTools MCP では音量トグルやクリアボタンが動作することを確認します。
 */
export const GameHeader: FC<GameHeaderProps> = ({
  onClear,
  clearDisabled,
  historyToggleLabel,
  onToggleHistoryColumns,
  onNavigateBack,
  bgmControl,
}) => {
  return (
    <header className="flex items-center gap-6 px-6 py-4">
      <div className="flex flex-1 items-center gap-2 pr-6">
        <Button
          type="button"
          variant="secondary"
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs hover:bg-muted",
            "relative top-2",
          )}
          onClick={onToggleHistoryColumns}
        >
          {historyToggleLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={cn(
            "rounded-full border border-border px-3 py-1 text-sm hover:bg-muted",
            "relative top-2",
          )}
          onClick={onClear}
          disabled={clearDisabled}
        >
          クリア
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <BgmControl
          preference={bgmControl.preference}
          soundPreference={bgmControl.soundPreference}
          isReady={bgmControl.isReady}
          onVolumeChange={bgmControl.onVolumeChange}
          onSoundVolumeChange={bgmControl.onSoundVolumeChange}
          extraSliders={bgmControl.extraSliders}
          useDialog
          onResetToDefault={bgmControl.onResetToDefault}
          onMuteAll={bgmControl.onMuteAll}
          mainSliderBounds={bgmControl.mainSliderBounds}
          soundSliderBounds={bgmControl.soundSliderBounds}
          footerExtras={bgmControl.footerExtras}
          onDialogOpenChange={bgmControl.onDialogOpenChange}
          venueBoostActive={bgmControl.venueBoostActive}
        />
        <Button
          type="button"
          variant="secondary"
          className="rounded-full!"
          aria-label="Start 画面に戻る"
          onClick={onNavigateBack}
        >
          <X className="aspect-square h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};
