
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckDbCount = () => {
  const [counts, setCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const results: {[key: string]: number} = {};
      
      // Get profiles count
      const { count: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profilesError) throw profilesError;
      results.profiles = profilesCount || 0;
      
      // Get customers count
      const { count: customersCount, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      if (customersError) throw customersError;
      results.customers = customersCount || 0;
      
      // Get company_users count
      const { count: companyUsersCount, error: companyUsersError } = await supabase
        .from('company_users')
        .select('*', { count: 'exact', head: true });
      
      if (companyUsersError) throw companyUsersError;
      results.company_users = companyUsersCount || 0;
      
      // Get user_roles count
      const { count: userRolesCount, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      
      if (userRolesError) throw userRolesError;
      results.user_roles = userRolesCount || 0;
      
      setCounts(results);
    } catch (err: any) {
      console.error('Error fetching counts:', err);
      setError(err.message || 'Error fetching database counts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center">
          <Database className="mr-2 h-6 w-6" /> 
          Database Counts Check
        </h1>
        <div className="space-x-4">
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
          </Button>
          <Button 
            onClick={fetchCounts} 
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Counts
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Current Database Counts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Direct counts from each table in the database
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-lg">Loading counts...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(counts).map(([table, count]) => (
                  <div key={table} className="bg-gray-50 p-6 rounded-lg border">
                    <div className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                      {table.replace('_', ' ')}
                    </div>
                    <div className="text-3xl font-bold">{count}</div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Analysis</h3>
                <p className="text-blue-700">
                  {counts.profiles > 0 
                    ? `Found ${counts.profiles} profiles which represents your total user base.` 
                    : 'No profiles found in the database.'}
                  {counts.profiles > counts.company_users && counts.company_users > 0 
                    ? ` ${counts.profiles - counts.company_users} users don't have company associations.` 
                    : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckDbCount;
