import type { FC } from "react";
import { cn } from "~/lib/utils";

export type VenueLabelProps = {
  /** ラベルに表示する文言 */
  text: string;
  /** 追加クラス */
  className?: string;
};

/**
 * 会場ブースト状態を示すネオンラベルです。
 *
 * - 副作用: ありません。
 * - 入力制約: `text` はそのまま描画されるため表示幅に収まる文字列を指定してください。
 * - 戻り値: ネオン演出付きの `span` 要素を返します。
 * - Chrome DevTools MCP ではゲームヘッダーに配置し、ラベルが常に視認できることを確認します。
 */
export const VenueLabel: FC<VenueLabelProps> = ({ text, className }) => {
  return (
    <span className={cn("venue-neon-label", className)} aria-live="polite">
      {text}
    </span>
  );
};
