import { useMemo } from "react";
import type { FC } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PrizeList } from "~/common/types";

export type PrizeSortableListProps = {
  prizes: PrizeList;
  disabled?: boolean;
  onReorder: (order: string[]) => void;
};

const SortableItem: FC<{
  id: string;
  name: string;
  detail: string;
  order: number;
  disabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}> = ({ id, name, detail, order, disabled, onMoveDown, onMoveUp }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[auto,1fr,auto] items-center gap-4 rounded-2xl border px-4 py-3 ${isDragging ? "border-indigo-500 bg-slate-800/80" : "border-slate-800 bg-slate-800/50"}`}
    >
      <button
        type="button"
        className="rounded-2xl border border-slate-600 px-3 py-2 text-xs text-slate-300"
        {...listeners}
        {...attributes}
      >
        Drag
      </button>
      <div>
        <p className="text-base font-semibold text-white">{name}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="rounded-2xl border border-slate-600 px-2 py-1 text-xs text-slate-200"
          onClick={onMoveUp}
          disabled={disabled || order === 0}
        >
          上へ移動
        </button>
        <button
          type="button"
          className="rounded-2xl border border-slate-600 px-2 py-1 text-xs text-slate-200"
          onClick={onMoveDown}
          disabled={disabled}
        >
          下へ移動
        </button>
      </div>
    </li>
  );
};

export const PrizeSortableList: FC<PrizeSortableListProps> = ({ prizes, disabled = false, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const ids = useMemo(() => prizes.map((prize) => prize.id), [prizes]);

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    if (!event.over || event.active.id === event.over.id) {
      return;
    }
    const oldIndex = ids.indexOf(event.active.id);
    const newIndex = ids.indexOf(event.over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    const nextOrder = arrayMove(ids, oldIndex, newIndex);
    onReorder(nextOrder);
  };

  const moveBy = (id: string, delta: number) => {
    const index = ids.indexOf(id);
    const target = index + delta;
    if (index === -1 || target < 0 || target >= ids.length) {
      return;
    }
    const nextOrder = arrayMove(ids, index, target);
    onReorder(nextOrder);
  };

  if (prizes.length === 0) {
    return <p className="text-sm text-slate-400">景品が登録されていません。</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3" data-testid="setting-prize-list">
          {prizes.map((prize, index) => (
            <SortableItem
              key={prize.id}
              id={prize.id}
              name={prize.prizeName}
              detail={prize.itemName}
              order={index}
              disabled={disabled}
              onMoveUp={() => moveBy(prize.id, -1)}
              onMoveDown={() => moveBy(prize.id, 1)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
