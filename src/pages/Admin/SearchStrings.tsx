
import React, { useState, useEffect } from 'react';
import AdminSearchStringsList from '@/components/admin/search-strings/SearchStringsList';
import PublicSearchStringsList from '@/components/admin/search-strings/PublicSearchStringsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, Database, Loader2, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminSearchStrings: React.FC = () => {
  const [userEmail, setUserEmail] = useState('s.naeb@flh-mediadigital.de');
  const [userData, setUserData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState("public");
  const [databaseStatus, setDatabaseStatus] = useState<{isChecking: boolean, count: number | null, error: string | null}>({
    isChecking: false,
    count: null,
    error: null
  });

  useEffect(() => {
    checkDatabaseConnection();
  }, []);
  
  const checkDatabaseConnection = async () => {
    setDatabaseStatus(prev => ({...prev, isChecking: true, error: null}));
    try {
      const { data, error } = await supabase
        .from('search_strings')
        .select('id', { count: 'exact', head: false });
      
      if (error) {
        console.error('Database connection check error:', error);
        setDatabaseStatus({
          isChecking: false,
          count: null,
          error: `Database connection error: ${error.message}`
        });
        return;
      }
      
      console.log('Database connection successful:', data);
      setDatabaseStatus({
        isChecking: false,
        count: data.length,
        error: null
      });
    } catch (err: any) {
      console.error('Unexpected database connection error:', err);
      setDatabaseStatus({
        isChecking: false,
        count: null,
        error: `Unexpected error: ${err.message || 'Unknown error'}`
      });
    }
  };

  const checkUserCompanySettings = async () => {
    setIsChecking(true);
    try {
      const { data: users, error: userError } = await supabase
        .from('company_users')
        .select('*')
        .eq('email', userEmail);

      if (userError) {
        setUserData({ error: userError.message });
        return;
      }

      if (!users || users.length === 0) {
        setUserData({ error: `No user found with email ${userEmail}` });
        return;
      }

      const user = users[0];
      
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.company_id)
        .single();
        
      if (companyError) {
        setUserData({ 
          user, 
          error: `Found user but error getting company: ${companyError.message}` 
        });
        return;
      }
      
      const { data: searchStrings, error: stringsError } = await supabase
        .from('search_strings')
        .select('*');
        
      if (stringsError) {
        setUserData({ 
          user, 
          company,
          error: `Found user and company but error getting search strings: ${stringsError.message}` 
        });
        return;
      }
      
      const userSearchStrings = searchStrings ? searchStrings.filter(s => s.user_id === user.user_id) : [];
      
      setUserData({
        user,
        company,
        searchStrings: userSearchStrings,
        allSearchStrings: searchStrings,
        message: `Found user ${user.email} with ${userSearchStrings.length || 0} search strings in company ${company.name}`
      });
    } catch (err: any) {
      setUserData({ error: err.message });
    } finally {
      setIsChecking(false);
    }
  };

  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  
  const checkTotalSearchStrings = async () => {
    setIsCountLoading(true);
    try {
      const { count, error } = await supabase
        .from('search_strings')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.error('Error getting search string count:', error);
      } else {
        setTotalCount(count);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from('search_strings')
        .select('id');
        
      if (fetchError) {
        console.error('Error fetching search strings for count:', fetchError);
      } else if (data) {
        setTotalCount(data.length);
      }
    } catch (err: any) {
      console.error('Error checking total search strings:', err);
    } finally {
      setIsCountLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 w-full max-w-full">
      {databaseStatus.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            {databaseStatus.error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkDatabaseConnection}
                disabled={databaseStatus.isChecking}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${databaseStatus.isChecking ? 'animate-spin' : ''}`} />
                Retry Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
          <TabsTrigger value="public">Public API</TabsTrigger>
          <TabsTrigger value="strings">Search Strings</TabsTrigger>
          <TabsTrigger value="debug">Debug Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="public" className="mt-6 w-full">
          <div className="bg-muted/40 rounded-lg p-3 mb-4 text-sm">
            <p className="font-medium">Public Access Mode: All Search Strings</p>
            <p className="text-muted-foreground">
              This view uses a public Edge Function to display all search strings without authentication.
              Use the search and filter tools to find specific entries.
            </p>
          </div>
          <PublicSearchStringsList />
        </TabsContent>
        
        <TabsContent value="strings" className="mt-6 w-full">
          <div className="bg-muted/40 rounded-lg p-3 mb-4 text-sm">
            <p className="font-medium">Admin Mode: All Search Strings</p>
            <p className="text-muted-foreground">Showing all search strings from all users. Use the search and filter tools to find specific entries.</p>
            
            {databaseStatus.count !== null ? (
              <p className="mt-1 text-xs">Database check found {databaseStatus.count} search strings total.</p>
            ) : totalCount !== null ? (
              <p className="mt-1 text-xs">Database currently contains {totalCount} search strings total.</p>
            ) : (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto mt-1 text-xs"
                onClick={checkTotalSearchStrings}
                disabled={isCountLoading}
              >
                {isCountLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Checking count...
                  </>
                ) : (
                  'Check total search strings in database'
                )}
              </Button>
            )}
          </div>
          <AdminSearchStringsList />
        </TabsContent>
        
        <TabsContent value="debug" className="mt-6 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>User and Company Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mb-2 flex items-center gap-1" 
                  onClick={checkDatabaseConnection}
                  disabled={databaseStatus.isChecking}
                >
                  <Database className="h-3.5 w-3.5" />
                  Check Database Connection
                </Button>
                
                {databaseStatus.error ? (
                  <Alert variant="destructive" className="mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Database Error</AlertTitle>
                    <AlertDescription>{databaseStatus.error}</AlertDescription>
                  </Alert>
                ) : databaseStatus.count !== null ? (
                  <Alert className="mb-3">
                    <Database className="h-4 w-4" />
                    <AlertTitle>Database Connected</AlertTitle>
                    <AlertDescription>Found {databaseStatus.count} search strings in the database.</AlertDescription>
                  </Alert>
                ) : null}
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter user email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={checkUserCompanySettings} 
                    disabled={isChecking}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    {isChecking ? "Checking..." : "Check User"}
                  </Button>
                </div>
                
                {userData && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    {userData.error ? (
                      <div className="text-red-500">Error: {userData.error}</div>
                    ) : (
                      <div className="space-y-4">
                        {userData.message && (
                          <div className="text-green-600 font-semibold">{userData.message}</div>
                        )}
                        
                        {userData.user && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2">User Details</h3>
                            <div className="bg-white p-2 rounded text-xs">
                              <div><span className="font-semibold">ID:</span> {userData.user.user_id}</div>
                              <div><span className="font-semibold">Email:</span> {userData.user.email}</div>
                              <div><span className="font-semibold">Role:</span> {userData.user.role}</div>
                              <div><span className="font-semibold">Company ID:</span> {userData.user.company_id}</div>
                              <div><span className="font-semibold">Is Admin:</span> {userData.user.is_admin ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        )}
                        
                        {userData.company && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Company Details</h3>
                            <div className="bg-white p-2 rounded text-xs">
                              <div><span className="font-semibold">ID:</span> {userData.company.id}</div>
                              <div><span className="font-semibold">Name:</span> {userData.company.name}</div>
                              <div className="font-semibold text-blue-600">
                                Search Strings Enabled: {userData.company.enable_search_strings ? 'Yes ✓' : 'No ✗'}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {userData.searchStrings && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Search Strings</h3>
                            {userData.searchStrings.length > 0 ? (
                              <div className="bg-white p-2 rounded text-xs">
                                <div><span className="font-semibold">Count:</span> {userData.searchStrings.length}</div>
                                <div><span className="font-semibold">Statuses:</span> {userData.searchStrings.map(s => s.status).join(', ')}</div>
                                <details>
                                  <summary className="cursor-pointer text-blue-500 mt-2">View Raw Data</summary>
                                  <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                                    {JSON.stringify(userData.searchStrings, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            ) : (
                              <div className="text-amber-500">No search strings found for this user</div>
                            )}
                          </div>
                        )}
                        
                        {userData.allSearchStrings && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2">All Search Strings in Database</h3>
                            <div className="bg-white p-2 rounded text-xs">
                              <div><span className="font-semibold">Total Count:</span> {userData.allSearchStrings.length}</div>
                              <details>
                                <summary className="cursor-pointer text-blue-500 mt-2">View Sample Data</summary>
                                <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                                  {JSON.stringify(userData.allSearchStrings.slice(0, 5), null, 2)}
                                </pre>
                              </details>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSearchStrings;
