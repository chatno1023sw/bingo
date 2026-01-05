import { useState, type FC } from "react";
import type { BgmPreference } from "~/common/types";
import { BgmSidebar } from "~/components/common/BgmSidebar";
import { BgmToggle } from "~/components/common/BgmToggle";
import { cn } from "~/lib/utils";

export type BgmControlProps = {
  /** BGM 設定 */
  preference: BgmPreference;
  /** 初期化完了フラグ */
  isReady: boolean;
  /** 音量変更 */
  onVolumeChange: (volume: number) => void;
  /** 追加クラス */
  className?: string;
};

/**
 * BGM アイコンと音量スライダーをまとめた共通コンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: `volume` は 0.0〜1.0 の範囲で渡してください。
 * - 戻り値: BGM 操作 UI を返します。
 * - Chrome DevTools MCP ではアイコン押下でスライダーが表示されることを確認します。
 */
export const BgmControl: FC<BgmControlProps> = ({
  preference,
  isReady,
  onVolumeChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative flex items-center", className)}>
      <BgmToggle
        enabled={preference.volume > 0}
        onToggle={() => setOpen((prev) => !prev)}
        disabled={!isReady}
      />
      <BgmSidebar open={open} preference={preference} onVolumeChange={onVolumeChange} />
    </div>
  );
};
