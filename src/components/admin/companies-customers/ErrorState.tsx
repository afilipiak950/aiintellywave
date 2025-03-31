
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 my-6">
      <h3 className="text-red-800 font-medium">Error Loading Data</h3>
      <p className="text-red-700 text-sm mt-1">{error}</p>
      <Button 
        onClick={onRetry} 
        variant="destructive"
        size="sm" 
        className="mt-3"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
};

export default ErrorState;
