declare module "@radix-ui/react-slider" {
  import type * as React from "react";

  type SliderProps = React.ComponentPropsWithoutRef<"span"> & {
    value?: number[];
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onValueChange?: (value: number[]) => void;
  };

  type SliderPartProps = React.ComponentPropsWithoutRef<"span">;

  export const Root: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<SliderProps> & React.RefAttributes<HTMLSpanElement>
  >;
  export const Track: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<SliderPartProps> & React.RefAttributes<HTMLSpanElement>
  >;
  export const Range: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<SliderPartProps> & React.RefAttributes<HTMLSpanElement>
  >;
  export const Thumb: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<SliderPartProps> & React.RefAttributes<HTMLSpanElement>
  >;
}
