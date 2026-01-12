import { Volume2Icon, VolumeOffIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "~/components/common/Button";
import { cn } from "~/lib/utils";

export type BgmToggleProps = {
  /** BGM の有効状態 */
  enabled: boolean;
  /** トグル操作 */
  onToggle: () => void;
  /** 操作無効フラグ */
  disabled?: boolean;
  /** 会場ブースト強調表示 */
  boosted?: boolean;
};

/**
 * BGM のオン／オフを切り替えるヘッダアイコン。
 *
 * - `aria-pressed` を利用し、スクリーンリーダーで現在の状態を通知します。
 * - Chrome DevTools MCP では `localStorage.getItem("bingo.v1.bgm")` を併せて確認し、トグル操作が保存されることを検証します。
 * - 抽選操作と競合しないよう、`disabled` 指定時は半透明スタイルで操作不能にします。
 */
export const BgmToggle: FC<BgmToggleProps> = ({
  enabled,
  onToggle,
  disabled = false,
  boosted = false,
}) => {
  const label = enabled ? "BGM をオフにする" : "BGM をオンにする";
  return (
    <Button
      type="button"
      className={cn(
        "relative overflow-hidden rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm hover:bg-muted focus:outline-none",
        boosted && "venue-boosted-toggle",
      )}
      aria-pressed={enabled}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
    >
      {enabled ? (
        <Volume2Icon className={cn("h-6 w-6", boosted && "text-white")} aria-hidden="true" />
      ) : (
        <VolumeOffIcon className={cn("h-6 w-6", boosted && "text-white")} aria-hidden="true" />
      )}
    </Button>
  );
};
