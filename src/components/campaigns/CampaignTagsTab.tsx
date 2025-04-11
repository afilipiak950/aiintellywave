
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, X, Loader2 } from 'lucide-react';
import { useCampaignTags } from '@/hooks/use-campaign-tags';
import { toast } from '@/hooks/use-toast';

interface CampaignTagsTabProps {
  campaignId: string;
}

const CampaignTagsTab: React.FC<CampaignTagsTabProps> = ({ campaignId }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  const { 
    updateCampaignTags,
    isUpdating,
    availableTags,
    isLoadingTags 
  } = useCampaignTags(campaignId);
  
  // Fetch campaign tags when the component is mounted
  useEffect(() => {
    const fetchCampaignTags = async () => {
      try {
        // Here you would fetch the campaign tags from your API
        // For now, let's use a placeholder
        const campaignData = { tags: [] };
        setTags(campaignData.tags || []);
      } catch (error) {
        console.error('Error fetching campaign tags:', error);
      }
    };
    
    fetchCampaignTags();
  }, [campaignId]);
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    // Add the tag if it doesn't already exist
    if (!tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      setHasChanges(true);
    } else {
      toast({
        title: "Tag already exists",
        description: "This tag is already added to the campaign.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasChanges(true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSaveTags = async () => {
    const success = await updateCampaignTags(tags);
    if (success) {
      setHasChanges(false);
    }
  };
  
  // Function to handle container clicks to prevent event propagation
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  if (isLoadingTags) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div 
      className="space-y-4" 
      onClick={handleContainerClick}
      onMouseDown={handleContainerClick}
    >
      <div className="space-y-2">
        <h3 className="text-base font-medium">Campaign Tags</h3>
        <p className="text-sm text-gray-500">
          Add tags to categorize this campaign and match with customer interests.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="px-2 py-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 group"
            >
              {tag}
              <X
                className="h-3 w-3 text-blue-400 cursor-pointer hover:text-blue-700 opacity-70 group-hover:opacity-100"
                onClick={() => handleRemoveTag(tag)}
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
          disabled={!newTag.trim() || isUpdating}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {hasChanges && (
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSaveTags} 
            disabled={isUpdating || !hasChanges}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Tags'
            )}
          </Button>
        </div>
      )}
      
      {availableTags.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Suggested Tags</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => {
                  if (!tags.includes(tag)) {
                    setTags([...tags, tag]);
                    setHasChanges(true);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignTagsTab;
