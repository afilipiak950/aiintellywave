
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProfileTextAreaProps {
  id: string;
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

export const ProfileTextArea = ({
  id,
  label,
  value,
  isEditing,
  onChange,
  placeholder = "Tell us about yourself",
  rows = 4
}: ProfileTextAreaProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {isEditing ? (
        <Textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <div className="p-3 rounded-md border border-gray-200 bg-gray-50 min-h-[100px]">
          {value || 'No bio provided'}
        </div>
      )}
    </div>
  );
};
