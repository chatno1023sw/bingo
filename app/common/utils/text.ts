/**
 * 比較用に文字列を正規化します。
 *
 * - 副作用: ありません。
 * - 入力制約: `value` は undefined/null ではなく文字列を渡してください。
 * - 戻り値: トリムして小文字化した文字列を返します。
 * - Chrome DevTools MCP では CSV 解析と画像マッチングで同一結果となることを確認します。
 */
export const normalizeKeyText = (value: string): string => {
  return value.trim().toLowerCase();
};
