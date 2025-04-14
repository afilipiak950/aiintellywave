
import React, { useState } from 'react';
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

const AdminSearchStringsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
      (item.generated_string && item.generated_string.toLowerCase().includes(searchLower))
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
          <CardDescription>Manage search strings created by customers</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={fetchAllSearchStrings}
          isRefreshing={isRefreshing}
        />
        
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
          <SearchStringsEmptyState searchTerm={searchTerm} />
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
