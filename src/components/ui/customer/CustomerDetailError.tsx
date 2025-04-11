
import { Button } from '@/components/ui/button';

interface CustomerDetailErrorProps {
  error: string;
  onRetry: () => void;
}

const CustomerDetailError = ({ error, onRetry }: CustomerDetailErrorProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
      {error}
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 block"
      >
        Try Again
      </button>
    </div>
  );
};

export default CustomerDetailError;
