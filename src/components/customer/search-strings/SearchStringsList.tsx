
import React, { useState, useEffect } from 'react';
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import SearchStringItem from './SearchStringItem';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchStringDetailDialog from './SearchStringDetailDialog';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { supabase } from '@/integrations/supabase/client';

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  const { searchStrings, isLoading, refetch } = useSearchStrings();
  const [selectedString, setSelectedString] = useState<SearchString | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Handle errors from local storage
  useEffect(() => {
    const storedError = localStorage.getItem('searchStrings_error');
    if (storedError) {
      setLocalError(storedError);
      if (onError) onError(storedError);
    }
  }, [onError]);

  // Directly fetch search strings if recursion error is detected
  useEffect(() => {
    if (localStorage.getItem('auth_policy_error') === 'true') {
      console.log('Detected auth policy error, using direct fetch method');
      handleDirectFetch();
    }
  }, []);

  // Direct fetch method to bypass RLS
  const handleDirectFetch = async () => {
    try {
      setIsRetrying(true);
      setLocalError(null);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        setLocalError('Not authenticated');
        return;
      }

      // Try to use edge function if available
      try {
        const { data, error } = await supabase.functions.invoke('get-user-search-strings', {
          body: { userId: session.session.user.id }
        });
        
        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message);
        }
        
        if (data && data.searchStrings) {
          console.log('Successfully fetched search strings via edge function');
          if (refetch) {
            await refetch();
          }
          return;
        }
      } catch (e) {
        console.warn('Edge function failed, will try direct query next:', e);
      }
    } catch (err: any) {
      console.error('Error in direct fetch:', err);
      setLocalError(err.message || 'Failed to fetch search strings');
      if (onError) onError(err.message || 'Failed to fetch search strings');
    } finally {
      setIsRetrying(false);
    }
  };

  // Handler for manual refresh
  const handleManualRefresh = async () => {
    setIsRetrying(true);
    setLocalError(null);
    localStorage.removeItem('searchStrings_error');
    localStorage.removeItem('searchStrings_error_details');
    
    if (onError) onError(null);
    
    try {
      // First try direct fetch to bypass potential RLS issues
      await handleDirectFetch();
      
      // Then try normal refetch
      if (refetch) {
        await refetch();
      }
    } catch (error: any) {
      console.error('Error refreshing search strings:', error);
      setLocalError(error.message || 'Failed to refresh search strings');
      if (onError) onError(error.message || 'Failed to refresh search strings');
    } finally {
      setIsRetrying(false);
    }
  };

  // Open detail dialog
  const handleOpenDetail = (searchString: SearchString) => {
    setSelectedString(searchString);
    setIsDialogOpen(true);
  };

  // Close detail dialog
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
      
      {localError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{localError}</span>
            <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRetrying}>
              <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {!localError && searchStrings.length === 0 ? (
        <SearchStringsEmptyState />
      ) : (
        <div className="space-y-4">
          {searchStrings.map((searchString) => (
            <SearchStringItem 
              key={searchString.id} 
              searchString={searchString} 
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      )}
      
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
