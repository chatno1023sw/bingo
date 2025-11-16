import type { FC } from "react";

export type StartMenuProps = {
  onStart: () => void;
  onResumeRequest: () => void;
  onNavigateSetting: () => void;
  isSubmitting?: boolean;
};

/**
 * Start 画面のメインメニュー。
 */
export const StartMenu: FC<StartMenuProps> = ({
  onStart,
  onResumeRequest,
  onNavigateSetting,
  isSubmitting = false,
}) => {
  return (
    <section className="flex flex-col items-center space-y-8 rounded-3xl bg-white/80 px-10 py-12 shadow-xl backdrop-blur">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">司会者メニュー</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Bingo Night 2025</h1>
        <p className="mt-4 max-w-md text-sm text-slate-600">
          新年会の抽選をここからスタートしましょう。「続きから」は保存済みの状態を復元します。
        </p>
      </div>

      <div className="grid w-full gap-4 md:grid-cols-3">
        <button
          type="button"
          className="rounded-2xl border border-transparent bg-gradient-to-br from-indigo-500 to-blue-500 px-6 py-4 text-lg font-semibold text-white transition hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onStart}
          disabled={isSubmitting}
        >
          はじめから
        </button>
        <button
          type="button"
          className="rounded-2xl border border-indigo-200 bg-white px-6 py-4 text-lg font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onResumeRequest}
          disabled={isSubmitting}
        >
          続きから
        </button>
        <button
          type="button"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onNavigateSetting}
          disabled={isSubmitting}
        >
          設定
        </button>
      </div>
    </section>
  );
};
