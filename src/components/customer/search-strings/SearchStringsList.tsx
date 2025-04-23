
import React, { useState, useEffect } from 'react';
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import SearchStringItem from './SearchStringItem';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringDetailDialog from './SearchStringDetailDialog';
import { useSearchStringHandlers } from './hooks/useSearchStringHandlers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  const { searchStrings, isLoading, refetch } = useSearchStrings();
  const [isRetrying, setIsRetrying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const { 
    selectedString, 
    isDialogOpen, 
    handleOpenDetail, 
    handleCloseDetail,
    handleUpdateSearchString,
    handleDelete,
    handleCancel,
    handleRetry,
    cancelingId,
  } = useSearchStringHandlers({ 
    refetch, 
    onError 
  });

  // Check for localStorage error on mount
  useEffect(() => {
    const storedError = localStorage.getItem('searchStrings_error');
    if (storedError) {
      setLocalError(storedError);
      
      // Pass the error up to the parent component
      if (onError && typeof onError === 'function') {
        onError(storedError);
      }
    }
    
    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'searchStrings_error' && e.newValue) {
        setLocalError(e.newValue);
        if (onError && typeof onError === 'function') {
          onError(e.newValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [onError]);

  // Handler for manual refresh attempts
  const handleManualRefresh = async () => {
    setIsRetrying(true);
    try {
      // Clear error first
      localStorage.removeItem('searchStrings_error');
      localStorage.removeItem('searchStrings_error_details');
      localStorage.removeItem('auth_policy_error');
      setLocalError(null);
      
      if (onError) {
        onError(null);
      }
      
      await refetch();
    } catch (error) {
      console.error('Error refreshing search strings:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle logout and login again
  const handleLogoutAndLogin = async () => {
    try {
      // Clear errors first
      localStorage.removeItem('searchStrings_error');
      localStorage.removeItem('searchStrings_error_details');
      localStorage.removeItem('auth_policy_error');
      
      await signOut();
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // If sign out fails, try to navigate directly
      navigate('/login');
    }
  };

  if (isLoading) {
    return <SearchStringsLoading />;
  }

  if (localError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Verbindungsproblem</AlertTitle>
        <AlertDescription className="flex flex-col">
          <span>{localError}</span>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              onClick={handleLogoutAndLogin} 
              className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm"
            >
              Abmelden und erneut anmelden
            </Button>
            <Button 
              onClick={handleManualRefresh} 
              variant="outline"
              className="px-3 py-1 rounded text-sm flex items-center gap-1"
              disabled={isRetrying}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} /> 
              {isRetrying ? 'Lade...' : 'Verbindung wiederherstellen'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (searchStrings.length === 0) {
    return <SearchStringsEmptyState />;
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Ihre Search Strings</h2>
      
      <div>
        {searchStrings.map((searchString) => (
          <SearchStringItem 
            key={searchString.id} 
            searchString={searchString} 
            onOpenDetail={handleOpenDetail}
            onDelete={handleDelete}
            onCancel={handleCancel}
            onRetry={handleRetry}
            cancelingId={cancelingId}
          />
        ))}
      </div>
      
      {selectedString && (
        <SearchStringDetailDialog
          searchString={selectedString}
          open={isDialogOpen}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateSearchString}
        />
      )}
    </div>
  );
};

export default SearchStringsList;
