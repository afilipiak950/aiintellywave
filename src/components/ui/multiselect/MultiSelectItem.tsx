
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
  // Completely redesigned click handler to ensure all clicks work
  const handleSelect = React.useCallback((e: React.MouseEvent) => {
    // Stop propagation to prevent closing the dropdown
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`MultiSelectItem: clicked on item ${value}, selected=${isSelected}`);
    
    // Call the parent's onSelect function
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
      // Attach click handler directly to CommandItem
      onClick={handleSelect}
      // Add additional event handlers to make sure nothing is stopping propagation
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSelect(e);
        }}
      >
        <Check className="h-3 w-3" />
      </div>
      <span>{label}</span>
    </CommandItem>
  );
};
