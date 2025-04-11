
import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { MultiSelectContent } from "./MultiSelectContent";
import { MultiSelectTrigger } from "./MultiSelectTrigger";
import { MultiSelectOption, MultiSelectProps } from "./types";

export type { MultiSelectProps } from "./types";

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  emptyMessage = "No options available",
  className,
  disabled = false,
  isLoading = false
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Enhanced item selection handler
  const handleSelect = React.useCallback((value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleSelect called for value:", value);
    
    // Toggle the selection status
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    
    // Call onChange with the updated selection
    onChange(newSelected);
    
    // Keep the popover open
    setOpen(true);
  }, [selected, onChange]);

  // Handle removing a selected item
  const handleUnselect = React.useCallback((value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleUnselect", value);
    onChange(selected.filter((item) => item !== value));
  }, [selected, onChange]);

  // Handle the trigger button click
  const handleTriggerClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  }, [open]);

  return (
    <Popover 
      open={open} 
      onOpenChange={(newOpen) => {
        // The dropdown should always be allowed to open
        if (newOpen) {
          setOpen(true);
        } else {
          // Only close when clicking outside or when specifically closed
          setOpen(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <MultiSelectTrigger
          selected={selected}
          options={options}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          isLoading={isLoading}
          onUnselect={handleUnselect}
          onTriggerClick={handleTriggerClick}
          open={open}
        />
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[300px] z-50 bg-white" 
        sideOffset={4}
        align="start"
        forceMount
        onEscapeKeyDown={() => setOpen(false)}
        onPointerDownOutside={(e) => {
          const target = e.target as Node;
          if (!document.querySelector('.popover-content')?.contains(target)) {
            setOpen(false);
          }
        }}
      >
        <div className="popover-content" onClick={(e) => e.stopPropagation()}>
          <MultiSelectContent
            options={options}
            selected={selected}
            emptyMessage={emptyMessage}
            isLoading={isLoading}
            onItemSelect={handleSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
