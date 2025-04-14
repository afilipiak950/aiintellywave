
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useSearchStringAdmin } from './hooks/useSearchStringAdmin';
import SearchBar from './SearchBar';
import SearchStringsTable from './SearchStringsTable';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringDetailDialog from '../../customer/search-strings/SearchStringDetailDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminSearchStringsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specificUserEmail, setSpecificUserEmail] = useState<string>('s.naeb@flh-mediadigital.de');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
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

  // Handle checking a specific user
  const handleCheckSpecificUser = async () => {
    await checkSpecificUser(specificUserEmail);
  };

  // Debug function to directly check a user's ID in the database
  const handleDebugUser = async () => {
    try {
      setDebugInfo(null);
      
      // First get user ID from email
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('user_id, email, company_id')
        .eq('email', specificUserEmail)
        .limit(1);

      if (userError) {
        setDebugInfo({ error: `Error finding user: ${userError.message}` });
        return;
      }

      if (!userData || userData.length === 0) {
        setDebugInfo({ error: `User with email ${specificUserEmail} not found in company_users table` });
        return;
      }

      const userId = userData[0].user_id;
      
      // Now check for search strings with this ID
      const { data: stringsData, error: stringsError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('user_id', userId);
        
      if (stringsError) {
        setDebugInfo({ 
          user: userData[0],
          error: `Error finding search strings: ${stringsError.message}`
        });
        return;
      }

      // Also check for ALL search strings
      const { data: allStrings, error: allStringsError } = await supabase
        .from('search_strings')
        .select('*')
        .limit(100);

      // Check for auth.users record
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      setDebugInfo({
        user: userData[0],
        searchStrings: stringsData || [],
        authUser: authUser?.user || null,
        allStringsCount: allStrings?.length || 0,
        allStrings: allStrings?.map(s => ({ id: s.id, user_id: s.user_id, input_source: s.input_source }))
      });
      
    } catch (err: any) {
      setDebugInfo({ error: `Unexpected error: ${err.message}` });
    }
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
      <CardHeader>
        <CardTitle>Search Strings</CardTitle>
        <CardDescription>
          Manage search strings created by customers
          {searchStrings?.length > 0 && ` (${searchStrings.length} total)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={fetchAllSearchStrings}
          isRefreshing={isRefreshing}
          userEmailToCheck={specificUserEmail}
          setUserEmailToCheck={setSpecificUserEmail}
          onCheckUser={handleCheckSpecificUser}
          onDebugUser={handleDebugUser}
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
        
        {debugInfo && (
          <Alert variant={debugInfo.error ? "destructive" : "default"} className="my-4">
            <Info className="h-4 w-4" />
            <AlertTitle>User Debug Information</AlertTitle>
            <AlertDescription className="mt-2">
              {debugInfo.error ? (
                <div className="text-red-500">{debugInfo.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">User Email:</span> {debugInfo.user?.email}</div>
                  <div><span className="font-semibold">User ID:</span> {debugInfo.user?.user_id}</div>
                  <div><span className="font-semibold">Company ID:</span> {debugInfo.user?.company_id}</div>
                  <div><span className="font-semibold">Search Strings Associated:</span> {debugInfo.searchStrings?.length || 0}</div>
                  <div><span className="font-semibold">Auth Account:</span> {debugInfo.authUser ? 'Found' : 'Not Found'}</div>
                  <div><span className="font-semibold">Total Search Strings in DB:</span> {debugInfo.allStringsCount}</div>
                  
                  {debugInfo.searchStrings && debugInfo.searchStrings.length > 0 ? (
                    <div>
                      <div className="font-semibold mb-1">User's Search Strings:</div>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                        {JSON.stringify(debugInfo.searchStrings.map(s => ({ id: s.id, type: s.type, source: s.input_source })), null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-amber-600">No search strings found with this user ID</div>
                  )}
                  
                  {debugInfo.allStrings && debugInfo.allStrings.length > 0 && (
                    <details>
                      <summary className="cursor-pointer text-blue-500">Show all search strings sample</summary>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 mt-1">
                        {JSON.stringify(debugInfo.allStrings.slice(0, 10), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
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
