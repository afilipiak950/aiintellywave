
import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  noOptionsMessage?: string;
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = 'Select options',
  className,
  noOptionsMessage = 'No options found.'
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((s) => s !== item));
  };

  // Make sure we're working with a valid array
  const safeSelected = Array.isArray(selected) ? selected : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-auto min-h-10',
            !safeSelected.length && 'text-muted-foreground',
            className
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {safeSelected.length > 0 ? (
              safeSelected.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {item}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <div className="ml-2 flex shrink-0 opacity-50">▼</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>{noOptionsMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = safeSelected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        onChange(safeSelected.filter((s) => s !== option.value));
                      } else {
                        onChange([...safeSelected, option.value]);
                      }
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
                      <CheckIcon className="h-3 w-3" />
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
