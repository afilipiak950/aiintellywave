
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
  // Vollständig überarbeiteter Klick-Handler mit garantierter Funktion
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    // Verhindere Event-Bubbling, um das Schließen des Dropdowns zu verhindern
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`MultiSelectItem: Klick auf Element ${value}, ausgewählt=${isSelected}`);
    
    // Rufe die onSelect-Funktion des übergeordneten Elements auf
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
