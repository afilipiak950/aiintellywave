
import React, { useEffect } from 'react';
import { useFeatureDebug } from '@/hooks/use-feature-debug';
import { FeatureDebugHeader } from '@/components/features/FeatureDebugHeader';
import { CompanyAssociationAlert } from '@/components/features/CompanyAssociationAlert';
import { FeatureStatusCard } from '@/components/features/FeatureStatusCard';
import { useAuth } from '@/context/auth';
import { useCompanyAssociation } from '@/hooks/use-company-association';

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
  const { checkCompanyAssociation } = useCompanyAssociation();

  // Force check company association and features when this page loads
  useEffect(() => {
    checkCompanyAssociation();
  }, [checkCompanyAssociation]);

  // Create an empty function that returns a Promise for the onRefresh prop
  const handleRefresh = async (): Promise<void> => {
    checkCompanyAssociation();
    return Promise.resolve();
  };

  return (
    <div className="container mx-auto">
      <FeatureDebugHeader 
        onRefresh={handleRefresh}
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

      <div className="mt-6 p-4 bg-muted rounded-md">
        <h3 className="text-lg font-medium mb-2">Direct Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="/customer/job-parsing" 
            className="text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/customer/job-parsing';
            }}
          >
            Go directly to Job Parsing page
          </a>
          <a 
            href="/customer/dashboard" 
            className="text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/customer/dashboard';
            }}
          >
            Return to Dashboard
          </a>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>If the Google Jobs feature is not appearing in the sidebar menu, 
             you can try clicking the link above to access it directly. 
             If the page loads successfully, the feature is enabled.</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureDebug;
