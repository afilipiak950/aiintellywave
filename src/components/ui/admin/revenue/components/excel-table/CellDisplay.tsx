
import React from 'react';
import { cn } from '@/lib/utils';
import { formatCurrencyValue } from './cell-utils';

interface CellDisplayProps {
  value: string | number;
  onEdit: () => void;
  isHeader?: boolean;
  readOnly?: boolean;
  isTotal?: boolean;
  isCurrency?: boolean;
  className?: string;
}

const CellDisplay: React.FC<CellDisplayProps> = ({
  value,
  onEdit,
  isHeader = false,
  readOnly = false,
  isTotal = false,
  isCurrency = true,
  className
}) => {
  const headerClass = isHeader ? "font-medium bg-muted/50" : "";
  const readOnlyClass = readOnly ? "opacity-90 pointer-events-none" : "cursor-pointer hover:bg-blue-50";
  const totalClass = isTotal ? "font-medium" : "";
  
  const displayValue = isCurrency ? formatCurrencyValue(value) : value.toString();
  
  return (
    <div 
      onClick={onEdit} 
      className={cn(
        "h-full w-full px-2 py-1 text-center",
        headerClass,
        readOnlyClass,
        totalClass,
        className
      )}
    >
      {displayValue}
    </div>
  );
};

export default CellDisplay;
