
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
  // Simplified click handler that focuses on reliable selection
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    // Prevent default behaviors
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
      onClick={handleClick}
      // Critical: Prevent all mouse events from bubbling up
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
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
