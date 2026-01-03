import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChangeEvent, FC } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Prize, PrizeList } from "~/common/types";
import { Button } from "~/components/common/Button";
import { cn } from "~/lib/utils";

export type PrizeSortableListProps = {
  prizes: PrizeList;
  disabled?: boolean;
  onReorder: (order: string[]) => void;
  onRemove?: (id: string) => void;
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
  const [localName, setLocalName] = useState(name);
  const [localDetail, setLocalDetail] = useState(detail);
  const [localImage, setLocalImage] = useState(imagePath);
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  useEffect(() => {
    setLocalDetail(detail);
  }, [detail]);

  useEffect(() => {
    setLocalImage(imagePath);
  }, [imagePath]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }
      setLocalImage(reader.result);
      onUpdate?.({ imagePath: reader.result });
    };
    reader.readAsDataURL(file);
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
        className="absolute top-3 right-4 text-foreground text-xl"
        aria-label="削除"
        onClick={onRemove}
        disabled={disabled || !onRemove}
      >
        ×
      </Button>
      <Button
        type="button"
        className="mt-4 flex h-32 w-full items-center justify-center rounded border-2 border-border bg-background text-foreground text-lg"
        onClick={handleImageClick}
        disabled={disabled}
      >
        {localImage ? (
          <img
            src={localImage}
            alt={`${name || "景品"} 画像`}
            className="h-full w-full rounded object-cover object-center"
          />
        ) : (
          "クリックで画像を追加"
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
            value={localName}
            onChange={(event) => setLocalName(event.target.value)}
            onBlur={() => {
              if (!onUpdate) {
                return;
              }
              const nextValue = localName.trim();
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
            value={localDetail}
            onChange={(event) => setLocalDetail(event.target.value)}
            onBlur={() => {
              if (!onUpdate) {
                return;
              }
              const nextValue = localDetail.trim();
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
