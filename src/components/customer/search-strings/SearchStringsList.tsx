
import React, { useState } from 'react';
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import SearchStringItem from './SearchStringItem';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchStringDetailDialog from './SearchStringDetailDialog';
import { SearchString } from '@/hooks/search-strings/search-string-types';

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  const { searchStrings, isLoading, refetch } = useSearchStrings();
  const [selectedString, setSelectedString] = useState<SearchString | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Handler für manuelle Aktualisierung
  const handleManualRefresh = async () => {
    setIsRetrying(true);
    try {
      localStorage.removeItem('searchStrings_error');
      if (onError) onError(null);
      await refetch();
    } catch (error) {
      console.error('Error refreshing search strings:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Detail-Dialog öffnen
  const handleOpenDetail = (searchString: SearchString) => {
    setSelectedString(searchString);
    setIsDialogOpen(true);
  };

  // Detail-Dialog schließen
  const handleCloseDetail = () => {
    setIsDialogOpen(false);
    setSelectedString(null);
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="w-full h-40 rounded-lg bg-muted animate-pulse"></div>
      </div>
    );
  }

  if (searchStrings.length === 0) {
    return <SearchStringsEmptyState />;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Ihre Search Strings</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRetrying}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Aktualisiere...' : 'Aktualisieren'}
        </Button>
      </div>
      
      <div className="space-y-4">
        {searchStrings.map((searchString) => (
          <SearchStringItem 
            key={searchString.id} 
            searchString={searchString} 
            onOpenDetail={handleOpenDetail}
          />
        ))}
      </div>
      
      {selectedString && (
        <SearchStringDetailDialog
          searchString={selectedString}
          open={isDialogOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default SearchStringsList;
