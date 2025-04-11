
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';

interface CustomerTagProps {
  tag: string;
  onRemove?: (tag: string) => void;
  editable?: boolean;
}

const CustomerTag = ({ tag, onRemove, editable = false }: CustomerTagProps) => {
  return (
    <Badge 
      variant="secondary"
      className={`px-2 py-1 flex items-center gap-1.5 ${
        editable 
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 group' 
          : 'bg-slate-100'
      }`}
    >
      {tag}
      {editable && onRemove && (
        <X
          className="h-3 w-3 text-blue-400 cursor-pointer hover:text-blue-700 opacity-70 group-hover:opacity-100"
          onClick={() => onRemove(tag)}
        />
      )}
    </Badge>
  );
};

export interface CustomerTagsDisplayProps {
  tags?: string[];
  onRemove?: (tag: string) => void;
  editable?: boolean;
  emptyMessage?: string;
}

export const CustomerTagsDisplay = ({ 
  tags = [], 
  onRemove, 
  editable = false,
  emptyMessage = "No tags assigned yet." 
}: CustomerTagsDisplayProps) => {
  if (!tags || tags.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <CustomerTag 
          key={index}
          tag={tag}
          onRemove={onRemove}
          editable={editable}
        />
      ))}
    </div>
  );
};

export default CustomerTag;
