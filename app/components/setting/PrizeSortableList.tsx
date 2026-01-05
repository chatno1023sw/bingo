import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { FC } from "react";
import { useMemo } from "react";
import type { Prize, PrizeList } from "~/common/types";
import { PrizeSortableItem } from "~/components/setting/PrizeSortableItem";

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

  /**
   * DnD の識別子を文字列化します。
   *
   * - 副作用: ありません。
   * - 入力制約: `identifier` は UniqueIdentifier を渡してください。
   * - 戻り値: 文字列化した ID を返します。
   * - Chrome DevTools MCP ではドラッグ操作を確認します。
   */
  const toIdString = (identifier: UniqueIdentifier) => String(identifier);

  /**
   * ドラッグ終了時の並び替え処理です。
   *
   * - 副作用: `onReorder` を呼び出します。
   * - 入力制約: `active` と `over` が存在する必要があります。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では並び替え結果を確認します。
   */
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="rounded-3xl bg-card p-6 text-3xl text-muted-foreground">
          景品が登録されてないよ
        </span>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="flex w-full justify-center pt-16">
          <ul
            className="mx-auto flex w-325 flex-wrap justify-start gap-4"
            data-testid="setting-prize-list"
            id="setting-prize-list"
          >
            {prizes.map((prize) => (
              <PrizeSortableItem
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
