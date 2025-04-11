
import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomerTagsDisplay } from './CustomerTag';

interface TagsFormSectionProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsFormSection = ({ tags = [], onTagsChange }: TagsFormSectionProps) => {
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    // Only add if it doesn't already exist
    if (!tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onTagsChange(updatedTags);
    }
    
    // Reset state
    setNewTag('');
    setIsAddingTag(false);
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-gray-500" />
          Tags
        </h3>
        {!isAddingTag ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingTag(true)}
            className="flex items-center text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Tag
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              className="h-8 text-sm w-40"
              placeholder="Enter tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                } else if (e.key === 'Escape') {
                  setIsAddingTag(false);
                  setNewTag('');
                }
              }}
              autoFocus
            />
            <Button 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => {
                setIsAddingTag(false);
                setNewTag('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      
      <CustomerTagsDisplay 
        tags={tags} 
        onRemove={handleRemoveTag} 
        editable={true} 
      />
      
      <p className="text-xs text-gray-500 mt-2">
        Tags help categorize customers and match them with relevant campaigns.
      </p>
    </div>
  );
};

export default TagsFormSection;
