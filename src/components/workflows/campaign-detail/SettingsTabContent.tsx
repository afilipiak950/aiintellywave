
import React from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MultiSelect } from '@/components/ui/multi-select';

interface SettingsTabContentProps {
  campaign: any;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  isLoadingTags: boolean;
  availableTags: string[];
  isUpdating: boolean;
  handleSaveTags: () => Promise<void>;
}

export const SettingsTabContent: React.FC<SettingsTabContentProps> = ({
  campaign,
  selectedTags,
  setSelectedTags,
  isLoadingTags,
  availableTags,
  isUpdating,
  handleSaveTags
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Campaign Tags</h3>
        <p className="text-sm text-gray-500 mb-4">
          Assign tags to make this campaign visible to specific customer companies.
        </p>
        
        {isLoadingTags ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ) : (
          <>
            <MultiSelect
              options={availableTags.map(tag => ({
                label: tag,
                value: tag
              }))}
              selected={selectedTags}
              onChange={setSelectedTags}
              placeholder="Select a tag"
              className="w-full"
            />
            <div className="mt-2 text-xs text-gray-500">
              Selected tags: {selectedTags.length}
            </div>
          </>
        )}
        
        <Button 
          onClick={handleSaveTags}
          disabled={isUpdating}
          className="mt-4"
        >
          {isUpdating ? 'Saving...' : 'Save Tags'}
        </Button>
      </div>
    </div>
  );
};
