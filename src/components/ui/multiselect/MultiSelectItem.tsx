
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
  // Improved click handler with better event handling
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    // Prevent default behaviors and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`MultiSelectItem: Click on item ${value}, current state=${isSelected}`);
    
    // Call the select handler with the value and event
    onSelect(value, e);
  }, [onSelect, value, isSelected]);

  return (
    <CommandItem
      key={value}
      value={value}
      className={cn(
        "flex items-center gap-2 cursor-pointer px-2 py-1.5 hover:bg-accent",
        isSelected && "bg-accent/50"
      )}
      onSelect={(currentValue) => {
        console.log(`MultiSelectItem: onSelect triggered for ${currentValue}`);
      }}
      onClick={handleClick}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
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
