import type { FC } from "react";
import type { DrawHistoryEntry } from "~/common/types";

export type HistoryPanelProps = {
  recent: DrawHistoryEntry[];
  onOpenModal: () => void;
};

/**
 * 左ペインの直近履歴表示。
 */
export const HistoryPanel: FC<HistoryPanelProps> = ({ recent, onOpenModal }) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">直近の当選番号</h2>
          <p className="text-sm text-slate-400">最新 10 件を新しい順に表示</p>
        </div>
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200">
          {recent.length}件
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {recent.length === 0 && (
          <li className="text-sm text-slate-400">まだ抽選結果がありません</li>
        )}
        {recent.map((entry) => (
          <li
            key={entry.sequence}
            className="flex items-center justify-between rounded-2xl bg-slate-800/60 px-4 py-3"
          >
            <div>
              <p className="text-2xl font-bold text-indigo-100">{entry.number}</p>
              <p className="text-xs text-slate-400">抽選 #{entry.sequence}</p>
            </div>
            <span className="text-xs text-slate-500">{entry.drawnAt}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-6 w-full rounded-2xl border border-indigo-300/50 px-4 py-3 text-sm font-semibold text-indigo-100 transition hover:border-indigo-200 hover:text-white"
        onClick={onOpenModal}
      >
        これまでの当選番号を見る
      </button>
    </section>
  );
};
