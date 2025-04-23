
import React from 'react';
import { Settings } from 'lucide-react';
import { FeatureRepairButton } from '@/components/features/FeatureRepairButton';

interface FeatureDebugHeaderProps {
  onRepair: () => Promise<void>;
  repairing: boolean;
  companyId: string | null;
}

export const FeatureDebugHeader = ({ 
  onRepair, 
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
        {companyId && (
          <FeatureRepairButton 
            onClick={onRepair} 
            isLoading={repairing} 
          />
        )}
      </div>
    </div>
  );
};

