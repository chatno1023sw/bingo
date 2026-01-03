import type { FC } from "react";
import type { Prize } from "~/common/types";

export type PrizeFieldsProps = {
  /** 賞名 */
  name: string;
  /** 賞品名 */
  detail: string;
  /** 選出フラグ */
  selected: boolean;
  /** 操作無効フラグ */
  disabled?: boolean;
  /** 更新操作 */
  onUpdate?: (patch: Partial<Prize>) => void;
};

/**
 * 景品カードの入力フィールド群です。
 *
 * - 副作用: 入力変更時に `onUpdate` を呼び出します。
 * - 入力制約: `name` と `detail` は文字列を渡してください。
 * - 戻り値: 入力欄の JSX を返します。
 * - Chrome DevTools MCP では入力反映を確認します。
 */
export const PrizeFields: FC<PrizeFieldsProps> = ({
  name,
  detail,
  selected,
  disabled,
  onUpdate,
}) => {
  return (
    <div className="mt-5 space-y-3 text-foreground text-sm">
      <label className="flex items-center gap-3">
        <span className="w-20">賞名</span>
        <input
          className="h-8 w-full rounded border border-input bg-background px-2 text-foreground text-sm"
          value={name}
          onChange={(event) => {
            const nextValue = event.target.value;
            onUpdate?.({ prizeName: nextValue });
          }}
          onBlur={() => {
            if (!onUpdate) {
              return;
            }
            const nextValue = name.trim();
            if (nextValue !== name) {
              onUpdate({ prizeName: nextValue });
            }
          }}
          placeholder="賞名を入力"
          disabled={disabled}
        />
      </label>
      <label className="flex items-center gap-3">
        <span className="w-20">賞品名</span>
        <input
          className="h-8 w-full rounded border border-input bg-background px-2 text-foreground text-sm"
          value={detail}
          onChange={(event) => {
            const nextValue = event.target.value;
            onUpdate?.({ itemName: nextValue });
          }}
          onBlur={() => {
            if (!onUpdate) {
              return;
            }
            const nextValue = detail.trim();
            if (nextValue !== detail) {
              onUpdate({ itemName: nextValue });
            }
          }}
          placeholder="賞品名を入力"
          disabled={disabled}
        />
      </label>
      <label className="flex items-center gap-3">
        <span className="w-20">選出</span>
        <select
          className="h-8 w-full rounded border border-input bg-background px-2 text-foreground text-sm"
          value={selected ? "selected" : "unselected"}
          onChange={(event) => {
            const nextSelected = event.target.value === "selected";
            if (onUpdate) {
              onUpdate({ selected: nextSelected });
            }
          }}
          disabled={disabled}
        >
          <option value="unselected">未選出</option>
          <option value="selected">選出</option>
        </select>
      </label>
    </div>
  );
};
