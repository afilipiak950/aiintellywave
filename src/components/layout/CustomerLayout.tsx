
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';

const CustomerLayout = () => {
  const { featuresUpdated, companyId } = useCompanyAssociation();

  console.log('[CustomerLayout] Rendering with featuresUpdated:', featuresUpdated, 'companyId:', companyId);

  // Using key with featuresUpdated to force Sidebar component to re-render when features change
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        role="customer" 
        forceRefresh={featuresUpdated} 
        key={`sidebar-${featuresUpdated}`} 
      />
      <MainContent 
        featuresUpdated={featuresUpdated} 
        key={`content-${featuresUpdated}`}
      />
    </div>
  );
};

export default CustomerLayout;
