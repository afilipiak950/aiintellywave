
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ExcelEditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  isHeader?: boolean;
}

const ExcelEditableCell = ({ 
  value, 
  onChange,
  className,
  isHeader = false
}: ExcelEditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleEdit = () => {
    setEditValue(value.toString());
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  
  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (isEditing && inputRef.current && !inputRef.current.contains(e.target as Node)) {
      handleSave();
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isEditing]);
  
  const headerClass = isHeader ? "font-medium bg-muted/50" : "";
  
  return (
    <div className={cn("h-full w-full", className)}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full h-full bg-white border border-blue-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <div 
          onClick={handleEdit} 
          className={cn(
            "cursor-pointer h-full w-full px-2 py-1 hover:bg-blue-50",
            headerClass
          )}
        >
          {value.toString()}
        </div>
      )}
    </div>
  );
};

export default ExcelEditableCell;
