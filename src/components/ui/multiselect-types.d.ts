
import { ComponentPropsWithoutRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

declare module "@radix-ui/react-popover" {
  interface PopoverContentProps extends ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onPointerDownOutside?: (event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent) => void;
    onFocusOutside?: (event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent) => void;
    onInteractOutside?: (event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent) => void;
  }
}
