import { useEffect, useRef, useState, type FC } from "react";
import type { BgmPreference } from "~/common/types";
import { BgmToggle } from "~/components/common/BgmToggle";
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
  /** 追加クラス */
  className?: string;
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
  className,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative flex items-center", className)}>
      <BgmToggle
        enabled={preference.volume > 0}
        onToggle={() => setOpen((prev) => !prev)}
        disabled={!isReady}
      />
      <div
        className={cn(
          "overflow-hidden transition-[width,opacity,margin] duration-200 ease-out",
          open ? "ml-2 w-52 opacity-100" : "ml-0 w-0 opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 text-right">BGM</span>
            <Slider
              value={[Math.round(preference.volume * 100)]}
              min={0}
              max={100}
              step={1}
              disabled={!isReady}
              onValueChange={(value) => {
                const next = Math.min(100, Math.max(0, value[0] ?? 0)) / 100;
                onVolumeChange(next);
              }}
            />
          </div>
          {showSoundSlider && soundPreference && onSoundVolumeChange ? (
            <div className="flex items-center gap-2">
              <span className="w-8 text-right">SE</span>
              <Slider
                value={[Math.round(soundPreference.volume * 100)]}
                min={0}
                max={100}
                step={1}
                disabled={!isReady}
                onValueChange={(value) => {
                  const next = Math.min(100, Math.max(0, value[0] ?? 0)) / 100;
                  onSoundVolumeChange(next);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
