
import React from 'react';
import { useFeatureDebug } from '@/hooks/use-feature-debug';
import { FeatureDebugHeader } from '@/components/features/FeatureDebugHeader';
import { CompanyAssociationAlert } from '@/components/features/CompanyAssociationAlert';
import { FeatureStatusCard } from '@/components/features/FeatureStatusCard';
import { useAuth } from '@/context/auth';

const FeatureDebug = () => {
  const {
    features,
    loading,
    repairFeatures,
    isRepairingFeatures,
    toggleGoogleJobs
  } = useFeatureDebug();
  
  const { user } = useAuth();
  const companyId = features?.company_id || null;

  return (
    <div className="container mx-auto">
      <FeatureDebugHeader 
        onRefresh={() => {}} // No refresh function needed
        onRepair={repairFeatures}
        loading={loading}
        repairing={isRepairingFeatures}
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
