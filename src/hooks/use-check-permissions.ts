
import { useState, useEffect } from 'react';
import { checkCustomerTableAccess } from '@/services/revenue/check-permissions';
import { toast } from '@/hooks/use-toast';

export function useCheckPermissions() {
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        console.log('Checking permissions...');
        const result = await checkCustomerTableAccess();
        console.log('Permission check result:', result);
        setPermissions(result);
        
        if (!result.hasAccess) {
          toast({
            title: 'Permission Error',
            description: 'You may not have permission to access the customer data.',
            variant: 'destructive'
          });
          setError('Permission denied: ' + (result.error || 'Unknown error'));
        }
      } catch (err: any) {
        console.error('Error in useCheckPermissions:', err);
        setError(err.message || 'Failed to check permissions');
        toast({
          title: 'Permission Check Failed',
          description: err.message || 'An error occurred checking your permissions',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  return { permissions, loading, error };
}
