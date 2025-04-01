
import { Button } from '@/components/ui/button';
import CustomerList from '@/components/ui/customer/CustomerList';
import CustomerLoadingState from '@/components/ui/customer/CustomerLoadingState';
import { UICustomer } from '@/types/customer';
import CustomerErrorDisplay from './CustomerErrorDisplay';

interface CustomerContentProps {
  loading: boolean;
  error: string | null;
  customers: UICustomer[];
  searchTerm: string;
  view: 'grid' | 'table';
  onRetry: () => void;
  onRepair: () => Promise<void>;
  isRepairing: boolean;
}

const CustomerContent = ({
  loading,
  error,
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

  if (error) {
    return <CustomerErrorDisplay errorMsg={error} onRetry={onRetry} />;
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kunden gefunden</h3>
        <p className="text-gray-500 mb-4">
          {searchTerm 
            ? `Keine Kunden für Suchbegriff "${searchTerm}" gefunden.`
            : 'Es wurden keine Kunden gefunden. Überprüfen Sie die Datenbank oder Ihre Berechtigungen.'}
        </p>
        <Button onClick={onRepair} disabled={isRepairing}>
          {isRepairing ? 'Reparieren...' : 'Kundenassociationen reparieren'}
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
