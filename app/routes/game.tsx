import { SoundProvider } from "~/common/contexts/SoundContext";
import { GameContent } from "~/components/game/GameContent";

/**
 * Game 画面のルートコンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: GameContent を返します。
 * - Chrome DevTools MCP では Game 画面が表示されることを確認します。
 */
export default function GameRoute() {
  return (
    <SoundProvider enabled>
      <GameContent />
    </SoundProvider>
  );
}
