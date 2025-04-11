
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

  // Ensure this function doesn't propagate the event
  const handleUnselect = (value: string, e: React.MouseEvent) => {
    // Always prevent default and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    onChange(selected.filter((item) => item !== value));
  };

  // Create a more robust select handler
  const handleSelect = (value: string) => {
    // Create a new array with or without the value based on its current inclusion state
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    
    // Pass the updated selection to the parent component
    onChange(newSelected);
    
    // Explicitly do NOT close the popover
    return false;
  };

  // Make sure the dropdown doesn't close when clicking inside the content
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  // Prevent event propagation when clicking inside the dropdown content
  const handleContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Enhanced item selection handler with strong event protection
  const handleItemSelect = (value: string, e: React.MouseEvent) => {
    // Ensure the event doesn't bubble up
    e.preventDefault();
    e.stopPropagation();
    
    handleSelect(value);
    return false; // Prevent closing
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("min-h-10 h-auto py-2", className)}
          disabled={disabled || isLoading}
          onClick={(e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            setOpen(!open);
          }}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        handleUnselect(value, e as unknown as React.MouseEvent);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      handleUnselect(value, e);
                    }}
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
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside but still within the modal
          e.preventDefault();
        }}
        onClick={handleContentClick}
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      // Don't use this built-in handler, use our custom one instead
                      return false; // Always prevent default closing
                    }}
                    className="cursor-pointer"
                    onPointerDown={(e) => {
                      // Prevent closing when clicking on an item
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      handleItemSelect(option.value, e);
                    }}
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
