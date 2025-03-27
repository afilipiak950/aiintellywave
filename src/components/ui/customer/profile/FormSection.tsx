
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  register: any;
  error?: any;
  type?: string;
  className?: string;
}

export const FormField = ({ 
  id, 
  label, 
  placeholder, 
  register, 
  error, 
  type = 'text',
  className
}: FormFieldProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        {...register(id)}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
};
