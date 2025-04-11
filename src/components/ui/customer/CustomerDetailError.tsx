
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CustomerDetailErrorProps {
  error: string;
  onRetry: () => void;
}

const CustomerDetailError = ({ error, onRetry }: CustomerDetailErrorProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-red-700">
      <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
        <h3 className="text-lg font-semibold text-red-700">Kunde konnte nicht geladen werden</h3>
      </div>
      
      <p className="mb-4">{error}</p>
      
      <div className="bg-white p-3 rounded-md border border-red-100 mb-4 text-xs font-mono overflow-auto max-h-32">
        <p className="text-gray-600 mb-1">Debugging Information:</p>
        <p>Customer ID: {window.location.pathname.split('/').pop()}</p>
        <p>URL: {window.location.pathname}</p>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          onClick={onRetry}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Erneut versuchen
        </Button>
        
        <Button 
          onClick={() => window.history.back()}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Zurück
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetailError;
