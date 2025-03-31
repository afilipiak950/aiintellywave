import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Users, Building, Search } from "lucide-react";
import { diagnoseCompanyUsers, repairCompanyUsers } from '@/hooks/customers/utils/company-users-debug';
import CustomerList from '@/components/ui/customer/CustomerList';
import CustomerLoadingState from '@/components/ui/customer/CustomerLoadingState';
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';
import { Customer as CustomerListType } from '@/types/customer';

const Customers = () => {
  const { user } = useAuth();
  const { customers, loading, errorMsg, fetchCustomers, debugInfo, searchTerm, setSearchTerm } = useCustomers();
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairingCompanyUsers, setIsRepairingCompanyUsers] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const handleUserRoleRepair = async () => {
    try {
      setIsRepairing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "No authenticated user found",
          variant: "destructive"
        });
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
        return;
      }
      
      // Create a default company for admin if needed
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .maybeSingle();
        
      if (!existingCompany) {
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            name: 'Admin Company',
            description: 'Default company for admin users',
            contact_email: user.email
          });
          
        if (companyError && !companyError.message.includes('violates foreign key constraint')) {
          console.error('Failed to create company:', companyError);
          toast({
            title: "Warning",
            description: "Created admin role but couldn't create company. Refresh to try again.",
            variant: "default"
          });
        }
      }
      
      // Add admin to company_users with first company
      const companyId = existingCompany?.id || '00000000-0000-0000-0000-000000000000';
      const { error: companyUserError } = await supabase
        .from('company_users')
        .upsert({ 
          user_id: user.id, 
          company_id: companyId,
          is_admin: true,
          role: 'admin',
          email: user.email
        }, { onConflict: 'user_id,company_id' });
        
      if (companyUserError && !companyUserError.message.includes('violates foreign key constraint')) {
        console.error('Failed to add admin to company_users:', companyUserError);
      }
      
      toast({
        title: "Success",
        description: "Admin role repaired. Refreshing data...",
        variant: "default"
      });
      
      // Refresh all data
      await fetchCustomers();
      
      // If still having issues, reload the page
      if (customers.length === 0) {
        toast({
          title: "Reloading page",
          description: "Still having issues. Reloading page in 1 second...",
          variant: "default"
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error repairing admin role:', error);
      toast({
        title: "Error",
        description: "Failed to repair admin role: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleCompanyUsersRepair = async () => {
    if (!user) return;

    try {
      setIsRepairingCompanyUsers(true);
      
      // Create debug info object
      const localDebugInfo = {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
      };
      
      // Run the repair
      const updatedDebug = await repairCompanyUsers(
        user.id, 
        user.email, 
        localDebugInfo
      );
      
      console.log("Company users repair result:", updatedDebug.companyUsersRepair);
      
      if (updatedDebug.companyUsersRepair?.status === 'success') {
        toast({
          title: "Success",
          description: "Company user association repaired. Refreshing data...",
          variant: "default"
        });
      } else if (updatedDebug.companyUsersRepair?.status === 'exists') {
        toast({
          title: "Information",
          description: "Company user association already exists.",
          variant: "default"
        });
      } else {
        toast({
          title: "Warning",
          description: "Repair attempt completed with status: " + updatedDebug.companyUsersRepair?.status,
          variant: "default"
        });
      }
      
      // Refresh customers data
      await fetchCustomers();
      
    } catch (error) {
      console.error("Error repairing company users:", error);
      toast({
        title: "Error",
        description: "Failed to repair company users: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setIsRepairingCompanyUsers(false);
    }
  };

  const renderDebugInfo = () => {
    if (!debugInfo) return null;
    
    return (
      <div className="mt-8 p-4 border rounded bg-slate-50">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Debug Information
        </h2>
        <div className="text-sm mb-4">
          <p><strong>User ID:</strong> {debugInfo.userId || 'Not available'}</p>
          <p><strong>Email:</strong> {debugInfo.userEmail || 'Not available'}</p>
          <p><strong>Admin Status:</strong> {debugInfo.isAdmin ? 'Yes' : 'No'}</p>
          <p><strong>Special Admin:</strong> {debugInfo.isSpecialAdmin ? 'Yes' : 'No'}</p>
          <p><strong>Companies Count:</strong> {debugInfo.companiesCount || 0}</p>
          <p><strong>Company Users Count:</strong> {debugInfo.companyUsersCount || 0}</p>
          
          {/* Company Users diagnostics */}
          {debugInfo.companyUsersDiagnostics && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Company Users Diagnostics
              </h3>
              <p><strong>Status:</strong> {debugInfo.companyUsersDiagnostics.status}</p>
              {debugInfo.companyUsersDiagnostics.totalCount !== undefined && (
                <p><strong>Total Count:</strong> {debugInfo.companyUsersDiagnostics.totalCount}</p>
              )}
              {debugInfo.companyUsersDiagnostics.error && (
                <p className="text-red-600"><strong>Error:</strong> {debugInfo.companyUsersDiagnostics.error}</p>
              )}
              
              {/* Button to repair company users */}
              <div className="mt-2">
                <Button
                  onClick={handleCompanyUsersRepair}
                  disabled={isRepairingCompanyUsers}
                  variant="outline"
                  size="sm"
                >
                  {isRepairingCompanyUsers ? 'Repairing...' : 'Repair Company Users'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Company Users repair result */}
          {debugInfo.companyUsersRepair && (
            <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded">
              <h3 className="font-medium">Company Users Repair Result</h3>
              <p><strong>Status:</strong> {debugInfo.companyUsersRepair.status}</p>
              {debugInfo.companyUsersRepair.message && (
                <p><strong>Message:</strong> {debugInfo.companyUsersRepair.message}</p>
              )}
              {debugInfo.companyUsersRepair.error && (
                <p className="text-red-600"><strong>Error:</strong> {debugInfo.companyUsersRepair.error}</p>
              )}
            </div>
          )}
        </div>
        <div className="text-xs overflow-auto max-h-96 border p-2 bg-slate-100 rounded">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
    );
  };

  const formattedCustomers: CustomerListType[] = customers.map(customer => ({
    ...customer,
    status: customer.status === 'inactive' ? 'inactive' : 'active'
  }));

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers Management</h1>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={view === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button 
            variant={view === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('table')}
          >
            Table
          </Button>
          
          <Button 
            onClick={() => fetchCustomers()} 
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2 ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Status panel */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-medium mb-4">Customer Data Status</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <p>Status: {loading ? 'Loading...' : 'Ready'}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${errorMsg ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <p>Database Connection: {errorMsg ? 'Error' : 'Connected'}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${customers?.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <p>Customer Records: {customers?.length || 0}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${(debugInfo?.companyUsersCount || 0) > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <p>Company-User Associations: {debugInfo?.companyUsersCount || 0}</p>
          </div>
        </div>
        
        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Customers
            </h3>
            <p className="mb-4">{errorMsg}</p>
            <Button 
              onClick={handleUserRoleRepair}
              disabled={isRepairing}
              variant="destructive"
              className="mt-2"
            >
              {isRepairing ? 'Repairing...' : 'Repair Admin Access'}
            </Button>
          </div>
        )}
      </div>

      {/* Search - only show if we have data */}
      {!loading && !errorMsg && customers.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      {/* Customer List - This is what was missing and we're adding now */}
      {loading ? (
        <CustomerLoadingState />
      ) : errorMsg ? (
        <CustomerErrorState 
          errorMsg={errorMsg}
          onRetry={fetchCustomers}
        />
      ) : (
        <>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
              <p className="text-gray-500 mb-4">
                There are no customers in the system or you don't have permission to view them.
              </p>
              <Button onClick={handleCompanyUsersRepair} disabled={isRepairingCompanyUsers}>
                {isRepairingCompanyUsers ? 'Repairing...' : 'Repair Customer Associations'}
              </Button>
            </div>
          ) : (
            <CustomerList 
              customers={formattedCustomers}
              searchTerm={searchTerm}
              view={view}
            />
          )}
        </>
      )}
      
      {/* Debug info at the bottom */}
      <div className="mt-8">
        <details>
          <summary className="cursor-pointer font-medium text-gray-700 p-2 border rounded hover:bg-gray-50">
            Show Debug Information
          </summary>
          {renderDebugInfo()}
        </details>
      </div>
    </div>
  );
};

export default Customers;
