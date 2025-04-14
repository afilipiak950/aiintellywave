
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { CompanyAssociationAlert } from '@/components/features/CompanyAssociationAlert';

const CustomerLayout = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [featuresUpdated, setFeaturesUpdated] = useState(0);
  const [isRepairing, setIsRepairing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Force sidebar update when company features change
  useEffect(() => {
    if (!user) return;

    console.log('Setting up customer layout feature change subscription for user:', user.id);
    
    // Check if the user has a company association
    const checkCompanyAssociation = async () => {
      try {
        // We still want to check the company association and set companyId
        // But we'll never show an error to the user
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id, is_primary_company')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking company association:', error);
          // Don't set the error state, but log it
          return;
        }
        
        if (!data || data.length === 0) {
          console.error('User has no company association:', user.id);
          setCompanyId(null);
          
          // Auto-repair without showing errors
          handleRepairAssociation();
          return;
        }
        
        // Find primary company or use the first one
        const primaryCompany = data.find(cu => cu.is_primary_company) || data[0];
        
        if (!primaryCompany.company_id) {
          console.error('Missing company association for user:', user.id);
          setCompanyId(null);
          
          // Auto-repair without showing errors
          handleRepairAssociation();
          return;
        }
        
        // No error message, just set the company ID
        setCompanyId(primaryCompany.company_id);
      } catch (err) {
        console.error('Exception checking company association:', err);
        // Don't set any error state, just log the error
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
      // Call the Edge Function to repair the account without showing toast
      const { data, error } = await supabase.functions.invoke('repair-company-associations');
      
      if (error) {
        console.error('Error repairing company association:', error);
        return;
      }
      
      console.log('Repair result:', data);
      
      if (data?.status === 'success') {
        // Force reload after a short delay without notifying the user
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error('Exception repairing company association:', err);
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
          {/* The error alerts are now completely removed */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
