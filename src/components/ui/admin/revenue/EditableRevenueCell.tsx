
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EditableRevenueCellProps {
  value: number;
  onChange: (value: number) => void;
  format?: 'number' | 'currency';
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const EditableRevenueCell = ({
  value,
  onChange,
  format = 'number',
  className,
  disabled = false,
  placeholder = '0'
}: EditableRevenueCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue) || 0;
    if (numValue !== value) {
      onChange(numValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };
  
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      }).format(val);
    }
    return val.toLocaleString('de-DE');
  };
  
  return (
    <div className="relative">
      {isEditing ? (
        <Input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "p-1 h-8 w-full text-right", 
            className
          )}
          step="0.01"
          disabled={disabled}
          placeholder={placeholder}
        />
      ) : (
        <motion.div
          className={cn(
            "cursor-pointer p-1 text-right rounded hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[60px]",
            disabled && "opacity-60 cursor-not-allowed hover:bg-transparent",
            className
          )}
          whileTap={{ scale: 0.98 }}
          onClick={() => !disabled && setIsEditing(true)}
        >
          {value === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            formatValue(value)
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EditableRevenueCell;
