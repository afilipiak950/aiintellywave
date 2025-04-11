
import * as React from "react";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList
} from "@/components/ui/command";
import { MultiSelectItem } from "./MultiSelectItem";
import { MultiSelectOption } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

type MultiSelectContentProps = {
  options: MultiSelectOption[];
  selected: string[];
  emptyMessage: string;
  isLoading?: boolean;
  onItemSelect: (value: string, e: React.MouseEvent) => void;
};

export const MultiSelectContent = ({
  options,
  selected,
  emptyMessage,
  isLoading = false,
  onItemSelect
}: MultiSelectContentProps) => {
  // Enhanced event stopping function for various event types
  const stopPropagation = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <Command 
      className="bg-white rounded-md border shadow-md overflow-hidden w-full"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onKeyDown={(e) => {
        // Prevent keyboard actions that might close the dropdown
        if (e.key === 'Escape') {
          e.stopPropagation();
        }
        if (e.key === 'Enter' || e.key === ' ') {
          stopPropagation(e);
        }
      }}
    >
      <CommandInput 
        placeholder="Search users..." 
        className="border-none focus:ring-0"
        onKeyDown={(e) => {
          // Prevent Enter key from submitting forms
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      />
      <CommandList className="max-h-52 overflow-y-auto">
        <ScrollArea className="h-full max-h-[200px]">
          <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
          <CommandGroup className="overflow-visible">
            {options.map((option) => (
              <MultiSelectItem
                key={option.value}
                value={option.value}
                label={option.label}
                isSelected={selected.includes(option.value)}
                onSelect={onItemSelect}
              />
            ))}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </Command>
  );
};
