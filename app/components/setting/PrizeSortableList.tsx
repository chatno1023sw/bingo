import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Prize, PrizeList } from "~/common/types";

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
	order: number;
	disabled?: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onRemove?: () => void;
	onUpdate?: (patch: Partial<Prize>) => void;
}> = ({
	id,
	name,
	detail,
	imagePath,
	selected,
	order,
	disabled,
	onMoveDown,
	onMoveUp,
	onRemove,
	onUpdate,
}) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	const [localName, setLocalName] = useState(name);
	const [localDetail, setLocalDetail] = useState(detail);

	useEffect(() => {
		setLocalName(name);
	}, [name]);

	useEffect(() => {
		setLocalDetail(detail);
	}, [detail]);

	return (
		<li
			ref={setNodeRef}
			style={style}
			className={`grid grid-cols-[110px,150px,1fr,110px,32px] items-center gap-3 px-3 py-2 text-[11px] ${
				isDragging ? "bg-slate-50" : "bg-white"
			}`}
		>
			<div className="flex items-center gap-2">
				<button
					type="button"
					className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-500"
					{...listeners}
					{...attributes}
				>
					::
				</button>
				<input
					className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700"
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
			</div>
			<div className="flex items-center gap-2">
				<div className="flex h-9 w-12 items-center justify-center rounded border border-slate-300 bg-slate-100">
					{imagePath ? (
						<img
							src={imagePath}
							alt={`${name} 画像`}
							className="h-full w-full rounded object-cover"
						/>
					) : (
						<span className="text-[10px] text-slate-400">img</span>
					)}
				</div>
				<button
					type="button"
					className="h-8 rounded border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-600"
					disabled={disabled}
				>
					アップロード
				</button>
			</div>
			<input
				className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700"
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
			<select
				className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700"
				value={selected ? "selected" : "unselected"}
				onChange={(event) => {
					const nextSelected = event.target.value === "selected";
					if (onUpdate) {
						onUpdate({ selected: nextSelected });
					}
				}}
				disabled={disabled}
			>
				<option value="unselected">未抽選</option>
				<option value="selected">抽選済み</option>
			</select>
			<div className="flex items-center justify-end">
				<button
					type="button"
					className="sr-only"
					onClick={onMoveUp}
					disabled={disabled || order === 0}
				>
					上へ移動
				</button>
				<button type="button" className="sr-only" onClick={onMoveDown} disabled={disabled}>
					下へ移動
				</button>
				<button
					type="button"
					className="flex h-6 w-6 items-center justify-center text-rose-500"
					aria-label="削除"
					onClick={onRemove}
					disabled={disabled || !onRemove}
				>
					<svg
						viewBox="0 0 24 24"
						aria-hidden="true"
						className="h-4 w-4"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M3 6h18" />
						<path d="M8 6V4h8v2" />
						<path d="M6 6l1 14h10l1-14" />
					</svg>
				</button>
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
		return (
			<div className="overflow-x-auto">
				<div className="min-w-[720px] border-x border-slate-300">
					<div className="grid grid-cols-[110px,150px,1fr,110px,32px] items-center gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
						<span>賞名</span>
						<span>画像</span>
						<span>賞品名</span>
						<span>当選済みか</span>
						<span className="sr-only">操作</span>
					</div>
					<p className="px-4 py-6 text-sm text-slate-500">景品が登録されていません。</p>
				</div>
			</div>
		);
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				<div className="overflow-x-auto">
					<div className="min-w-[720px] border-x border-slate-300">
						<div className="grid grid-cols-[110px,150px,1fr,110px,32px] items-center gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
							<span>賞名</span>
							<span>画像</span>
							<span>賞品名</span>
							<span>当選済みか</span>
							<span className="sr-only">操作</span>
						</div>
						<ul
							className="divide-y divide-slate-200"
							data-testid="setting-prize-list"
							id="setting-prize-list"
						>
							{prizes.map((prize, index) => (
								<SortableItem
									key={prize.id}
									id={prize.id}
									name={prize.prizeName}
									detail={prize.itemName}
									imagePath={prize.imagePath}
									selected={prize.selected}
									order={index}
									disabled={disabled}
									onMoveUp={() => moveBy(prize.id, -1)}
									onMoveDown={() => moveBy(prize.id, 1)}
									onRemove={() => onRemove?.(prize.id)}
									onUpdate={(patch) => onUpdate?.(prize.id, patch)}
								/>
							))}
						</ul>
					</div>
				</div>
			</SortableContext>
		</DndContext>
	);
};
