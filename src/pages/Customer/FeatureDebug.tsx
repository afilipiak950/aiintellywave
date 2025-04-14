
import React from 'react';
import { useFeatureDebug } from '@/hooks/use-feature-debug';
import { FeatureDebugHeader } from '@/components/features/FeatureDebugHeader';
import { CompanyAssociationAlert } from '@/components/features/CompanyAssociationAlert';
import { FeatureStatusCard } from '@/components/features/FeatureStatusCard';

const FeatureDebug = () => {
  const {
    user,
    companyId,
    features,
    loading,
    repairing,
    checkFeatures,
    repairFeatures,
    toggleGoogleJobs
  } = useFeatureDebug();

  return (
    <div className="container mx-auto">
      <FeatureDebugHeader 
        onRefresh={checkFeatures}
        onRepair={repairFeatures}
        loading={loading}
        repairing={repairing}
        companyId={companyId}
      />
      
      <CompanyAssociationAlert 
        companyId={companyId} 
        loading={loading} 
      />
      
      <FeatureStatusCard 
        loading={loading}
        userId={user?.id}
        companyId={companyId}
        features={features}
        onToggleGoogleJobs={toggleGoogleJobs}
      />
    </div>
  );
};

export default FeatureDebug;
