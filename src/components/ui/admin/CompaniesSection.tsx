
import { UICustomer } from '@/types/customer';
import CompaniesGrid from './CompaniesGrid';
import { Button } from '@/components/ui/button';
import CustomerLoadingState from '@/components/ui/customer/CustomerLoadingState';
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';
import CompaniesTable from './CompaniesTable';
import { AlertCircle } from 'lucide-react';

interface CompaniesSectionProps {
  companies: UICustomer[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  view: 'grid' | 'table';
  onRetry: () => void;
  onRepair: () => Promise<void>;
  isRepairing: boolean;
}

const CompaniesSection = ({
  companies,
  loading,
  errorMsg,
  searchTerm,
  view,
  onRetry,
  onRepair,
  isRepairing
}: CompaniesSectionProps) => {
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
  
  if (companies.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {searchTerm 
            ? `No companies match search term "${searchTerm}"`
            : 'There are no companies in the system or you don\'t have permission to view them.'}
        </p>
        <Button 
          onClick={onRepair} 
          disabled={isRepairing} 
          className="mb-2"
        >
          {isRepairing ? 'Repairing...' : 'Repair Company Associations'}
        </Button>
        <p className="text-sm text-gray-400 mt-2">
          This will create a default company if none exist and fix user-company relationships.
        </p>
      </div>
    );
  }
  
  return view === 'grid' 
    ? <CompaniesGrid companies={companies} />
    : <CompaniesTable companies={companies} />;
};

export default CompaniesSection;
