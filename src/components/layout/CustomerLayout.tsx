
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { CompanyAssociationAlert } from '@/components/features/CompanyAssociationAlert';

const CustomerLayout = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [featuresUpdated, setFeaturesUpdated] = useState(0); // Counter to force re-renders
  const [isRepairing, setIsRepairing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Force sidebar update when company features change
  useEffect(() => {
    if (!user) return;

    console.log('Setting up customer layout feature change subscription for user:', user.id);
    
    // Check if the user has a company association
    const checkCompanyAssociation = async () => {
      try {
        setError(null);
        
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id, is_primary_company')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking company association:', error);
          if (error.code === 'PGRST116') {
            setError('Your user account is not associated with a company. Please contact support or try repairing your account.');
          } else {
            setError(`Database error: ${error.message}`);
          }
          return;
        }
        
        if (!data || data.length === 0) {
          setError('Your user account is not associated with a company. Please contact support or try repairing your account.');
          setCompanyId(null);
          return;
        }
        
        // Find primary company or use the first one
        const primaryCompany = data.find(cu => cu.is_primary_company) || data[0];
        
        if (!primaryCompany.company_id) {
          setError('Missing company association. Please contact support or try repairing your account.');
          setCompanyId(null);
          return;
        }
        
        // Clear any previous errors and set the company ID
        setError(null);
        setCompanyId(primaryCompany.company_id);
      } catch (err) {
        console.error('Exception checking company association:', err);
        setError('An unexpected error occurred. Please contact support or try repairing your account.');
        setCompanyId(null);
      }
    };
    
    checkCompanyAssociation();
    
    // Add a subscription to ensure feature changes are reflected
    const channel = supabase
      .channel('customer-layout-features')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_features' 
        }, 
        (payload) => {
          console.log('Company features changed in CustomerLayout:', payload);
          // Increment counter to force re-render
          setFeaturesUpdated(prev => prev + 1);
          
          // Show toast to inform the user
          toast({
            title: "Features Updated",
            description: "Your available features have been updated. Please refresh if menu items don't appear.",
            variant: "default"
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to repair the user's company association
  const handleRepairAssociation = async () => {
    if (!user || isRepairing) return;
    
    setIsRepairing(true);
    
    try {
      toast({
        title: "Repairing Account",
        description: "Attempting to repair your company association...",
      });
      
      // Call the Edge Function to repair the account
      const { data, error } = await supabase.functions.invoke('repair-company-associations');
      
      if (error) {
        console.error('Error repairing company association:', error);
        toast({
          title: "Repair Failed",
          description: error.message || "Failed to repair company association.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Repair result:', data);
      
      if (data?.status === 'success') {
        toast({
          title: "Repair Successful",
          description: data.message || "Your company association has been repaired. Refreshing...",
        });
        
        // Force reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Repair Failed",
          description: data?.message || "Failed to repair company association.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Exception repairing company association:', err);
      toast({
        title: "Repair Failed",
        description: "An unexpected error occurred during repair.",
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar role="customer" key={`sidebar-${featuresUpdated}`} />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRepairAssociation}
                    disabled={isRepairing}
                  >
                    {isRepairing ? 'Repairing...' : 'Repair Account'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <CompanyAssociationAlert companyId={companyId} loading={isRepairing} onRepair={handleRepairAssociation} />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
