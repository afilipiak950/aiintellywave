
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastRetryTime, setLastRetryTime] = useState<number>(0);

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
        
        // Test connection to verify we don't have the recursive policy issue
        try {
          // Use a safe query that doesn't trigger the recursive policy
          const { data: testData, error: testError } = await supabase
            .from('companies')
            .select('id')
            .limit(1);
            
          if (testError) {
            if (testError.message.includes('infinite recursion') || testError.code === '42P17') {
              setError('Datenbankrichtlinienfehler: Um dieses Problem zu beheben, bitte melden Sie sich ab und wieder an.');
            } else {
              setError(`Ein Datenbankfehler ist aufgetreten: ${testError.message}`);
            }
          }
        } catch (connectionError: any) {
          console.error('Error testing database connection:', connectionError);
          setError(`Verbindungsfehler: ${connectionError.message || 'Unbekannter Fehler'}`);
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error checking user authentication:', error);
        setError(`Ein Fehler ist aufgetreten: ${error.message || 'Bitte versuchen Sie es später erneut'}`);
        setIsLoading(false);
      }
    };

    // Add a small delay before checking authentication to ensure auth is fully initialized
    const timer = setTimeout(() => {
      // Only check if we haven't retried too recently (prevent spam)
      const now = Date.now();
      if (now - lastRetryTime > 3000) { // 3 seconds minimum between retries
        checkUserAuthentication();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate, retryCount]);

  // Add a retry button function with rate limiting
  const handleRetry = () => {
    const now = Date.now();
    if (now - lastRetryTime > 3000) { // 3 seconds minimum between retries
      setRetryCount(prev => prev + 1);
      setLastRetryTime(now);
      setError(null);
      setIsLoading(true);
    } else {
      toast({
        title: "Bitte warten",
        description: "Zu viele Versuche in kurzer Zeit. Bitte warten Sie einen Moment.",
        variant: "destructive"
      });
    }
  };

  const renderError = () => {
    // Check for specific RLS error
    const isInfiniteRecursionError = error?.includes('infinite recursion') || 
                                     error?.includes('Datenbankrichtlinienfehler');
    
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{isInfiniteRecursionError ? "Datenbank-Richtlinienfehler" : "Fehler"}</AlertTitle>
        <AlertDescription className="flex flex-col">
          <span>{error}</span>
          <div className="mt-4">
            {isInfiniteRecursionError ? (
              <>
                <p className="mb-2">Zur Behebung dieses Problems:</p>
                <ol className="list-decimal pl-4 mb-4 space-y-1">
                  <li>Melden Sie sich vom System ab</li>
                  <li>Melden Sie sich wieder an</li>
                  <li>Wenn das Problem weiterhin besteht, löschen Sie den Browser-Cache</li>
                </ol>
              </>
            ) : null}
            <button 
              onClick={handleRetry} 
              className="text-white bg-destructive/90 hover:bg-destructive px-3 py-1 mt-2 rounded text-sm self-start flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Verbindung wiederherstellen
            </button>
          </div>
        </AlertDescription>
      </Alert>
    );
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
      
      {error && renderError()}
      
      <div className="grid grid-cols-1 gap-6">
        {!error && (
          <>
            <SearchStringCreator onError={setError} />
            <SearchStringsList onError={setError} />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchStringsPage;
