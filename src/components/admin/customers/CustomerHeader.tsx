
import { Button } from "@/components/ui/button";
import CustomerViewToggle from "./CustomerViewToggle";
import AddCustomerButton from "@/components/ui/customer/AddCustomerButton";

interface CustomerHeaderProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
  onRefresh: () => void;
  loading: boolean;
}

const CustomerHeader = ({ view, onViewChange, onRefresh, loading }: CustomerHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Customers Management</h1>
      <div className="flex items-center space-x-3">
        <AddCustomerButton 
          onCustomerCreated={onRefresh} 
          variant="default"
        />
        <CustomerViewToggle 
          view={view}
          onViewChange={onViewChange}
          onRefresh={onRefresh}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CustomerHeader;
