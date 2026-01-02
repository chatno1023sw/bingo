/**
 * クラス名を結合するユーティリティ。
 *
 * - falsy 値は除外し、文字列のみを空白区切りで連結します。
 * - 依存ライブラリなしで shadcn 互換の `cn` として使用します。
 * - Chrome DevTools MCP では対象要素の className が期待通り連結されることを確認します。
 */
export const cn = (...inputs: Array<string | false | null | undefined>) => {
  return inputs.filter(Boolean).join(" ");
};
