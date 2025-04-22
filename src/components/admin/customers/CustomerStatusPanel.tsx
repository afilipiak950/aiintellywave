
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerStatusPanelProps {
  loading: boolean;
  errorMsg: string | null;
  customerCount: number;
  companyUsersCount: number;
  onRepairAdmin: () => Promise<void>;
  isRepairing: boolean;
}

const CustomerStatusPanel = ({
  loading,
  errorMsg,
  customerCount,
  companyUsersCount,
  onRepairAdmin,
  isRepairing
}: CustomerStatusPanelProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-medium mb-4">Customer Data Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <p>Status: {loading ? 'Loading...' : 'Ready'}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${errorMsg ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <p>Database Connection: {errorMsg ? 'Error' : 'Connected'}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${customerCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <p>Customer Records: {customerCount}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 h-7 text-xs"
            onClick={() => window.open('/admin/customers/check-db-count', '_blank')}
          >
            Check DB Total
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${companyUsersCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <p>Company-User Associations: {companyUsersCount}</p>
        </div>
      </div>
      
      {errorMsg && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Customers
          </h3>
          <p className="mb-4">{errorMsg}</p>
          <Button 
            onClick={onRepairAdmin}
            disabled={isRepairing}
            variant="destructive"
            className="mt-2"
          >
            {isRepairing ? 'Repairing...' : 'Repair Admin Access'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerStatusPanel;
