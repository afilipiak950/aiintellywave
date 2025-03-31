
import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

// Fix the handleUserRoleRepair function to use the imported toast
const Customers = () => {
  const { user } = useAuth();
  const { customers, loading, errorMsg, fetchCustomers, debugInfo } = useCustomers();

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const handleUserRoleRepair = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      // Force add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: user.id, role: 'admin' }, 
          { onConflict: 'user_id,role' });
          
      if (roleError) {
        console.error('Failed to add admin role:', roleError);
        toast({
          title: "Error",
          description: "Failed to repair admin role. Please try again.",
          variant: "destructive"
        });
      } else {
        // Add admin to company_users
        const { error: companyUserError } = await supabase
          .from('company_users')
          .upsert({ 
            user_id: user.id, 
            company_id: '00000000-0000-0000-0000-000000000000', // dummy ID, will be replaced
            is_admin: true,
            role: 'admin',
            email: user.email
          });
          
        if (companyUserError && !companyUserError.message.includes('violates foreign key constraint')) {
          console.error('Failed to add admin to company_users:', companyUserError);
        }
        
        toast({
          title: "Success",
          description: "Admin role repaired. Refreshing data...",
          variant: "default"
        });
        
        // Refresh all data
        fetchCustomers();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error repairing admin role:', error);
    }
  };

  // Add debug info display
  const renderDebugInfo = () => {
    if (!debugInfo) return null;
    
    return (
      <div className="mt-8 p-4 border rounded bg-slate-50">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1>Customers Page</h1>
      <p>This shows customer data based on your role.</p>
      
      {errorMsg && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <p><strong>Error:</strong> {errorMsg}</p>
          <button 
            onClick={handleUserRoleRepair}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
            Repair Admin Role
          </button>
        </div>
      )}
      
      <div className="mt-4">
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Total customers: {customers?.length || 0}</p>
      </div>
      
      {renderDebugInfo()}
    </div>
  );
};

export default Customers;
