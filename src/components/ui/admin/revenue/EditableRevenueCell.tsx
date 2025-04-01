
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EditableRevenueCellProps {
  value: number | string;
  onChange: (value: number) => void;
  format?: 'number' | 'currency' | 'percent';
  size?: 'xs' | 'sm' | 'md'; // Neue Prop für Größe hinzugefügt
}

const EditableRevenueCell = ({ 
  value, 
  onChange, 
  format = 'number',
  size = 'md' // Standard ist 'md'
}: EditableRevenueCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  const formattedValue = () => {
    if (typeof value === 'string') return value;
    
    switch(format) {
      case 'currency':
        return new Intl.NumberFormat('de-DE', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        }).format(value as number);
      case 'percent':
        return `${(value as number).toFixed(1)}%`;
      default:
        return (value as number).toLocaleString('de-DE');
    }
  };
  
  const handleEdit = () => {
    setEditValue(value.toString());
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  
  const handleSave = () => {
    // Convert to number
    const numberValue = parseFloat(editValue);
    if (isNaN(numberValue)) {
      setEditValue(value.toString());
    } else {
      onChange(numberValue);
    }
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
  
  const fontSizeClass = size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : 'text-sm';
  const paddingClass = size === 'xs' ? 'py-0.5 px-1' : size === 'sm' ? 'py-1 px-1.5' : 'py-1 px-2';
  
  return (
    <>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn("w-full bg-white border-none focus:ring-1 focus:ring-primary outline-none", 
            fontSizeClass, paddingClass, "h-auto")}
          style={{ maxWidth: '100%' }}
        />
      ) : (
        <span 
          onClick={handleEdit} 
          className={cn("cursor-pointer hover:bg-blue-50 rounded transition-colors", 
            fontSizeClass, paddingClass, "block text-right")}
        >
          {formattedValue()}
        </span>
      )}
    </>
  );
};

export default EditableRevenueCell;
