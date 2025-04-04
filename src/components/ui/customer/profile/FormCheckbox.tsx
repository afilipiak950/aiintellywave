
import { FieldError, UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';

interface FormCheckboxProps {
  id: string;
  label: string;
  description?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  disabled?: boolean;
}

export const FormCheckbox = ({ 
  id, 
  label, 
  description,
  register, 
  error, 
  disabled 
}: FormCheckboxProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          disabled={disabled}
          {...register(id)}
        />
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground pl-6">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};
