
import { FieldError, UseFormRegister } from 'react-hook-form';

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
}

export const FormSection = ({ children, title }: FormSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {title && (
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{title}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
};

interface FormFieldProps {
  id: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  className?: string;
}

export const FormField = ({
  id,
  label,
  register,
  error,
  type = 'text',
  placeholder,
  className = '',
}: FormFieldProps) => {
  return (
    <div className={`${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className={`
          w-full px-3 py-2 border rounded-md 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error.message}</span>
      )}
    </div>
  );
};
