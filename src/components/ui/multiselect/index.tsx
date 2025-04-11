
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

  // Verbesserte Klick-Behandlung mit garantierter Offenhaltung
  const handleSelect = React.useCallback((value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleSelect aufgerufen für Wert:", value);
    
    // Ändere den Auswahlstatus
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    
    // Rufe onChange mit der aktualisierten Auswahl auf
    onChange(newSelected);
    
    // Wichtig: Halte das Popup offen
    setOpen(true);
    
    // Verzögerung, um sicherzustellen, dass das Popup offen bleibt
    setTimeout(() => {
      setOpen(true);
    }, 50);
  }, [selected, onChange]);

  // Handler zum Entfernen eines ausgewählten Elements
  const handleUnselect = React.useCallback((value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("MultiSelect: handleUnselect", value);
    onChange(selected.filter((item) => item !== value));
  }, [selected, onChange]);

  // Handler für den Trigger-Button-Klick
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
        // Das Dropdown sollte immer geöffnet werden können
        if (newOpen) {
          setOpen(true);
        } else {
          // Nur schließen, wenn außerhalb geklickt wird oder wenn es speziell geschlossen wird
          setOpen(false);
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
        className="p-0 w-[300px] z-50 bg-white" 
        sideOffset={4}
        align="start"
        forceMount
        onEscapeKeyDown={() => setOpen(false)}
        onPointerDownOutside={(e) => {
          const target = e.target as Node;
          if (!document.querySelector('.popover-content')?.contains(target)) {
            setOpen(false);
          }
        }}
      >
        <div 
          className="popover-content"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
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
