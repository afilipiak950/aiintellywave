
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormTextAreaProps {
  id: string;
  label: string;
  placeholder?: string;
  register: any;
  error?: any;
  rows?: number;
  className?: string;
}

export const FormTextArea = ({ 
  id, 
  label, 
  placeholder, 
  register, 
  error, 
  rows = 4,
  className
}: FormTextAreaProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        {...register(id)}
        placeholder={placeholder}
        rows={rows}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};
