import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "~/lib/utils";

export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

/**
 * Slider コンポーネントです。
 *
 * - 入力制約: `value` は 0〜100 の配列で渡してください。
 * - 副作用: ありません。
 * - 戻り値: スライダーの JSX を返します。
 * - Chrome DevTools MCP ではドラッグ操作で値が更新されることを確認します。
 */
export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        props.disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-border bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </SliderPrimitive.Root>
  ),
);
Slider.displayName = "Slider";
