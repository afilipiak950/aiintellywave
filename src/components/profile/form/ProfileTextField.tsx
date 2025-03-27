
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface ProfileTextFieldProps {
  id: string;
  label: string;
  value: string;
  isEditing: boolean;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileTextField = ({
  id,
  label,
  value,
  isEditing,
  icon = <User className="mr-2 h-4 w-4 text-gray-500" />,
  onChange
}: ProfileTextFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {isEditing ? (
        <Input
          id={id}
          value={value}
          onChange={onChange}
        />
      ) : (
        <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
          {icon}
          <span>{value || 'Not set'}</span>
        </div>
      )}
    </div>
  );
};
