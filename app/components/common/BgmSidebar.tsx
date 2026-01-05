import type { FC } from "react";
import type { BgmPreference } from "~/common/types";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";

export type BgmSidebarProps = {
  /** スライダーの表示状態 */
  open: boolean;
  /** BGM 設定 */
  preference: BgmPreference;
  /** 音量変更 */
  onVolumeChange: (volume: number) => void;
};

/**
 * BGM の音量調節サイドバーです。
 *
 * - 副作用: ありません。
 * - 入力制約: `volume` は 0.0〜1.0 の範囲で渡してください。
 * - 戻り値: サイドバーの JSX を返します。
 * - Chrome DevTools MCP ではアイコン押下で表示され、スライダー操作で音量が更新されることを確認します。
 */
export const BgmSidebar: FC<BgmSidebarProps> = ({
  open,
  preference,
  onVolumeChange,
}) => {
  return (
    <div
      className={cn(
        "overflow-hidden transition-[width,opacity,margin] duration-200 ease-out",
        open ? "ml-2 w-44 opacity-100" : "ml-0 w-0 opacity-0",
      )}
      aria-hidden={!open}
    >
      <Slider
        value={[Math.round(preference.volume * 100)]}
        min={0}
        max={100}
        step={1}
        onValueChange={(value) => {
          const next = Math.min(100, Math.max(0, value[0] ?? 0)) / 100;
          onVolumeChange(next);
        }}
      />
    </div>
  );
};
