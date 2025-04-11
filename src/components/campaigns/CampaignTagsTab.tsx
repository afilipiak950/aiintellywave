
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multiselect';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCampaignTags } from '@/hooks/use-campaign-tags';

interface CampaignTagsTabProps {
  campaignId: string;
}

const CampaignTagsTab = ({ campaignId }: CampaignTagsTabProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  const {
    availableTags,
    isLoadingTags,
    updateCampaignTags,
    isUpdating
  } = useCampaignTags(campaignId);

  // This would be populated with actual campaign tags if we had an endpoint
  useEffect(() => {
    // For now, we'll just use empty array as default
    setSelectedTags([]);
    setHasChanges(false);
  }, [campaignId]);
  
  const handleSelectionChange = (selected: string[]) => {
    console.log("CampaignTagsTab: Selection changed to:", selected);
    setSelectedTags(selected);
    setHasChanges(true);
  };
  
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("CampaignTagsTab: Saving tag selections:", selectedTags);
    const success = await updateCampaignTags(selectedTags);
    if (success) {
      setHasChanges(false);
      toast({
        title: "Tags updated",
        description: "The campaign tags have been updated successfully."
      });
    }
  };
  
  const tagOptions = availableTags.map(tag => ({
    value: tag,
    label: tag
  }));
  
  const handleContainerInteraction = (e: React.MouseEvent) => {
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
      onClick={handleContainerInteraction}
      onMouseDown={handleContainerInteraction}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Campaign Tags</label>
        <MultiSelect
          options={tagOptions}
          selected={selectedTags}
          onChange={handleSelectionChange}
          placeholder="Select tags..."
          emptyMessage="No tags available"
          disabled={isUpdating}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Tags help categorize campaigns and are used for filtering in reports.
        </p>
      </div>
      
      {hasChanges && (
        <Button 
          onClick={handleSave} 
          disabled={isUpdating || !hasChanges} 
          className="w-full sm:w-auto"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      )}
      
      {availableTags.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tags available. Tags need to be defined in the company settings first.
        </div>
      )}
    </div>
  );
};

export default CampaignTagsTab;
