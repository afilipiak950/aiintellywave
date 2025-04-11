
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
  // Create a function to stop propagation
  const stopPropagation = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <Command 
      className="bg-white rounded-md border shadow-md overflow-hidden w-full"
    >
      <CommandInput 
        placeholder="Search users..." 
        className="border-none focus:ring-0"
      />
      <CommandList className="max-h-80 overflow-auto">
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
