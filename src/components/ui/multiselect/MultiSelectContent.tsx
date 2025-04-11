
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
  const stopPropagation = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    // Prevent Enter key from submitting forms
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <Command 
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      className="popover-content w-full"
    >
      <CommandInput 
        placeholder="Search..." 
        onKeyDown={handleInputKeyDown}
        className="border-none focus:ring-0"
      />
      <CommandList className="max-h-[200px]">
        <CommandEmpty>{isLoading ? "Loading..." : emptyMessage}</CommandEmpty>
        <CommandGroup>
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
      </CommandList>
    </Command>
  );
};
