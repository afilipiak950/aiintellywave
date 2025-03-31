
import { Button } from "@/components/ui/button";
import CustomerList from "@/components/ui/customer/CustomerList";
import CustomerLoadingState from "@/components/ui/customer/CustomerLoadingState";
import CustomerErrorState from "@/components/ui/customer/CustomerErrorState";
import { Customer } from "@/types/customer";

interface CustomerContentProps {
  loading: boolean;
  errorMsg: string | null;
  customers: Customer[];
  searchTerm: string;
  view: 'grid' | 'table';
  onRetry: () => void;
  onRepair: () => Promise<void>;
  isRepairing: boolean;
}

const CustomerContent = ({ 
  loading, 
  errorMsg, 
  customers, 
  searchTerm, 
  view,
  onRetry,
  onRepair,
  isRepairing
}: CustomerContentProps) => {
  if (loading) {
    return <CustomerLoadingState />;
  }
  
  if (errorMsg) {
    return (
      <CustomerErrorState 
        errorMsg={errorMsg}
        onRetry={onRetry}
      />
    );
  }
  
  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
        <p className="text-gray-500 mb-4">
          There are no customers in the system or you don't have permission to view them.
        </p>
        <Button onClick={onRepair} disabled={isRepairing}>
          {isRepairing ? 'Repairing...' : 'Repair Customer Associations'}
        </Button>
      </div>
    );
  }
  
  return (
    <CustomerList 
      customers={customers}
      searchTerm={searchTerm}
      view={view}
    />
  );
};

export default CustomerContent;
