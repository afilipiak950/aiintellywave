
import React from 'react';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

interface ProfileReadOnlyFieldProps {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export const ProfileReadOnlyField = ({
  id,
  label,
  value,
  icon = <Mail className="mr-2 h-4 w-4 text-gray-500" />
}: ProfileReadOnlyFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
};
