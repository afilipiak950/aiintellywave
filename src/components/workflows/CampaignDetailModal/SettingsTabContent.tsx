
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Calendar } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';

interface SettingsTabContentProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
  isLoadingTags: boolean;
  isUpdating: boolean;
  handleSaveTags: () => void;
  campaign?: any;
}

export function SettingsTabContent({
  selectedTags,
  setSelectedTags,
  availableTags,
  isLoadingTags,
  isUpdating,
  handleSaveTags,
  campaign
}: SettingsTabContentProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <h3 className="text-lg font-semibold">Schedule Settings</h3>
        
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div className="font-medium text-gray-700">New schedule</div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time:</span>
              <span>09:00 - 18:00</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Timezone:</span>
              <span>America/Detroit</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Days:</span>
            <span>Mon, Tue, Wed, Thu, Fri</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sending Settings</h3>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Daily limit:</span>
            <span className="font-medium">{campaign?.daily_limit || 90}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Tracking links:</span>
            <span className="font-medium">Disabled</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Tracking opens:</span>
            <span className="font-medium">Disabled</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Text only:</span>
            <span className="font-medium">No</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Match lead ESP:</span>
            <span className="font-medium">No</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Stop Conditions</h3>
          
          <div className="flex items-center gap-2 py-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${campaign?.stop_on_reply ? 'bg-green-500' : 'bg-gray-200'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>Stop on reply</span>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${campaign?.stop_on_auto_reply ? 'bg-green-500' : 'bg-red-500'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {campaign?.stop_on_auto_reply ? (
                  <polyline points="20 6 9 17 4 12"></polyline>
                ) : (
                  <g>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </g>
                )}
              </svg>
            </div>
            <span>Stop on auto-reply</span>
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <span className="text-muted-foreground">Auto variant select:</span>
            <span className="text-sm">Not configured</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Campaign Tags</h3>
        <p className="text-sm text-muted-foreground">
          Assign tags to make this campaign visible to specific customer companies.
        </p>
        
        {isLoadingTags ? (
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md"></div>
        ) : (
          <>
            <MultiSelect
              options={availableTags.map(tag => ({ label: tag, value: tag }))}
              selected={selectedTags}
              onChange={setSelectedTags}
              placeholder="Select tags"
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
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
