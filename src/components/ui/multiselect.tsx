
import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  emptyMessage = "No options found.",
  isLoading = false,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // This is a fix for when selected contains values that are not in the options
  const validSelected = selected.filter(value => 
    options.some(option => option.value === value)
  );

  const handleUnselect = (item: string) => {
    onChange(validSelected.filter((i) => i !== item));
  };

  // Handle click events to prevent propagation
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Fix for keyboard and mouse events to prevent modal closing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Create a universal event handler for all event types
  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              disabled && "cursor-not-allowed opacity-50",
              !disabled && "cursor-pointer"
            )}
            onClick={!disabled ? () => setOpen(!open) : undefined}
          >
            <div className="flex flex-wrap gap-1">
              {validSelected.length > 0 ? (
                validSelected.map((item) => {
                  const option = options.find((o) => o.value === item);
                  return (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="flex items-center gap-1 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) handleUnselect(item);
                      }}
                    >
                      {option?.label || item}
                      {!disabled && (
                        <X className="h-3 w-3 text-muted-foreground cursor-pointer" />
                      )}
                    </Badge>
                  );
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-full min-w-[200px]" 
          align="start"
          onClick={handleContentClick}
          onKeyDown={handleKeyDown}
          onPointerDownOutside={stopPropagation}
          onFocusOutside={stopPropagation}
          onInteractOutside={stopPropagation}
        >
          <Command className="w-full">
            <CommandInput 
              placeholder="Search..." 
              className="h-9"
              onKeyDown={stopPropagation}
              onClick={stopPropagation}
            />
            <CommandGroup>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Loading options...</div>
              ) : options.length > 0 ? (
                options.map((option) => {
                  const isSelected = validSelected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      disabled={option.disabled}
                      onSelect={() => {
                        if (isSelected) {
                          onChange(
                            validSelected.filter((item) => item !== option.value)
                          );
                        } else {
                          onChange([...validSelected, option.value]);
                        }
                        // Don't close the popover on selection
                        // setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        option.disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })
              ) : (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
