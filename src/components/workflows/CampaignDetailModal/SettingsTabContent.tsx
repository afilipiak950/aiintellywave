
import React from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Skeleton } from '@/components/ui/skeleton';

interface SettingsTabContentProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
  isLoadingTags: boolean;
  isUpdating: boolean;
  handleSaveTags: () => Promise<void>;
}

export function SettingsTabContent({
  selectedTags,
  setSelectedTags,
  availableTags,
  isLoadingTags,
  isUpdating,
  handleSaveTags
}: SettingsTabContentProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Campaign Tags</h3>
        <p className="text-sm text-muted-foreground mb-4">
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
              options={availableTags.map(tag => ({ label: tag, value: tag }))}
              selected={selectedTags}
              onChange={setSelectedTags}
              placeholder="Select a tag"
              className="w-full"
            />
            <div className="mt-2 text-xs text-muted-foreground">
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
}
