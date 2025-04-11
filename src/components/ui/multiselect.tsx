import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export type MultiSelectProps = {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
};

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

  // Enhanced propagation prevention for all event types
  const stopPropagation = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle item selection without closing the popover
  const handleSelect = React.useCallback((value: string, e: React.MouseEvent) => {
    // Stop propagation at all costs to prevent modal from closing
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleSelect", value);
    
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    
    onChange(newSelected);
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

  // Handle escape key specifically - update the type to match React.KeyboardEvent
  const handleEscapeKey = React.useCallback((event: React.KeyboardEvent) => {
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
        setOpen(newOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("min-h-10 h-auto py-2", className)}
          disabled={disabled || isLoading}
          onClick={handleTriggerClick}
          onMouseDown={stopPropagation}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length === 0 && placeholder}
            {selected.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <Badge
                  key={value}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 mr-1 mb-1"
                >
                  {option?.label || value}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={stopPropagation}
                    onClick={(e) => handleUnselect(value, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[300px] z-50 bg-white" 
        sideOffset={4}
        align="start"
        onClick={handlePopoverContentClick}
        onEscapeKeyDown={handleEscapeKey}
        onPointerDownOutside={handlePointerDownOutside}
      >
        <Command 
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          className="popover-content"
        >
          <CommandInput 
            placeholder="Search..." 
            onKeyDown={(e) => {
              // Prevent Enter key from submitting forms
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }} 
            className="border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => false} // Disable default selection
                    disabled={false}
                    className="cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => handleSelect(option.value, e)}
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
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
