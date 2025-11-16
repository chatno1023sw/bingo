import type { FC } from "react";
import type { DrawHistoryEntry } from "~/common/types";

export type HistoryModalProps = {
  open: boolean;
  entries: DrawHistoryEntry[];
  onClose: () => void;
};

export const HistoryModal: FC<HistoryModalProps> = ({ open, entries, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-950 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">当選履歴</h3>
            <p className="text-sm text-slate-400">全 {entries.length} 件</p>
          </div>
          <button
            type="button"
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
        <div className="mt-6 max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="py-2">#</th>
                <th className="py-2">番号</th>
                <th className="py-2">抽選日時</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.sequence} className="border-t border-slate-800 text-slate-100">
                  <td className="py-2 text-xs text-slate-400">{entry.sequence}</td>
                  <td className="py-2 text-lg font-semibold">{entry.number}</td>
                  <td className="py-2 text-xs text-slate-400">{entry.drawnAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
