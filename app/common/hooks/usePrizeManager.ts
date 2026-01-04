import { useContext } from "react";
import { PrizeContext, type PrizeContextValue } from "~/common/contexts/PrizeContext";

/**
 * PrizeContext を取得するフックです。
 *
 * - 副作用: ありません。
 * - 入力制約: PrizeProvider 配下で利用してください。
 * - 戻り値: PrizeContextValue を返します。
 * - Chrome DevTools MCP では景品操作が動作することを確認します。
 */
export const usePrizeManager = (): PrizeContextValue => {
  const context = useContext(PrizeContext);
  if (!context) {
    throw new Error("usePrizeManager must be used within PrizeProvider");
  }
  return context;
};
