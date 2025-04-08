
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import CellDisplay from './CellDisplay';
import CellEditor from './CellEditor';

interface ExcelEditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  isHeader?: boolean;
  readOnly?: boolean;
  isTotal?: boolean;
  isCurrency?: boolean;
}

const ExcelEditableCell = ({ 
  value, 
  onChange,
  className,
  isHeader = false,
  readOnly = false,
  isTotal = false,
  isCurrency = true
}: ExcelEditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  
  // Update internal value when prop changes
  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);
  
  const handleEdit = () => {
    if (readOnly) return;
    setEditValue(value.toString());
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };
  
  return (
    <div className={cn("h-full w-full", className)}>
      {isEditing && !readOnly ? (
        <CellEditor
          value={editValue}
          onChange={setEditValue}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <CellDisplay
          value={value}
          onEdit={handleEdit}
          isHeader={isHeader}
          readOnly={readOnly}
          isTotal={isTotal}
          isCurrency={isCurrency}
        />
      )}
    </div>
  );
};

export default ExcelEditableCell;
