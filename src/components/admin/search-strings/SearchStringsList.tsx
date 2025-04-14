
import React, { useState, useEffect } from 'react';
import { useSearchStringAdmin } from './hooks/useSearchStringAdmin';
import SearchBar from './SearchBar';
import SearchStringsTable from './SearchStringsTable';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringDetailDialog from '../../customer/search-strings/SearchStringDetailDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, RefreshCw, Database, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Define a proper enum type for connection status
enum ConnectionStatusType {
  CHECKING = 'checking',
  CONNECTED = 'connected',
  ERROR = 'error'
}

const AdminSearchStringsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specificUserEmail, setSpecificUserEmail] = useState<string>('s.naeb@flh-mediadigital.de');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [rawCount, setRawCount] = useState<number | null>(null);
  const [isCountChecking, setIsCountChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>(ConnectionStatusType.CHECKING);
  
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
    debugUser,
    error
  } = useSearchStringAdmin();

  // Initial fetch on component mount
  useEffect(() => {
    console.log('AdminSearchStringsList mounted, fetching search strings...');
    checkDatabaseConnection();
    fetchAllSearchStrings();
    checkRawSearchStringCount();
  }, [fetchAllSearchStrings]);

  // Check database connection
  const checkDatabaseConnection = async () => {
    setConnectionStatus(ConnectionStatusType.CHECKING);
    try {
      const { data, error } = await supabase
        .from('search_strings')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection check failed:', error);
        setConnectionStatus(ConnectionStatusType.ERROR);
        return false;
      }
      setConnectionStatus(ConnectionStatusType.CONNECTED);
      return true;
    } catch (error) {
      console.error('Unexpected error checking database connection:', error);
      setConnectionStatus(ConnectionStatusType.ERROR);
      return false;
    }
  };

  // Handle checking a specific user
  const handleCheckSpecificUser = async () => {
    await checkSpecificUser(specificUserEmail);
  };

  // Debug function to directly check a user's ID in the database
  const handleDebugUser = async () => {
    setDebugInfo(null);
    const debugData = await debugUser(specificUserEmail);
    setDebugInfo(debugData);
  };

  // Try refresh when no search strings are found
  const handleRetryFetch = () => {
    console.log('Manually refreshing search strings...');
    checkDatabaseConnection();
    fetchAllSearchStrings();
    checkRawSearchStringCount();
  };

  // Direct check of search_strings table count
  const checkRawSearchStringCount = async () => {
    setIsCountChecking(true);
    try {
      // First do a count query
      const { count, error: countError } = await supabase
        .from('search_strings')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error counting search strings:', countError);
        
        // Try alternative approach by fetching all IDs
        const { data, error: dataError } = await supabase
          .from('search_strings')
          .select('id');
          
        if (dataError) {
          console.error('Error fetching search string IDs:', dataError);
        } else {
          setRawCount(data.length);
        }
      } else {
        setRawCount(count);
      }
    } catch (err) {
      console.error('Unexpected error counting search strings:', err);
    } finally {
      setIsCountChecking(false);
    }
  };

  // Filter search strings based on search term
  const filteredSearchStrings = searchStrings?.filter(item => {
    if (!searchTerm) return true;
    
    const companyName = item.company_id ? (companyNames[item.company_id] || '') : '';
    const userEmail = item.user_id ? (userEmails[item.user_id] || userEmails[item.user_id?.toLowerCase()] || '') : '';
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
    <div className="w-full">
      <div className="mb-6 w-full">
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
      </div>
      
      {connectionStatus === ConnectionStatusType.ERROR && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            <p>Failed to connect to the database. This could be due to network issues or database configuration.</p>
            <div className="flex items-center gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkDatabaseConnection}
                disabled={connectionStatus === ConnectionStatusType.CHECKING}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${connectionStatus === ConnectionStatusType.CHECKING ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetryFetch}
                disabled={isRefreshing || connectionStatus === ConnectionStatusType.CHECKING}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry Fetch
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {rawCount !== null && (
        <Alert variant={rawCount === 0 ? "destructive" : "default"} className="mb-6">
          <Database className="h-4 w-4" />
          <AlertTitle>Database Search Strings Count</AlertTitle>
          <AlertDescription>
            <p className="font-medium">
              Raw database query found {rawCount} search strings.
              {searchStrings.length !== rawCount && 
               ` There is a discrepancy between raw count (${rawCount}) and loaded strings (${searchStrings.length}).`}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkRawSearchStringCount}
              disabled={isCountChecking}
              className="mt-2 flex items-center gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCountChecking ? 'animate-spin' : ''}`} />
              Recheck Count
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Search Strings</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetryFetch}
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry Loading
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {searchStrings?.length === 0 && !error && connectionStatus !== ConnectionStatusType.ERROR && (
        <Alert className="mb-6">
          <Database className="h-4 w-4" />
          <AlertTitle>No Search Strings Found</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>No search strings were loaded. This might be due to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>No search strings in the database</li>
                <li>Permission issues with the search_strings table</li>
                <li>Data formatting issues</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 flex items-center gap-1" 
                onClick={handleRetryFetch}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <Alert variant={debugInfo.error ? "destructive" : "default"} className="mb-6">
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
                <div className="font-semibold mt-2">Search Strings Associated:</div>
                <div>Exact matches: {debugInfo.searchStrings?.filter(s => s.user_id === debugInfo.user?.user_id).length || 0}</div>
                <div>Case-insensitive matches: {debugInfo.searchStrings?.length || 0}</div>
                
                {debugInfo.caseInsensitiveMatches && (
                  <div className="text-orange-500 font-semibold">
                    Found {debugInfo.caseInsensitiveMatches.length} strings with case-sensitivity issues 
                    (This suggests a case sensitivity issue with the user ID)
                  </div>
                )}
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
                    <summary className="cursor-pointer text-blue-500">Show search strings with ID comparison</summary>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 mt-1">
                      {JSON.stringify(debugInfo.allStrings, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="w-full border rounded-md overflow-hidden">
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
      </div>
      
      {selectedSearchString && (
        <SearchStringDetailDialog
          searchString={selectedSearchString}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminSearchStringsList;
