
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
  // Handle selection with better propagation prevention
  const handleSelect = React.useCallback((e: React.MouseEvent) => {
    console.log("MultiSelectItem: handleSelect called for", label);
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent default behavior to avoid closing popover
    onSelect(value, e);
    
    // Return false to prevent Command's onSelect
    return false;
  }, [onSelect, value, label]);

  return (
    <CommandItem
      key={value}
      value={value}
      onSelect={() => {
        console.log("CommandItem onSelect called - should be prevented");
        return false;
      }}
      disabled={false}
      className="cursor-pointer"
      onMouseDown={(e) => {
        // Critical for preventing popover close
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={handleSelect}
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
