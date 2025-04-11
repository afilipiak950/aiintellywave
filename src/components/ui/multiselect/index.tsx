
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

  // Improved selection handler that properly toggles items
  const handleSelect = React.useCallback((value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleSelect called for value:", value);
    
    // Toggle the selection state
    const isSelected = selected.includes(value);
    const newSelected = isSelected 
      ? selected.filter(item => item !== value) 
      : [...selected, value];
    
    // Call onChange with the updated selection
    onChange(newSelected);
    
    // Ensure the dropdown stays open
    setTimeout(() => {
      setOpen(true);
    }, 10);
  }, [selected, onChange]);

  // Handler for removing a selected item
  const handleUnselect = React.useCallback((value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleUnselect", value);
    onChange(selected.filter((item) => item !== value));
  }, [selected, onChange]);

  // Handler for the trigger button click
  const handleTriggerClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  }, [open]);

  return (
    <Popover 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log("Popover onOpenChange:", newOpen);
        // Always allow opening
        if (newOpen) {
          setOpen(true);
          return;
        }
        
        // Small delay before closing to allow for clicks to process
        setTimeout(() => {
          setOpen(false);
        }, 50);
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
          // Check if the click was within the popover content
          const target = e.target as Node;
          if (!document.querySelector('.popover-content')?.contains(target)) {
            setOpen(false);
          } else {
            // Prevent closing if click was inside
            e.preventDefault();
          }
        }}
      >
        <div 
          className="popover-content"
          onClick={(e) => {
            // Critical: Stop any click events from bubbling up
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            // Critical: Stop any mouse events from bubbling up
            e.preventDefault();
            e.stopPropagation();
          }}
        >
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
