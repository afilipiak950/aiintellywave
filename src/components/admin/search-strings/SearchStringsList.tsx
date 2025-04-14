
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
import { AlertCircle, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const AdminSearchStringsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debugMode, setDebugMode] = useState(true); // Default to true to show debug info
  const [dbCheckResults, setDbCheckResults] = useState<any>(null);
  
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
    setIsDetailOpen
  } = useSearchStringAdmin();

  // Function to directly check the database for search strings
  const checkDatabase = async () => {
    try {
      const { data, error, count } = await supabase
        .from('search_strings')
        .select('*', { count: 'exact' });
        
      if (error) {
        setDbCheckResults({ error: error.message });
        return;
      }
      
      setDbCheckResults({ 
        count, 
        sample: data?.slice(0, 3) || [],
        message: `Direct database query found ${count} search strings`
      });
    } catch (err) {
      setDbCheckResults({ error: err.message });
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Search Strings</CardTitle>
          <CardDescription>
            Manage search strings created by customers
            {searchStrings?.length > 0 && ` (${searchStrings.length} total)`}
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => setDebugMode(!debugMode)} size="sm">
          {debugMode ? "Hide Debug" : "Show Debug"}
        </Button>
      </CardHeader>
      <CardContent>
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={fetchAllSearchStrings}
          isRefreshing={isRefreshing}
        />
        
        {debugMode && (
          <Alert className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Debug Information</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 text-xs font-mono">
                <div>Total search strings: {searchStrings?.length || 0}</div>
                <div>Filtered search strings: {filteredSearchStrings?.length || 0}</div>
                <div>User emails loaded: {Object.keys(userEmails).length}</div>
                <div>Companies loaded: {Object.keys(companyNames).length}</div>
                
                {dbCheckResults && (
                  <div className="mt-2 border-t pt-2">
                    <div className="font-bold">Database Check Results:</div>
                    {dbCheckResults.error ? (
                      <div className="text-red-500">{dbCheckResults.error}</div>
                    ) : (
                      <>
                        <div>{dbCheckResults.message}</div>
                        {dbCheckResults.sample?.length > 0 && (
                          <div>
                            <div>Sample data:</div>
                            <pre className="bg-slate-100 p-2 mt-1 rounded text-[10px] overflow-x-auto max-h-40">
                              {JSON.stringify(dbCheckResults.sample, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fetchAllSearchStrings()}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Force Refresh
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={checkDatabase}
                    className="flex items-center gap-1"
                  >
                    <Database className="h-3 w-3" /> Check Database
                  </Button>
                </div>
              </div>
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
