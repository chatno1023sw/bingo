import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Image, ImageIcon, X } from "lucide-react";
import type { ChangeEvent, FC } from "react";
import { useId, useMemo, useRef } from "react";
import { useStoredImage } from "~/common/hooks/useStoredImage";
import type { Prize, PrizeList } from "~/common/types";
import { buildPrizeImagePath, deletePrizeImage, savePrizeImage } from "~/common/utils/imageStorage";
import { Button } from "~/components/common/Button";
import { cn } from "~/lib/utils";

export type PrizeSortableListProps = {
  /** 表示する景品一覧 */
  prizes: PrizeList;
  /** 操作無効フラグ */
  disabled?: boolean;
  /** 並び替え後の順序を通知するコールバック */
  onReorder: (order: string[]) => void;
  /** 削除操作のコールバック */
  onRemove?: (id: string) => void;
  /** 更新操作のコールバック */
  onUpdate?: (id: string, patch: Partial<Prize>) => void;
};

const SortableItem: FC<{
  id: string;
  name: string;
  detail: string;
  imagePath: string | null;
  selected: boolean;
  disabled?: boolean;
  onRemove?: () => void;
  onUpdate?: (patch: Partial<Prize>) => void;
}> = ({ id, name, detail, imagePath, selected, disabled, onRemove, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resolvedImagePath = useStoredImage(imagePath);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      return;
    }
    void savePrizeImage(id, file)
      .then(() => {
        onUpdate?.({ imagePath: buildPrizeImagePath(id) });
      })
      .catch(() => {
        /* IndexedDB 保存エラー時は表示更新を行いません */
      });
  };

  const handleImageDelete = () => {
    if (!imagePath) {
      return;
    }
    void deletePrizeImage(id)
      .then(() => {
        onUpdate?.({ imagePath: null });
      })
      .catch(() => {
        /* IndexedDB 削除エラー時は表示更新を行いません */
      });
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
      <Button
        type="button"
        className={cn(
          "flex h-32 w-full items-center justify-center rounded bg-background! p-0! text-foreground text-lg",
          resolvedImagePath || "border-2 border-border",
        )}
        onClick={handleImageClick}
        disabled={disabled}
      >
        {resolvedImagePath ? (
          <>
            <img
              src={resolvedImagePath}
              alt={`${name || "景品"} 画像`}
              className="h-32 w-64.5 rounded object-cover object-center"
            />
            <Button
              type="button"
              className="absolute top-28 right-8 z-60 h-8! bg-secondary px-2! py-1! text-xs"
              onClick={handleImageDelete}
              disabled={disabled || !imagePath}
            >
              <div className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span>削除</span>
              </div>
            </Button>
          </>
        ) : (
          <div className="flex h-32 w-64.5 flex-col items-center gap-1 pt-2 text-muted-foreground">
            <Image className="h-20 w-20 text-muted-foreground" />
            <span>クリックで画像を追加</span>
          </div>
        )}
      </Button>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleImageChange}
        disabled={disabled}
      />
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
    </li>
  );
};

/**
 * 設定画面で賞品カードを並べ替え・編集するリストです。
 *
 * - 副作用: ドラッグ操作で順序が変わった際に `onReorder` を呼び出します。
 * - 入力制約: `prizes` は `id` が一意であることを前提にします。
 * - 戻り値: 景品カード一覧の UI を描画します。
 * - Chrome DevTools MCP: ドラッグ操作と画像追加が反映されることを確認します。
 */
export const PrizeSortableList: FC<PrizeSortableListProps> = ({
  prizes,
  disabled = false,
  onReorder,
  onRemove,
  onUpdate,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const ids = useMemo(() => prizes.map((prize) => prize.id), [prizes]);

  const toIdString = (identifier: UniqueIdentifier) => String(identifier);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      return;
    }
    const activeId = toIdString(active.id);
    const overId = toIdString(over.id);
    if (activeId === overId) {
      return;
    }
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    const nextOrder = arrayMove(ids, oldIndex, newIndex);
    onReorder(nextOrder);
  };

  if (prizes.length === 0) {
    return (
      <div className="rounded-3xl bg-card p-6 text-muted-foreground text-sm">
        景品が登録されていません。
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="flex w-full justify-center">
          <ul
            className="mx-auto flex w-325 flex-wrap justify-start gap-4"
            data-testid="setting-prize-list"
            id="setting-prize-list"
          >
            {prizes.map((prize) => (
              <SortableItem
                key={prize.id}
                id={prize.id}
                name={prize.prizeName}
                detail={prize.itemName}
                imagePath={prize.imagePath}
                selected={prize.selected}
                disabled={disabled}
                onRemove={() => onRemove?.(prize.id)}
                onUpdate={(patch) => onUpdate?.(prize.id, patch)}
              />
            ))}
          </ul>
        </div>
      </SortableContext>
    </DndContext>
  );
};
