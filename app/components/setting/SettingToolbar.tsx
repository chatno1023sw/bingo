import type { FC } from "react";
import { Button } from "~/components/common/Button";

export type SettingToolbarProps = {
  /** 操作無効フラグ */
  isMutating: boolean;
  /** 保存中フラグ */
  isSaving: boolean;
  /** 景品が存在するかどうか */
  hasPrizes: boolean;
  /** カード追加 */
  onAddCard: () => void;
  /** CSV 追加 */
  onCsvImportClick: () => void;
  /** 画像追加 */
  onImageUploadClick: () => void;
  /** 全未選出 */
  onResetSelections: () => void;
  /** 全削除 */
  onDeleteAll: () => void;
  /** 戻る */
  onBack: () => void;
};

/**
 * 設定画面のヘッダ操作ボタン群です。
 *
 * - 副作用: ボタン押下で各種ハンドラを実行します。
 * - 入力制約: `hasPrizes` が false の場合は一部操作を無効化します。
 * - 戻り値: 操作ボタンの JSX を返します。
 * - Chrome DevTools MCP ではボタン押下の反応を確認します。
 */
export const SettingToolbar: FC<SettingToolbarProps> = ({
  isMutating,
  isSaving,
  hasPrizes,
  onAddCard,
  onCsvImportClick,
  onImageUploadClick,
  onResetSelections,
  onDeleteAll,
  onBack,
}) => {
  return (
    <header className="fixed top-0 left-0 z-100 w-full bg-background py-2 shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="rounded bg-primary px-3 py-1.5 text-primary-foreground text-xs shadow-none hover:bg-primary/90 disabled:opacity-50"
            onClick={onAddCard}
            disabled={isMutating}
          >
            追加
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={onCsvImportClick}
            disabled={isMutating}
          >
            CSV追加
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={onImageUploadClick}
            disabled={isMutating || !hasPrizes}
          >
            画像追加
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded border border-border px-3 py-1.5 text-muted-foreground text-xs shadow-none hover:bg-muted disabled:opacity-50"
            onClick={onResetSelections}
            disabled={isMutating || !hasPrizes}
          >
            全未選出
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded border border-destructive px-3 py-1.5 text-destructive text-xs shadow-none hover:bg-destructive/10 disabled:opacity-50"
            onClick={onDeleteAll}
            disabled={isMutating || !hasPrizes}
          >
            全削除
          </Button>
        </div>
        <Button
          type="button"
          className="rounded bg-secondary px-3 py-1.5 text-secondary-foreground text-xs shadow-none hover:bg-secondary/80"
          onClick={onBack}
          disabled={isSaving || isMutating}
        >
          戻る
        </Button>
      </div>
    </header>
  );
};
