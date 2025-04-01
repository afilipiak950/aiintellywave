
import { useState, useEffect } from 'react';
import { checkCustomerTableAccess } from '@/services/revenue/check-permissions';

export function useCheckPermissions() {
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const result = await checkCustomerTableAccess();
        setPermissions(result);
      } catch (err: any) {
        setError(err.message || 'Failed to check permissions');
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  return { permissions, loading, error };
}
