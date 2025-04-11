
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

  // Handle item selection without closing the popover
  const handleSelect = React.useCallback((value: string, e: React.MouseEvent) => {
    // Stop propagation at all costs to prevent modal from closing
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleSelect called for value:", value);
    console.log("MultiSelect: current selected state:", selected);
    
    // Toggle the selection status
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    
    console.log("MultiSelect: new selected state:", newSelected);
    
    // Call the onChange handler with the updated selection
    onChange(newSelected);
    
    // Specifically force the popover to stay open
    setTimeout(() => {
      setOpen(true);
    }, 0);
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

  // Handle clicks on the popover content
  const handlePopoverContentClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle escape key - properly typed to match Radix UI Popover's expected event handler
  const handleEscapeKey = React.useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // Handle outside pointer down
  const handlePointerDownOutside = React.useCallback((e: Event) => {
    // Only close on intentional outside clicks, not on item selection
    const target = e.target as Node;
    const isOutsideClick = !document.querySelector('.popover-content')?.contains(target);
    if (isOutsideClick) {
      setOpen(false);
    }
    e.preventDefault();
  }, []);

  return (
    <Popover 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log("MultiSelect: onOpenChange", newOpen);
        if (newOpen) {
          // Always allow opening
          setOpen(true);
        } else {
          // For closing, we'll handle this more carefully
          // Only close if it's an intentional outside click, 
          // which we handle in handlePointerDownOutside
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
        className="p-0 w-[300px] z-50 bg-white popover-content" 
        sideOffset={4}
        align="start"
        onClick={handlePopoverContentClick}
        onEscapeKeyDown={handleEscapeKey}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={(e) => {
          // Prevent interaction outside from closing the popover during selection
          e.preventDefault();
        }}
        forceMount
      >
        <MultiSelectContent
          options={options}
          selected={selected}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          onItemSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
