
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
  // Handle selection with enhanced event prevention
  const handleSelect = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add console log for debugging
    console.log(`MultiSelectItem: clicked item ${value}, current state: ${isSelected}`);
    
    // Call the onSelect handler with the value and event
    onSelect(value, e);
  }, [onSelect, value, isSelected]);

  // Separate handler for checkbox click to ensure it works properly
  const handleCheckboxClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`MultiSelectItem: checkbox clicked for ${value}`);
    onSelect(value, e);
  }, [onSelect, value]);

  return (
    <CommandItem
      key={value}
      value={value}
      onSelect={() => {}} // Disable default selection behavior
      className={cn(
        "flex items-center gap-2 cursor-pointer px-2 py-1.5 hover:bg-accent",
        isSelected && "bg-accent/50"
      )}
      onClick={handleSelect}
    >
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible"
        )}
        onClick={handleCheckboxClick}
      >
        <Check className="h-3 w-3" />
      </div>
      <span>{label}</span>
    </CommandItem>
  );
};
