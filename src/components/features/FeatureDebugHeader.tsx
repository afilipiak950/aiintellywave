
import React from 'react';
import { Settings } from 'lucide-react';
import { RefreshFeaturesButton } from './RefreshFeaturesButton';
import { FeatureRepairButton } from './FeatureRepairButton';

interface FeatureDebugHeaderProps {
  onRefresh: () => Promise<void>;
  onRepair: () => Promise<void>;
  loading: boolean;
  repairing: boolean;
  companyId: string | null;
}

export const FeatureDebugHeader = ({ 
  onRefresh, 
  onRepair, 
  loading, 
  repairing, 
  companyId 
}: FeatureDebugHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Feature Status Debug</h1>
      </div>
      
      <div className="flex space-x-3">
        <RefreshFeaturesButton onClick={onRefresh} isLoading={loading} />
        
        {companyId && (
          <FeatureRepairButton 
            onClick={onRepair} 
            isLoading={repairing} 
            disabled={loading} 
          />
        )}
      </div>
    </div>
  );
};
