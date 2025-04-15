
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface ExcelEditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  isHeader?: boolean;
  readOnly?: boolean;
  isTotal?: boolean;
  isCurrency?: boolean;
}

const ExcelEditableCell: React.FC<ExcelEditableCellProps> = ({
  value,
  onChange,
  isHeader = false,
  readOnly = false,
  isTotal = false,
  isCurrency = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  
  // Format number with Euro symbol
  const formatValue = (val: string | number): string => {
    if (val === '') return '';
    
    try {
      // If it's a number and we need currency format
      if (!isNaN(Number(val)) && isCurrency) {
        const num = parseFloat(val.toString());
        // Use German locale formatting for Euro
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2
        }).format(num);
      }
    } catch (e) {
      console.error('Error formatting cell value:', e);
    }
    
    // Return as is if not a number or not needing formatting
    return val.toString();
  };
  
  const handleDoubleClick = () => {
    if (readOnly) return;
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    // Only call onChange if the value has actually changed
    if (inputValue !== value.toString()) {
      onChange(inputValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      onChange(inputValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setInputValue(value.toString());
    }
  };
  
  // Cell style based on props
  const cellStyle = isHeader
    ? 'font-semibold bg-muted/20'
    : isTotal
      ? 'font-semibold bg-muted/20 text-primary'
      : readOnly
        ? 'bg-muted/10'
        : '';
  
  // If editing, show input
  if (isEditing && !readOnly) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-7 px-2 w-full border-0 focus:ring-1 focus:ring-primary"
        autoFocus
      />
    );
  }
  
  // If not editing, show formatted value
  return (
    <div
      className={`px-2 py-1 h-full w-full flex items-center ${cellStyle} ${!readOnly ? 'cursor-pointer hover:bg-muted/10' : ''}`}
      onDoubleClick={handleDoubleClick}
      title={readOnly ? "Read only" : "Double-click to edit"}
    >
      {value !== '' ? formatValue(value) : ''}
    </div>
  );
};

export default ExcelEditableCell;
