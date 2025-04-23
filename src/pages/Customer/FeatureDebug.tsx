
import React from 'react';
import { useFeatureDebug } from '@/hooks/use-feature-debug';
import { FeatureDebugHeader } from '@/components/features/FeatureDebugHeader';
import { useCompanyId } from '@/hooks/company/useCompanyId';

const FeatureDebug = () => {
  const { companyId } = useCompanyId();
  // Removing references to repairFeatures and isRepairingFeatures

  return (
    <div className="container mx-auto p-4">
      <FeatureDebugHeader
        companyId={companyId}
      />
    </div>
  );
};

export default FeatureDebug;
