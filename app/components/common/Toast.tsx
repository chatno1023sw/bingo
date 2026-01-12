import { X } from "lucide-react";
import type { CSSProperties, FC } from "react";
import { useEffect } from "react";
import { cn } from "~/lib/utils";

export type ToastProps = {
  /** 表示フラグ */
  open: boolean;
  /** 通知文言 */
  message: string;
  /** 閉じる操作 */
  onClose: () => void;
  /** 追加クラス */
  className?: string;
  /** 追加スタイル */
  style?: CSSProperties;
  /** 自動的に閉じるまでの時間（ミリ秒） */
  autoHideDurationMs?: number;
};

/**
 * クロージャブルなトースト通知コンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: `message` には簡潔な文章を渡してください。
 * - 戻り値: 表示時は通知要素、`open` が false のときは `null` を返します。
 * - Chrome DevTools MCP では表示位置と × ボタンで閉じられることを確認します。
 */
export const Toast: FC<ToastProps> = ({
  open,
  message,
  onClose,
  className,
  style,
  autoHideDurationMs = 2000,
}) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    const timer = window.setTimeout(() => {
      onClose();
    }, autoHideDurationMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [autoHideDurationMs, onClose, open]);
  if (!open) {
    return null;
  }
  return (
    <output
      aria-live="polite"
      style={{ zIndex: 9999, ...style }}
      className={cn(
        "pointer-events-auto z-100 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3",
        "shadow-[0_12px_24px_rgba(15,23,42,0.45)] backdrop-blur",
        className,
      )}
    >
      <span className="flex-1 font-semibold text-foreground text-sm tracking-wide">{message}</span>
      <button
        type="button"
        className="rounded-full border border-transparent p-1 text-muted-foreground transition hover:text-foreground focus:outline-none"
        aria-label="トーストを閉じる"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>
    </output>
  );
};
