import type { FC } from "react";
import { Button } from "~/components/common/Button";

export type StartMenuProps = {
  /** 最初から開始する操作 */
  onStart: () => void;
  /** 続きから開始する操作 */
  onResumeRequest: () => void;
  /** 設定画面へ遷移する操作 */
  onNavigateSetting: () => void;
  /** 送信中フラグ */
  isSubmitting?: boolean;
  /** 続きからを表示できるかどうか */
  canResume?: boolean;
};

/**
 * Start 画面のメインメニュー。
 *
 * - ボタンは縦並びにし、モックと同じ視線移動で操作できるようにします。
 * - 余白・角丸は design/image.png を参考に最小構成へ揃えています。
 */
export const StartMenu: FC<StartMenuProps> = ({
  onStart,
  onResumeRequest,
  onNavigateSetting,
  isSubmitting = false,
  canResume = true,
}) => {
  return (
    <section className="flex flex-col items-center justify-center gap-15">
      <h1 className="text-5xl text-foreground tracking-wide">BINGOゲーム</h1>

      <div className="flex w-48 flex-col gap-4">
        <Button
          type="button"
          className="rounded-full bg-primary px-6 py-2 text-base text-primary-foreground shadow-sm hover:bg-primary/90"
          onClick={onStart}
          disabled={isSubmitting}
        >
          はじめから
        </Button>
        {canResume ? (
          <Button
            type="button"
            className="rounded-full bg-primary px-6 py-2 text-base text-primary-foreground shadow-sm hover:bg-primary/90"
            onClick={onResumeRequest}
            disabled={isSubmitting}
          >
            続きから
          </Button>
        ) : null}
        <Button
          type="button"
          className="rounded-full bg-secondary px-6 py-2 text-base text-secondary-foreground shadow-sm hover:bg-secondary/80"
          onClick={onNavigateSetting}
          disabled={isSubmitting}
        >
          設定
        </Button>
      </div>
    </section>
  );
};
