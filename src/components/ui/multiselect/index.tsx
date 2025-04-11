
import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MultiSelectOption, MultiSelectProps } from "./types";

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
  const [searchValue, setSearchValue] = React.useState("");
  
  // Handle selection toggle with improved logging and reliability
  const handleSelect = React.useCallback((value: string) => {
    console.log("MultiSelect: toggling selection for", value);
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    
    onChange(newSelected);
    
    // Force the dropdown to stay open after selection
    setTimeout(() => {
      setOpen(true);
    }, 0);
  }, [selected, onChange]);

  // Handle removing a selected item
  const handleRemove = React.useCallback((value: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("MultiSelect: removing", value);
    onChange(selected.filter(item => item !== value));
  }, [selected, onChange]);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue.trim()) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  // Create a reference for the button
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const popoverContentRef = React.useRef<HTMLDivElement>(null);
  
  // Super aggressive event propagation prevention for all events
  const stopPropagation = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle trigger button click with explicit state management
  const handleTriggerClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  }, [open]);

  return (
    <Popover 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log("MultiSelect: onOpenChange called with", newOpen);
        setOpen(newOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-10 h-auto py-2", className)}
          disabled={disabled || isLoading}
          onClick={handleTriggerClick}
        >
          <div className="flex flex-wrap gap-1 max-w-[90%]">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((value) => {
              const option = options.find(opt => opt.value === value);
              return (
                <Badge
                  key={value}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 mr-1 mb-1 flex items-center gap-1"
                >
                  {option?.label || value}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => handleRemove(value, e)}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverContentRef}
        className="p-0 w-[300px]"
        align="start"
        sideOffset={4}
        style={{ 
          zIndex: 9999,  // Very high z-index to ensure visibility
          background: "white",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
        }}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onPointerDown={stopPropagation}
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking inside the dropdown
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-popper-content-wrapper]') || 
              popoverContentRef.current?.contains(target)) {
            e.preventDefault();
          }
        }}
      >
        <Command 
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          className="w-full"
        >
          <CommandInput 
            placeholder="Search..." 
            className="border-none focus:ring-0"
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setOpen(false);
              }
            }}
          />
          <CommandList>
            <ScrollArea className="h-72 max-h-[300px] overflow-auto">
              <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
              <CommandGroup className="overflow-visible">
                {filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer flex items-center gap-2 px-2 py-1.5 hover:bg-accent"
                      onSelect={(currentValue) => {
                        console.log("CommandItem: onSelect called with", currentValue);
                        handleSelect(option.value);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(option.value);
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
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type { MultiSelectProps, MultiSelectOption } from "./types";
