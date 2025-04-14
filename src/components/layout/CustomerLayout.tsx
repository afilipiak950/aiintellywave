
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';

const CustomerLayout = () => {
  const { featuresUpdated } = useCompanyAssociation();

  // Using key with featuresUpdated to force Sidebar component to re-render when features change
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar role="customer" key={`sidebar-${featuresUpdated}`} />
      <MainContent featuresUpdated={featuresUpdated} />
    </div>
  );
};

export default CustomerLayout;
