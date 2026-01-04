import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "~/lib/utils";

/**
 * Select ルートコンポーネントです。
 *
 * - 入力制約: 子要素に SelectTrigger/SelectContent を配置してください。
 * - 副作用: ありません。
 * - 戻り値: Select ルート要素を返します。
 * - Chrome DevTools MCP では選択値の更新を確認します。
 */
export const Select = SelectPrimitive.Root;

/**
 * Select のグループコンポーネントです。
 *
 * - 入力制約: SelectContent 内で使用してください。
 * - 副作用: ありません。
 * - 戻り値: Select のグループ要素を返します。
 * - Chrome DevTools MCP ではグループの表示を確認します。
 */
export const SelectGroup = SelectPrimitive.Group;

/**
 * Select の表示値コンポーネントです。
 *
 * - 入力制約: SelectTrigger の子として配置してください。
 * - 副作用: ありません。
 * - 戻り値: 現在の選択値を表示する要素を返します。
 * - Chrome DevTools MCP では値の表示更新を確認します。
 */
export const SelectValue = SelectPrimitive.Value;

/**
 * Select のトリガーコンポーネントです。
 *
 * - 入力制約: Select 直下に配置してください。
 * - 副作用: ありません。
 * - 戻り値: ドロップダウンを開閉するボタンを返します。
 * - Chrome DevTools MCP ではクリックで開閉することを確認します。
 */
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

/**
 * Select のコンテンツコンポーネントです。
 *
 * - 入力制約: Select と同じツリー内に配置してください。
 * - 副作用: Portal を介して描画します。
 * - 戻り値: ドロップダウンの内容を返します。
 * - Chrome DevTools MCP では選択肢の表示を確認します。
 */
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-32 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in",
          position === "popper" &&
            "data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
          <ChevronUp className="h-4 w-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
          <ChevronDown className="h-4 w-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = "SelectContent";

/**
 * Select のラベルコンポーネントです。
 *
 * - 入力制約: SelectContent 内で使用してください。
 * - 副作用: ありません。
 * - 戻り値: ラベル要素を返します。
 * - Chrome DevTools MCP ではラベル表示を確認します。
 */
export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn("px-2 py-1.5 font-semibold text-sm", className)}
      {...props}
    />
  );
});
SelectLabel.displayName = "SelectLabel";

/**
 * Select のアイテムコンポーネントです。
 *
 * - 入力制約: SelectContent 内で使用してください。
 * - 副作用: ありません。
 * - 戻り値: 選択可能な項目を返します。
 * - Chrome DevTools MCP では項目選択を確認します。
 */
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = "SelectItem";

/**
 * Select のセパレーターコンポーネントです。
 *
 * - 入力制約: SelectContent 内で使用してください。
 * - 副作用: ありません。
 * - 戻り値: 区切り線を返します。
 * - Chrome DevTools MCP では区切り線の表示を確認します。
 */
export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
});
SelectSeparator.displayName = "SelectSeparator";
