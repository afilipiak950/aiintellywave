
import AddCustomerButton from "@/components/ui/customer/AddCustomerButton";
import CustomerViewToggle from "./CustomerViewToggle";
import InviteUserButton from "./buttons/InviteUserButton";

interface CustomerHeaderProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
  onRefresh: () => void;
  loading: boolean;
  onInviteUser?: () => void;
}

const CustomerHeader = ({ 
  view, 
  onViewChange, 
  onRefresh, 
  loading, 
  onInviteUser 
}: CustomerHeaderProps) => {
  return (
    <div className="flex justify-between items-center w-full">
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
        {onInviteUser && <InviteUserButton onInviteUser={onInviteUser} />}
      </div>
    </div>
  );
};

export default CustomerHeader;
