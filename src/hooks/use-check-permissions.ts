
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useCheckPermissions() {
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        console.log('Checking permissions...');
        
        // First check if the current user is authenticated
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
          console.error('Authentication error:', authError);
          throw new Error('Authentication required: ' + (authError?.message || 'User not logged in'));
        }
        
        // Try to query the customers table directly
        const { data: testData, error: testError } = await supabase
          .from('customers')
          .select('id')
          .limit(1);
          
        if (testError) {
          console.error('Error checking customer table access:', testError);
          throw new Error('Permission denied: ' + testError.message);
        }
        
        console.log('Permission check result - can access customers:', !!testData);
        
        // Try to access customer_revenue table
        const { data: revenueData, error: revenueError } = await supabase
          .from('customer_revenue')
          .select('id')
          .limit(1);
        
        // Return comprehensive result
        const result = {
          hasAccess: true,
          canRead: !!testData,
          canReadRevenue: !revenueError && !!revenueData,
          userDetails: authData.user,
          message: 'You have access to the customer tables'
        };
        
        setPermissions(result);
        
        // Only show toast if there's an access problem
        if (!result.canRead || !result.canReadRevenue) {
          toast({
            title: 'Permission Warning',
            description: 'Limited access to customer data. Some features may not work.',
            variant: 'default'
          });
        }
      } catch (err: any) {
        console.error('Error in useCheckPermissions:', err);
        
        const errorMsg = err.message || 'Failed to check permissions';
        setError(errorMsg);
        
        toast({
          title: 'Permission Check Failed',
          description: errorMsg,
          variant: 'destructive'
        });
        
        // Set permission object with error info
        setPermissions({
          hasAccess: false,
          error: errorMsg
        });
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  return { permissions, loading, error };
}
