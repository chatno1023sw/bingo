import type { FC } from "react";
export type BgmToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

/**
 * BGM のオン／オフを切り替えるヘッダアイコン。
 *
 * - `aria-pressed` を利用し、スクリーンリーダーで現在の状態を通知します。
 * - Chrome DevTools MCP では `localStorage.getItem("bingo.v1.bgm")` を併せて確認し、トグル操作が保存されることを検証します。
 * - 抽選操作と競合しないよう、`disabled` 指定時は半透明スタイルで操作不能にします。
 */
export const BgmToggle: FC<BgmToggleProps> = ({ enabled, onToggle, disabled = false }) => {
  const label = enabled ? "BGM をオフにする" : "BGM をオンにする";
  return (
    <button
      type="button"
      className="rounded-full border border-slate-300 bg-white/80 p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
      aria-pressed={enabled}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02ZM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"
          fill="currentColor"
        />
        {enabled ? null : (
          <line
            x1="4"
            y1="4"
            x2="20"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
};
