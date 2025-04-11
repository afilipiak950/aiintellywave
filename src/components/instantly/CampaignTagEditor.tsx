
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface CampaignTagEditorProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTags: string[];
  onSave: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
}

const CampaignTagEditor: React.FC<CampaignTagEditorProps> = ({
  isOpen,
  onClose,
  campaignTags,
  onSave,
  onAddTag,
  onRemoveTag,
  newTag,
  setNewTag
}) => {
  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Campaign Tags</DialogTitle>
          <DialogDescription>
            Add tags to categorize this campaign. These tags will be used to match campaigns with customers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {campaignTags.length > 0 ? (
              campaignTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-2 py-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 group"
                >
                  {tag}
                  <X
                    className="h-3 w-3 text-blue-400 cursor-pointer hover:text-blue-700 opacity-70 group-hover:opacity-100"
                    onClick={() => onRemoveTag(tag)}
                  />
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No tags assigned yet.</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter a tag..."
              className="flex-1"
              onKeyDown={handleKeyDown}
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
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignTagEditor;
