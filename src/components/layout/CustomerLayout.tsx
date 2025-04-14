
import { useEffect } from 'react';
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';

const CustomerLayout = () => {
  const { companyId, checkCompanyAssociation } = useCompanyAssociation();

  useEffect(() => {
    // Only check company association once on initial mount
    checkCompanyAssociation();
  }, [checkCompanyAssociation]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar role="customer" />
      <MainContent />
    </div>
  );
};

export default CustomerLayout;
