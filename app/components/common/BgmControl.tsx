import { type FC, useEffect, useRef, useState } from "react";
import { Button } from "~/components/common/Button";
import type { BgmPreference } from "~/common/types";
import { BgmToggle } from "~/components/common/BgmToggle";
import { CommonDialog } from "~/components/common/CommonDialog";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";

export type BgmControlProps = {
  /** BGM 設定 */
  preference: BgmPreference;
  /** 初期化完了フラグ */
  isReady: boolean;
  /** 音量変更 */
  onVolumeChange: (volume: number) => void;
  /** 効果音の設定 */
  soundPreference?: BgmPreference;
  /** 効果音の音量変更 */
  onSoundVolumeChange?: (volume: number) => void;
  /** 効果音スライダーの表示 */
  showSoundSlider?: boolean;
  /** ダイアログ表示で音量調整を行う */
  useDialog?: boolean;
  /** 追加で表示する音量スライダー */
  extraSliders?: VolumeSliderConfig[];
  /** 追加クラス */
  className?: string;
  /** デフォルト値へ戻す操作 */
  onResetToDefault?: () => void;
};

export type VolumeSliderConfig = {
  /** 表示ラベル */
  label: string;
  /** 現在の値 */
  value: number;
  /** 値変更ハンドラ */
  onChange: (value: number) => void;
  /** 最小値 */
  min?: number;
  /** 最大値 */
  max?: number;
  /** 刻み幅 */
  step?: number;
  /** 無効化フラグ */
  disabled?: boolean;
};

/**
 * BGM アイコンと音量スライダーをまとめた共通コンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: `volume` は 0.0〜1.0 の範囲で渡してください。
 * - 戻り値: BGM 操作 UI を返します。
 * - Chrome DevTools MCP ではアイコン押下でスライダーが表示されることを確認します。
 */
export const BgmControl: FC<BgmControlProps> = ({
  preference,
  isReady,
  onVolumeChange,
  soundPreference,
  onSoundVolumeChange,
  showSoundSlider = true,
  useDialog = false,
  extraSliders = [],
  className,
  onResetToDefault,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (useDialog) {
      return;
    }
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (rootRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, useDialog]);

  const sliderLayout = {
    container: useDialog ? "flex w-full flex-col gap-4 px-2" : "flex w-full flex-col gap-3",
    row: cn("flex items-center gap-3", useDialog ? "justify-start" : "gap-2"),
    label: "min-w-32 text-right text-xl whitespace-nowrap",
    sliderWrap: "flex w-full",
  } as const;

  const sliderConfigs: VolumeSliderConfig[] = [
    {
      label: "BGM",
      value: preference.volume,
      onChange: onVolumeChange,
    },
    ...(showSoundSlider && soundPreference && onSoundVolumeChange
      ? [
          {
            label: "ボタン音量",
            value: soundPreference.volume,
            onChange: onSoundVolumeChange,
          },
        ]
      : []),
    ...extraSliders,
  ];

  const renderSliderRow = (config: VolumeSliderConfig) => {
    const min = config.min ?? 0;
    const max = config.max ?? 1;
    const step = config.step ?? 0.01;
    return (
      <div key={config.label} className={sliderLayout.row}>
        <span className={sliderLayout.label}>{config.label}</span>
        <div className={sliderLayout.sliderWrap}>
          <Slider
            value={[config.value]}
            min={min}
            max={max}
            step={step}
            disabled={!isReady || config.disabled}
            onValueChange={(value) => {
              const next = value[0] ?? min;
              const clamped = Math.min(max, Math.max(min, next));
              config.onChange(clamped);
            }}
          />
        </div>
      </div>
    );
  };

  const sliderContent = (
    <div className={cn(sliderLayout.container, "pt-8 text-xs")}>
      {sliderConfigs.map(renderSliderRow)}
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative flex items-center", className)}>
      <BgmToggle
        enabled={preference.volume > 0}
        onToggle={() => setOpen((prev) => !prev)}
        disabled={!isReady}
      />
      {useDialog ? (
        <CommonDialog
          open={open}
          onClose={() => setOpen(false)}
          title="音量設定"
          contentClassName="w-[min(92vw,420px)]"
          showCloseButton
          footer={
            onResetToDefault ? (
              <Button
                type="button"
                className="w-full rounded-full bg-secondary px-4 py-3 text-secondary-foreground hover:bg-secondary/80"
                onClick={onResetToDefault}
              >
                デフォルト値に戻す
              </Button>
            ) : undefined
          }
          footerClassName="px-6 pb-6"
        >
          <div className="mt-2 space-y-3">{sliderContent}</div>
        </CommonDialog>
      ) : (
        <div
          className={cn(
            "overflow-hidden transition-[width,opacity,margin] duration-200 ease-out",
            open ? "ml-2 w-52 opacity-100" : "ml-0 w-0 opacity-0",
          )}
          aria-hidden={!open}
        >
          {sliderContent}
        </div>
      )}
    </div>
  );
};
