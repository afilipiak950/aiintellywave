
import { Button } from "@/components/ui/button";
import CustomerViewToggle from "./CustomerViewToggle";
import AddCustomerButton from "@/components/ui/customer/AddCustomerButton";
import { UserPlus } from "lucide-react";

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
        {onInviteUser && (
          <Button 
            onClick={onInviteUser}
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Benutzer einladen
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerHeader;
