
import React, { useState } from 'react';
import AdminSearchStringsList from '@/components/admin/search-strings/SearchStringsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, Database } from 'lucide-react';

const AdminSearchStrings: React.FC = () => {
  const [userEmail, setUserEmail] = useState('s.naeb@flh-mediadigital.de');
  const [userData, setUserData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState("strings");

  const checkUserCompanySettings = async () => {
    setIsChecking(true);
    try {
      // Check for the user
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
      
      // Check if company has search strings enabled
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
      
      // Get user's search strings
      const { data: searchStrings, error: stringsError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('user_id', user.user_id);
        
      if (stringsError) {
        setUserData({ 
          user, 
          company,
          error: `Found user and company but error getting search strings: ${stringsError.message}` 
        });
        return;
      }
      
      setUserData({
        user,
        company,
        searchStrings: searchStrings || [],
        message: `Found user ${user.email} with ${searchStrings?.length || 0} search strings in company ${company.name}`
      });
    } catch (err: any) {
      setUserData({ error: err.message });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Search Strings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="strings">Search Strings</TabsTrigger>
            <TabsTrigger value="debug">Debug Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strings" className="mt-6">
            <AdminSearchStringsList />
          </TabsContent>
          
          <TabsContent value="debug" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User and Company Diagnostics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
    </div>
  );
};

export default AdminSearchStrings;
