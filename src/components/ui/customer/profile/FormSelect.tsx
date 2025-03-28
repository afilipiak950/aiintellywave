
import { UseFormRegister, FieldError } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError | any;
  className?: string;
  disabled?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const FormSelect = ({
  id,
  label,
  register,
  error,
  className = '',
  disabled = false,
  options,
  placeholder = "Select an option..."
}: FormSelectProps) => {
  return (
    <div className={`${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        disabled={disabled}
        {...register(id)}
        className={`
          w-full px-3 py-2 border rounded-md 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-500 mt-1">{error.message}</span>
      )}
    </div>
  );
};
