
import * as React from "react";
import { Check } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type MultiSelectItemProps = {
  value: string;
  label: string;
  isSelected: boolean;
  onSelect: (value: string, e: React.MouseEvent) => void;
};

export const MultiSelectItem = ({
  value,
  label,
  isSelected,
  onSelect
}: MultiSelectItemProps) => {
  // Handle clicks and prevent propagation
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(value, e);
  }, [onSelect, value]);

  return (
    <CommandItem
      key={value}
      value={value}
      onSelect={() => false} // Disable default selection
      disabled={false}
      className="cursor-pointer"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        className={cn(
          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible"
        )}
      >
        <Check className="h-3 w-3" />
      </div>
      <span>{label}</span>
    </CommandItem>
  );
};
