
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    // Clear any previous errors when the component mounts
    setError(null);
    
    const checkUserAuthentication = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        console.log('User authenticated:', user.id);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user authentication:', error);
        setError('An error occurred. Please try again later.');
        setIsLoading(false);
      }
    };

    // Add a small delay before checking authentication to ensure auth is fully initialized
    const timer = setTimeout(() => {
      checkUserAuthentication();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate, retryCount]);

  // Add a retry button function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Search Strings</h1>
        </div>
        <div className="w-full h-40 rounded-lg bg-muted animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Search Strings</h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col">
            <span>{error}</span>
            <button 
              onClick={handleRetry} 
              className="text-white bg-destructive/90 hover:bg-destructive px-3 py-1 mt-2 rounded text-sm self-start flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry Connection
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <SearchStringCreator onError={setError} />
        <SearchStringsList onError={setError} />
      </div>
    </div>
  );
};

export default SearchStringsPage;
