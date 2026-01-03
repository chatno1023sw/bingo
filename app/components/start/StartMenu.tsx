import type { FC } from "react";
import { Button } from "~/components/common/Button";

export type StartMenuProps = {
  onStart: () => void;
  onResumeRequest: () => void;
  onNavigateSetting: () => void;
  isSubmitting?: boolean;
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
      <h1 className="font-semibold text-5xl text-foreground tracking-wide">BINGOゲーム</h1>

      <div className="flex w-48 flex-col gap-4">
        <Button
          type="button"
          className="rounded-full bg-primary px-6 py-2 font-semibold text-base text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onStart}
          disabled={isSubmitting}
        >
          はじめから
        </Button>
        {canResume ? (
          <Button
            type="button"
            className="rounded-full bg-secondary px-6 py-2 font-semibold text-base text-secondary-foreground shadow-sm transition hover:bg-secondary/80 focus:outline-none focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onResumeRequest}
            disabled={isSubmitting}
          >
            続きから
          </Button>
        ) : null}
        <Button
          type="button"
          className="rounded-full bg-secondary px-6 py-2 font-semibold text-base text-secondary-foreground shadow-sm transition hover:bg-secondary/80 focus:outline-none focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onNavigateSetting}
          disabled={isSubmitting}
        >
          設定
        </Button>
      </div>
    </section>
  );
};
