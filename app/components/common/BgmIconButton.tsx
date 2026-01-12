import { Volume2Icon } from "lucide-react";
import type { FC } from "react";
import { cn } from "~/lib/utils";

export type BgmIconButtonProps = {
  /** サンプル音を再生する操作 */
  onClick: () => void;
  /** 音声種別を説明するラベル */
  ariaLabel: string;
  /** 操作不可状態 */
  disabled?: boolean;
  /** 追加クラス */
  className?: string;
};

/**
 * 音量スライダー横に表示する丸型の BGM アイコンボタンです。
 *
 * - 副作用: ありません。
 * - 入力制約: `ariaLabel` には音声種別を明示した短文を渡します。
 * - 戻り値: サンプル再生ボタンを返します。
 * - Chrome DevTools MCP ではクリック時に効果音が再生されることを確認します。
 */
export const BgmIconButton: FC<BgmIconButtonProps> = ({
  onClick,
  ariaLabel,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <Volume2Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};
