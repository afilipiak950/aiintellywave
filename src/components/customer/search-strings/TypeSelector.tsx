
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchStringType } from '@/hooks/search-strings/search-string-types';

interface TypeSelectorProps {
  type: SearchStringType;
  onTypeChange: (value: SearchStringType) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({ 
  type, 
  onTypeChange 
}) => {
  return (
    <div>
      <Label htmlFor="type">Type</Label>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recruiting">Recruiting</SelectItem>
          <SelectItem value="lead-generation">Lead Generation</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
