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
      <h1 className="text-5xl font-semibold tracking-wide text-slate-900">BINGOゲーム</h1>

      <div className="flex w-48 flex-col gap-4">
        <Button
          type="button"
          className="rounded-full bg-[#0F6A86] px-6 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-[#0d5870] focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onStart}
          disabled={isSubmitting}
        >
          はじめから
        </Button>
        {canResume ? (
          <Button
            type="button"
            className="rounded-full bg-[#114d63] px-6 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-[#0d3e50] focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onResumeRequest}
            disabled={isSubmitting}
          >
            続きから
          </Button>
        ) : null}
        <Button
          type="button"
          className="rounded-full bg-[#114d63] px-6 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-[#0d3e50] focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onNavigateSetting}
          disabled={isSubmitting}
        >
          設定
        </Button>
      </div>
    </section>
  );
};
