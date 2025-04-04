
import { UICustomer } from '@/types/customer';
import CompaniesGrid from './CompaniesGrid';
import { Button } from '@/components/ui/button';
import CustomerLoadingState from '@/components/ui/customer/CustomerLoadingState';
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';
import CompaniesTable from './CompaniesTable';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [repairSuccess, setRepairSuccess] = useState(false);
  const [repairMessage, setRepairMessage] = useState('');
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  useEffect(() => {
    // Reset repair success message after a timeout
    if (repairSuccess) {
      const timer = setTimeout(() => {
        setRepairSuccess(false);
        setRepairMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [repairSuccess]);

  // Check directly in the database how many companies exist
  const checkDatabaseCompanies = async () => {
    setIsCheckingDb(true);
    try {
      // Using RPC to bypass RLS if needed
      const { data, error, count } = await supabase
        .from('companies')
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error('Error checking companies in database:', error);
        toast({
          title: "Database Error",
          description: `Failed to check companies: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setCompanyCount(count);
        console.log(`Direct database check: Found ${count} companies`);
        
        // If we have companies in DB but not in UI, there might be an RLS or query issue
        if (count && count > 0 && companies.length === 0) {
          toast({
            title: "Data Access Issue",
            description: `Found ${count} companies in database, but they're not appearing in UI. This may be a permissions issue.`,
            variant: "default"
          });
        }
      }
    } catch (e: any) {
      console.error('Exception checking companies:', e);
    } finally {
      setIsCheckingDb(false);
    }
  };

  const handleRepair = async () => {
    try {
      await onRepair();
      setRepairSuccess(true);
      setRepairMessage('Repair completed successfully');
      toast({
        title: "Success",
        description: "Company associations have been repaired.",
        variant: "default"
      });
      // After repair, check the database again
      setTimeout(checkDatabaseCompanies, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to repair company associations.",
        variant: "destructive"
      });
    }
  };

  // Run the database check when the component mounts
  useEffect(() => {
    checkDatabaseCompanies();
  }, []);

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
  
  // Debug companies array
  console.log('CompaniesSection received companies:', companies);
  
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
        
        {companyCount !== null && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              Database check: <strong>{companyCount}</strong> companies exist in the database.
              {companyCount > 0 ? " You may have a permission issue." : " Creating a default company may help."}
            </p>
          </div>
        )}
        
        <div className="space-y-2 max-w-md mx-auto">
          <Button 
            onClick={handleRepair} 
            disabled={isRepairing} 
            className="w-full"
          >
            {isRepairing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Repairing...
              </>
            ) : 'Repair Company Associations'}
          </Button>
          
          <Button
            variant="outline"
            onClick={checkDatabaseCompanies}
            disabled={isCheckingDb}
            className="w-full"
          >
            {isCheckingDb ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : 'Check Database'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="w-full"
          >
            Refresh Data
          </Button>
        </div>
        
        <p className="text-sm text-gray-400 mt-4">
          The repair function will create a default company if none exist and fix user-company relationships.
        </p>
        
        {repairSuccess && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md max-w-md mx-auto">
            {repairMessage}
          </div>
        )}
      </div>
    );
  }
  
  return view === 'grid' 
    ? <CompaniesGrid companies={companies} />
    : <CompaniesTable companies={companies} />;
};

export default CompaniesSection;
