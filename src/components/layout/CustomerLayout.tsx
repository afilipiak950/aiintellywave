
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';

const CustomerLayout = () => {
  const { featuresUpdated } = useCompanyAssociation();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar role="customer" key={`sidebar-${featuresUpdated}`} />
      <MainContent featuresUpdated={featuresUpdated} />
    </div>
  );
};

export default CustomerLayout;
