import type { FC } from "react";
import type { ButtonProps } from "~/components/ui/button";
import { Button as ShadcnButton } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * 画面全体で共通利用するボタンコンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: `type` が未指定の場合は `button` を採用します。
 * - 戻り値: `button` 要素を返します。
 * - Chrome DevTools MCP では任意の画面でボタンをクリックし、既存の UI が崩れないことを確認します。
 */
export const Button: FC<ButtonProps> = ({ type = "button", className, ...rest }) => {
  return (
    <ShadcnButton
      className={cn(
        "font-bold",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        "focus:outline-none",
        'font-["BIZ_UDPゴシック","BIZ_UDゴシック","Yu_Gothic_UI","Meiryo",sans-serif]',
        className,
      )}
      type={type}
      {...rest}
    />
  );
};
