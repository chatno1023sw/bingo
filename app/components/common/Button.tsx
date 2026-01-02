import type { ButtonHTMLAttributes, FC } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 画面全体で共通利用するボタンコンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: `type` が未指定の場合は `button` を採用します。
 * - 戻り値: `button` 要素を返します。
 * - Chrome DevTools MCP では任意の画面でボタンをクリックし、既存の UI が崩れないことを確認します。
 */
export const Button: FC<ButtonProps> = ({ type = "button", ...rest }) => {
  return <button type={type} {...rest} />;
};
