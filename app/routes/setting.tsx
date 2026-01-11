import { AudioPreferenceProvider } from "~/common/contexts/AudioPreferenceContext";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { SoundProvider } from "~/common/contexts/SoundContext";
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
        <AudioPreferenceProvider>
          <SoundProvider enabled={false}>
            <PrizeProvider>
              <SettingContent />
            </PrizeProvider>
          </SoundProvider>
        </AudioPreferenceProvider>
      </div>
    </main>
  );
}
