
import React, { useState, useEffect } from 'react';
import { useSearchStringAdmin } from './hooks/useSearchStringAdmin';
import SearchBar from './SearchBar';
import SearchStringsTable from './SearchStringsTable';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringDetailDialog from '../../customer/search-strings/SearchStringDetailDialog';
import { supabase } from '@/integrations/supabase/client';
import ConnectionStatusAlert from './components/ConnectionStatusAlert';
import DatabaseCountAlert from './components/DatabaseCountAlert';
import ErrorAlert from './components/ErrorAlert';
import EmptyStateAlert from './components/EmptyStateAlert';
import DebugInfoAlert from './components/DebugInfoAlert';
import { ConnectionStatusType } from './types';

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
      
      <ConnectionStatusAlert 
        connectionStatus={connectionStatus}
        checkDatabaseConnection={checkDatabaseConnection}
        handleRetryFetch={handleRetryFetch}
        isRefreshing={isRefreshing}
      />
      
      <DatabaseCountAlert 
        rawCount={rawCount}
        searchStringsLength={searchStrings.length}
        checkRawSearchStringCount={checkRawSearchStringCount}
        isCountChecking={isCountChecking}
      />
      
      <ErrorAlert 
        error={error}
        handleRetryFetch={handleRetryFetch}
        isRefreshing={isRefreshing}
      />
      
      <EmptyStateAlert 
        searchStringsLength={searchStrings.length}
        error={error}
        connectionStatus={connectionStatus}
        handleRetryFetch={handleRetryFetch}
        isRefreshing={isRefreshing}
      />
      
      <DebugInfoAlert debugInfo={debugInfo} />
      
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
