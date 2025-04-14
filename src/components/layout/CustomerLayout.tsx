
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

const CustomerLayout = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [featuresUpdated, setFeaturesUpdated] = useState(0); // Counter to force re-renders

  // Force sidebar update when company features change
  useEffect(() => {
    if (!user) return;

    console.log('Setting up customer layout feature change subscription for user:', user.id);
    
    // Check if the user has a company association
    const checkCompanyAssociation = async () => {
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error checking company association:', error);
          if (error.code === 'PGRST116') {
            setError('Your user account is not associated with a company. Please contact support.');
          } else {
            setError(`Database error: ${error.message}`);
          }
          return;
        }
        
        if (!data.company_id) {
          setError('Missing company association. Please contact support.');
          return;
        }
        
        // Clear any previous errors
        setError(null);
      } catch (err) {
        console.error('Exception checking company association:', err);
        setError('An unexpected error occurred. Please contact support.');
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
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
