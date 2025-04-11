
import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MultiSelectOption } from "./types";

type SelectedBadgeProps = {
  value: string;
  options: MultiSelectOption[];
  onRemove: (value: string, e: React.MouseEvent) => void;
};

export const SelectedBadge = ({ 
  value, 
  options, 
  onRemove 
}: SelectedBadgeProps) => {
  const option = options.find((opt) => opt.value === value);
  
  const handleStopPropagation = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleRemoveClick = React.useCallback((e: React.MouseEvent) => {
    onRemove(value, e);
  }, [onRemove, value]);

  return (
    <Badge
      key={value}
      variant="secondary"
      className="bg-blue-100 text-blue-800 hover:bg-blue-200 mr-1 mb-1"
    >
      {option?.label || value}
      <button
        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onMouseDown={handleStopPropagation}
        onClick={handleRemoveClick}
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      </button>
    </Badge>
  );
};
