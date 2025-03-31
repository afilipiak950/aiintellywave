
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CustomerErrorStateProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorState = ({ errorMsg, onRetry }: CustomerErrorStateProps) => {
  // Format the error message to be more user-friendly
  const formattedError = errorMsg.includes("infinite recursion") 
    ? "Database policy error: We're experiencing an issue with the way data access is configured. Our team is working to fix this."
    : errorMsg;

  // Check if it's an RLS issue
  const isRlsError = errorMsg.includes("infinite recursion") || 
                    errorMsg.includes("policy") || 
                    errorMsg.includes("violates row-level security");

  return (
    <div className="text-center py-12 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Customers</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {formattedError}
      </p>
      {isRlsError && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-6 text-sm text-amber-800">
          <p className="font-medium">Database Access Issue</p>
          <p className="mt-1">This appears to be a permissions issue in the database. Please contact your administrator.</p>
        </div>
      )}
      <Button 
        onClick={onRetry}
        variant="default"
        className="inline-flex items-center font-medium"
      >
        Try Again
      </Button>
      <p className="mt-4 text-sm text-gray-400">
        If the problem persists, please contact support.
      </p>
    </div>
  );
};

export default CustomerErrorState;
