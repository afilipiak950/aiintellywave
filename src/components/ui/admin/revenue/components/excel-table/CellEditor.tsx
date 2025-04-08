
import React, { useRef, useEffect } from 'react';

interface CellEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CellEditor: React.FC<CellEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus the input when it's rendered
    inputRef.current?.focus();
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      className="w-full h-full bg-white border border-blue-300 px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
};

export default CellEditor;
