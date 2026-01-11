import { Image } from "lucide-react";
import type { FC } from "react";
import { useStoredImage } from "~/common/hooks/useStoredImage";
import type { Prize } from "~/common/types";
import { Button } from "~/components/common/Button";
import { cn } from "~/lib/utils";

export type PrizeListItemProps = {
  /** 表示する景品 */
  prize: Prize;
  /** 操作無効フラグ */
  disabled?: boolean;
  /** 選出状態の切り替え */
  onToggle: (id: string, nextSelected: boolean) => void;
  /** 賞名のみ表示するかどうか */
  showPrizeNameOnly: boolean;
  /** 表示名切り替え操作 */
  onToggleDisplay: (id: string) => void;
};

/**
 * 景品一覧の 1 行を表示します。
 *
 * - 副作用: ありません。
 * - 入力制約: `prize` は Prize を渡してください。
 * - 戻り値: 景品行の JSX を返します。
 * - Chrome DevTools MCP では行表示を確認します。
 */
export const PrizeListItem: FC<PrizeListItemProps> = ({
  prize,
  disabled = false,
  onToggle,
  showPrizeNameOnly,
  onToggleDisplay,
}) => {
  const resolvedImagePath = useStoredImage(prize.imagePath);
  const hasImage = Boolean(resolvedImagePath);
  /**
   * 選出状態の切り替え処理です。
   *
   * - 副作用: `onToggle` を呼び出します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では選出状態の変更を確認します。
   */
  const handleToggle = () => {
    onToggle(prize.id, !prize.selected);
  };
  return (
    <li
      className={cn(
        "flex w-full min-w-0 items-center gap-3 rounded-2xl border px-4 py-2 text-sm transition",
        prize.selected ? "border-border bg-muted opacity-70" : "border-border bg-card",
      )}
    >
      <div className="flex aspect-4/3 w-16 items-center justify-center overflow-hidden rounded-2xl bg-muted">
        {hasImage ? (
          <img
            src={resolvedImagePath ?? ""}
            alt={`${prize.prizeName || "景品"} 画像`}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <Image className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          className={cn(
            "line-clamp-2 w-full min-w-0 cursor-pointer break-all text-left text-[clamp(1.4rem,1.7vw,1.95rem)] focus:outline-none",
            prize.selected ? "text-muted-foreground line-through" : "text-foreground",
          )}
          onClick={() => onToggleDisplay(prize.id)}
          disabled={disabled}
        >
          {showPrizeNameOnly ? prize.prizeName : prize.itemName}
        </button>
      </div>
      <Button
        type="button"
        variant="secondary"
        className={cn(
          "rounded-full px-4 py-1.5 text-xs",
          prize.selected && "border border-border text-muted-foreground",
        )}
        onClick={handleToggle}
        disabled={disabled}
      >
        {prize.selected ? "戻す" : "除外"}
      </Button>
    </li>
  );
};
