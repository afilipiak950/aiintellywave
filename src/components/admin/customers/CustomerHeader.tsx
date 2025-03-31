
import { Button } from "@/components/ui/button";
import CustomerViewToggle from "./CustomerViewToggle";

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
      <CustomerViewToggle 
        view={view}
        onViewChange={onViewChange}
        onRefresh={onRefresh}
        loading={loading}
      />
    </div>
  );
};

export default CustomerHeader;
