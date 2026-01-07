import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import type { FC } from "react";
import type { Prize } from "~/common/types";
import { Button } from "~/components/common/Button";
import { PrizeFields } from "~/components/setting/PrizeFields";
import { PrizeImagePicker } from "~/components/setting/PrizeImagePicker";
import { cn } from "~/lib/utils";

export type PrizeSortableItemProps = {
  /** 景品 ID */
  id: string;
  /** 賞名 */
  name: string;
  /** 景品名 */
  detail: string;
  /** 画像参照パス */
  imagePath: string | null;
  /** 選出フラグ */
  selected: boolean;
  /** 操作無効フラグ */
  disabled?: boolean;
  /** 削除操作 */
  onRemove?: () => void;
  /** 更新操作 */
  onUpdate?: (patch: Partial<Prize>) => void;
  /** DnD で使用する識別子 */
  dndId?: UniqueIdentifier;
};

/**
 * 設定画面の景品カード 1 件分です。
 *
 * - 副作用: 画像の保存/削除で IndexedDB を更新します。
 * - 入力制約: `id` は一意な値を渡してください。
 * - 戻り値: 景品カードの JSX を返します。
 * - Chrome DevTools MCP では画像の追加/削除を確認します。
 */
export const PrizeSortableItem: FC<PrizeSortableItemProps> = ({
  id,
  name,
  detail,
  imagePath,
  selected,
  disabled,
  onRemove,
  onUpdate,
  dndId,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dndId ?? id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative w-full max-w-75 rounded-3xl bg-card p-6 shadow-[0_12px_24px_hsl(var(--foreground)/0.16)] transition-transform duration-200 ease-out",
        isDragging ? "bg-muted" : "bg-card",
      )}
      {...attributes}
      {...listeners}
    >
      <Button
        type="button"
        variant="ghost"
        className="absolute top-2 right-2 rounded-full! bg-muted/90 px-2! hover:bg-muted/80!"
        aria-label="削除"
        onClick={onRemove}
        disabled={disabled || !onRemove}
      >
        <X className="h-6 w-6 text-muted-foreground" />
      </Button>
      <PrizeImagePicker
        id={id}
        name={name}
        imagePath={imagePath}
        disabled={disabled}
        onUpdate={onUpdate}
      />
      <PrizeFields
        name={name}
        detail={detail}
        selected={selected}
        disabled={disabled}
        onUpdate={onUpdate}
      />
    </li>
  );
};
