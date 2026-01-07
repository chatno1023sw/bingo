declare module "@radix-ui/react-select" {
  import type * as React from "react";

  type ForwardRefComponent<E extends HTMLElement, P> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<E>
  >;

  type DivProps = React.ComponentPropsWithoutRef<"div">;
  type SpanProps = React.ComponentPropsWithoutRef<"span">;
  type ButtonProps = React.ComponentPropsWithoutRef<"button">;
  type LabelProps = React.ComponentPropsWithoutRef<"label">;
  type IconProps = SpanProps & { asChild?: boolean };
  type ContentProps = DivProps & { position?: string };

  export const Root: ForwardRefComponent<HTMLDivElement, DivProps>;
  export const Group: ForwardRefComponent<HTMLDivElement, DivProps>;
  export const Value: ForwardRefComponent<HTMLSpanElement, SpanProps>;
  export const Trigger: ForwardRefComponent<HTMLButtonElement, ButtonProps>;
  export const Icon: ForwardRefComponent<HTMLSpanElement, IconProps>;
  export const Content: ForwardRefComponent<HTMLDivElement, ContentProps>;
  export const Portal: React.FC<React.PropsWithChildren<Record<string, unknown>>>;
  export const ScrollUpButton: ForwardRefComponent<HTMLButtonElement, ButtonProps>;
  export const ScrollDownButton: ForwardRefComponent<HTMLButtonElement, ButtonProps>;
  export const Viewport: ForwardRefComponent<HTMLDivElement, DivProps>;
  export const Label: ForwardRefComponent<HTMLLabelElement, LabelProps>;
  export const Item: ForwardRefComponent<HTMLDivElement, DivProps>;
  export const ItemIndicator: ForwardRefComponent<HTMLSpanElement, SpanProps>;
  export const ItemText: ForwardRefComponent<HTMLSpanElement, SpanProps>;
  export const Separator: ForwardRefComponent<HTMLDivElement, DivProps>;
}
