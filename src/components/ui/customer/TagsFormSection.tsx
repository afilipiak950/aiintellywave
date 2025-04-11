
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { CustomerTagsDisplay } from './CustomerTag';

interface TagsFormSectionProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsFormSection = ({ tags, onTagsChange }: TagsFormSectionProps) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Tags</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <CustomerTagsDisplay 
          tags={Array.isArray(tags) ? tags : []} 
          onRemove={handleRemoveTag} 
          editable={true}
          emptyMessage="No tags added yet. Add tags to categorize this entity."
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Enter a tag..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={handleAddTag}
          disabled={!newTag.trim()}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default TagsFormSection;
