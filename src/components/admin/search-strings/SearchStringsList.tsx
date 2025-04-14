
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useSearchStringAdmin } from './hooks/useSearchStringAdmin';
import SearchBar from './SearchBar';
import SearchStringsTable from './SearchStringsTable';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringDetailDialog from '../../customer/search-strings/SearchStringDetailDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Database, Bug, User, Users, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSearchStringsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debugMode, setDebugMode] = useState(true); // Default to true to show debug info
  const [dbCheckResults, setDbCheckResults] = useState<any>(null);
  const [userQueryResult, setUserQueryResult] = useState<any>(null);
  const [specificUserSearchStrings, setSpecificUserSearchStrings] = useState<any>(null);
  const [specificUserEmail, setSpecificUserEmail] = useState<string>('s.naeb@flh-mediadigital.de');
  const [isPerformingCheck, setIsPerformingCheck] = useState(false);
  const [activeTab, setActiveTab] = useState("strings");
  
  const {
    searchStrings,
    isLoading,
    isRefreshing,
    companyNames,
    userEmails,
    selectedSearchString,
    isDetailOpen,
    fetchAllSearchStrings,
    markAsProcessed,
    handleCreateProject,
    handleViewDetails,
    setIsDetailOpen,
    checkSpecificUser,
    error
  } = useSearchStringAdmin();

  // Function to directly check the database for search strings
  const checkDatabase = async () => {
    try {
      setIsPerformingCheck(true);
      console.log('Performing direct database check for search strings');
      const { data, error, count } = await supabase
        .from('search_strings')
        .select('*', { count: 'exact' });
        
      if (error) {
        console.error('Error in direct database check:', error);
        setDbCheckResults({ error: error.message });
        return;
      }
      
      console.log(`Direct database check found ${count} search strings`);
      setDbCheckResults({ 
        count, 
        sample: data?.slice(0, 3) || [],
        message: `Direct database query found ${count} search strings`
      });
    } catch (err: any) {
      console.error('Exception in direct database check:', err);
      setDbCheckResults({ error: err.message });
    } finally {
      setIsPerformingCheck(false);
    }
  };

  // Function to directly check for the specific user
  const checkUserDirectly = async () => {
    try {
      setIsPerformingCheck(true);
      console.log(`Checking user directly in database: ${specificUserEmail}`);
      
      // First find the user by email
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('*')
        .eq('email', specificUserEmail)
        .limit(1);
        
      if (userError) {
        console.error('Error finding user in database:', userError);
        setUserQueryResult({ error: userError.message });
        return;
      }

      if (!userData || userData.length === 0) {
        console.error(`User with email ${specificUserEmail} not found in database`);
        setUserQueryResult({ error: `User with email ${specificUserEmail} not found in the database` });
        return;
      }
      
      const user = userData[0];
      console.log(`Found user in database: ${user.email} (User ID: ${user.user_id})`);
      setUserQueryResult({ 
        user,
        message: `Found user: ${user.email} (User ID: ${user.user_id}, Company ID: ${user.company_id})`
      });
      
      // Now directly query all search strings for this user
      console.log(`Direct query for search strings with user_id = ${user.user_id}`);
      const { data: stringsData, error: stringsError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('user_id', user.user_id);
        
      if (stringsError) {
        console.error('Error fetching user search strings from database:', stringsError);
        setSpecificUserSearchStrings({ error: stringsError.message });
        return;
      }
      
      console.log(`Found ${stringsData?.length || 0} search strings for user ${specificUserEmail} via direct query`);
      setSpecificUserSearchStrings({
        strings: stringsData,
        count: stringsData?.length || 0,
        message: `Found ${stringsData?.length || 0} search strings for user ${specificUserEmail}`
      });
    } catch (err: any) {
      console.error('Exception in direct user check:', err);
      setUserQueryResult({ error: err.message });
    } finally {
      setIsPerformingCheck(false);
    }
  };

  // Function to check a specific user by email
  const handleCheckSpecificUser = async () => {
    setIsPerformingCheck(true);
    console.log(`Using hook to check search strings for user: ${specificUserEmail}`);
    await checkSpecificUser(specificUserEmail);
    setIsPerformingCheck(false);
  };

  // Filter search strings based on search term
  const filteredSearchStrings = searchStrings?.filter(item => {
    if (!searchTerm) return true;
    
    const companyName = item.company_id ? (companyNames[item.company_id] || '') : '';
    const userEmail = userEmails[item.user_id] || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      companyName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      (item.type === 'recruiting' ? 'Recruiting' : 'Lead Generation').toLowerCase().includes(searchLower) ||
      (item.input_text && item.input_text.toLowerCase().includes(searchLower)) ||
      (item.generated_string && item.generated_string.toLowerCase().includes(searchLower)) ||
      (item.input_url && item.input_url.toLowerCase().includes(searchLower)) ||
      (item.user_id && item.user_id.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return <SearchStringsLoading />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Search Strings</CardTitle>
          <CardDescription>
            Manage search strings created by customers
            {searchStrings?.length > 0 && ` (${searchStrings.length} total)`}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setDebugMode(!debugMode)} size="sm">
            {debugMode ? "Hide Debug" : "Show Debug"}
          </Button>
          <Button variant="default" onClick={() => setActiveTab(activeTab === "strings" ? "debug" : "strings")} size="sm">
            {activeTab === "strings" ? "Debug Tools" : "Search Strings"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="strings">Search Strings</TabsTrigger>
            <TabsTrigger value="debug">Debug Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strings">
            <SearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onRefresh={fetchAllSearchStrings}
              isRefreshing={isRefreshing}
              userEmailToCheck={specificUserEmail}
              setUserEmailToCheck={setSpecificUserEmail}
              onCheckUser={handleCheckSpecificUser}
            />
            
            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Search Strings</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {filteredSearchStrings && filteredSearchStrings.length > 0 ? (
              <SearchStringsTable 
                searchStrings={filteredSearchStrings}
                companyNames={companyNames}
                userEmails={userEmails}
                onViewDetails={handleViewDetails}
                onMarkAsProcessed={markAsProcessed}
                onCreateProject={handleCreateProject}
              />
            ) : (
              <SearchStringsEmptyState 
                searchTerm={searchTerm} 
                hasStrings={searchStrings?.length > 0} 
                onReset={() => setSearchTerm('')}
                onRefresh={fetchAllSearchStrings}
              />
            )}
          </TabsContent>
          
          <TabsContent value="debug">
            <div className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Debug Tools</AlertTitle>
                <AlertDescription>
                  Use these tools to diagnose issues with search strings retrieval.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">User Lookup</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Input 
                      value={specificUserEmail} 
                      onChange={(e) => setSpecificUserEmail(e.target.value)}
                      placeholder="Enter user email"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleCheckSpecificUser}
                      disabled={isPerformingCheck}
                    >
                      {isPerformingCheck ? 'Checking...' : 'Check via Admin'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={checkUserDirectly}
                      disabled={isPerformingCheck}
                    >
                      {isPerformingCheck ? 'Checking...' : 'Direct DB Check'}
                    </Button>
                  </div>
                </div>
                
                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">Database Diagnostics</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={checkDatabase}
                      disabled={isPerformingCheck}
                    >
                      {isPerformingCheck ? 'Checking...' : 'Check All Search Strings'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={fetchAllSearchStrings}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh via Hook'}
                    </Button>
                  </div>
                </div>
                
                {userQueryResult && (
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-2">User Query Results</h3>
                    {userQueryResult.error ? (
                      <div className="text-red-500">{userQueryResult.error}</div>
                    ) : (
                      <>
                        <div className="text-green-600">{userQueryResult.message}</div>
                        {userQueryResult.user && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">User details:</div>
                            <pre className="bg-slate-100 p-2 mt-1 rounded text-xs overflow-x-auto max-h-40">
                              {JSON.stringify(userQueryResult.user, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {specificUserSearchStrings && (
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-2">User's Search Strings</h3>
                    {specificUserSearchStrings.error ? (
                      <div className="text-red-500">{specificUserSearchStrings.error}</div>
                    ) : (
                      <>
                        <div className="text-green-600">{specificUserSearchStrings.message}</div>
                        {specificUserSearchStrings.strings?.length > 0 ? (
                          <div className="mt-2">
                            <div className="text-sm font-medium">Search string details:</div>
                            <pre className="bg-slate-100 p-2 mt-1 rounded text-xs overflow-x-auto max-h-40">
                              {JSON.stringify(specificUserSearchStrings.strings[0], null, 2)}
                            </pre>
                            <div className="mt-1 text-sm">
                              <strong>Statuses:</strong> {specificUserSearchStrings.strings.map(s => s.status).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-amber-500">No search strings found for this user</div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {dbCheckResults && (
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-2">Database Check Results</h3>
                    {dbCheckResults.error ? (
                      <div className="text-red-500">{dbCheckResults.error}</div>
                    ) : (
                      <>
                        <div className="text-green-600">{dbCheckResults.message}</div>
                        {dbCheckResults.sample?.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">Sample data:</div>
                            <pre className="bg-slate-100 p-2 mt-1 rounded text-xs overflow-x-auto max-h-40">
                              {JSON.stringify(dbCheckResults.sample, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {selectedSearchString && (
        <SearchStringDetailDialog
          searchString={selectedSearchString}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </Card>
  );
};

export default AdminSearchStringsList;
