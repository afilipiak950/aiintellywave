
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SelectedBadge } from "./SelectedBadge";
import { MultiSelectOption } from "./types";

type MultiSelectTriggerProps = {
  selected: string[];
  options: MultiSelectOption[];
  placeholder: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onUnselect: (value: string, e: React.MouseEvent) => void;
  onTriggerClick: (e: React.MouseEvent) => void;
  open: boolean;
};

export const MultiSelectTrigger = ({
  selected,
  options,
  placeholder,
  className,
  disabled = false,
  isLoading = false,
  onUnselect,
  onTriggerClick,
  open
}: MultiSelectTriggerProps) => {
  // Verhindere Ereignispropagation für alle Ereignistypen
  const stopPropagation = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn("min-h-10 h-auto py-2", className)}
      disabled={disabled || isLoading}
      onClick={(e) => {
        stopPropagation(e);
        onTriggerClick(e);
      }}
      onMouseDown={stopPropagation}
    >
      <div className="flex gap-1 flex-wrap">
        {selected.length === 0 && placeholder}
        {selected.map((value) => (
          <SelectedBadge 
            key={value}
            value={value} 
            options={options} 
            onRemove={onUnselect} 
          />
        ))}
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
    </Button>
  );
};
