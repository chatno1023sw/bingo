import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { SettingContent } from "~/components/setting/SettingContent";

/**
 * Setting 画面のルートコンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: なし。
 * - 戻り値: Setting 画面の JSX を返します。
 * - Chrome DevTools MCP では Setting 画面が表示されることを確認します。
 */
export default function SettingRoute() {
  return (
    <main className="min-h-screen bg-background p-2 text-foreground">
      <div className="w-full bg-background p-3">
        <PrizeProvider>
          <SettingContent />
        </PrizeProvider>
      </div>
    </main>
  );
}
