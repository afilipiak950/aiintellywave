
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchStringsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastRetryTime, setLastRetryTime] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('checking');

  useEffect(() => {
    // Clear any previous errors when the component mounts
    setError(null);
    
    const checkConnection = async () => {
      setConnectionStatus('checking');
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        
        setIsLoading(true);
        console.log('User authenticated:', user.id);
        
        // Test connection with a simple query
        const { data: testData, error: testError } = await supabase
          .from('search_strings')
          .select('count(*)')
          .limit(1)
          .single();
          
        if (testError) {
          console.error('Connection test failed:', testError);
          setConnectionStatus('error');
          setError(`Verbindungsproblem: ${testError.message}`);
        } else {
          console.log('Connection test successful');
          setConnectionStatus('connected');
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error checking connection:', error);
        setConnectionStatus('error');
        setError(`Ein Fehler ist aufgetreten: ${error.message || 'Bitte versuchen Sie es später erneut'}`);
        setIsLoading(false);
      }
    };

    // Add a small delay before checking connection
    const timer = setTimeout(() => {
      checkConnection();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate, retryCount]);

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
      
      toast({
        title: "Abgemeldet",
        description: "Bitte melden Sie sich erneut an, um das Problem zu beheben.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // If sign out fails, try to navigate directly
      navigate('/login');
    }
  };

  // Add a retry button function with rate limiting
  const handleRetry = () => {
    const now = Date.now();
    if (now - lastRetryTime > 3000) { // 3 seconds minimum between retries
      setRetryCount(prev => prev + 1);
      setLastRetryTime(now);
      setError(null);
      localStorage.removeItem('searchStrings_error');
      localStorage.removeItem('auth_policy_error');
      setIsLoading(true);
      setConnectionStatus('checking');
    } else {
      toast({
        title: "Bitte warten",
        description: "Zu viele Versuche in kurzer Zeit. Bitte warten Sie einen Moment.",
        variant: "destructive"
      });
    }
  };

  const renderError = () => {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Verbindungsproblem</AlertTitle>
        <AlertDescription className="flex flex-col">
          <span>{error}</span>
          <div className="mt-4">
            <p className="mb-2">Zur Behebung dieses Problems:</p>
            <ol className="list-decimal pl-4 mb-4 space-y-1">
              <li>Aktualisieren Sie die Seite</li>
              <li>Falls das Problem weiterhin besteht, melden Sie sich ab und wieder an</li>
              <li>Löschen Sie den Browser-Cache</li>
            </ol>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleLogoutAndLogin} 
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm"
              >
                Abmelden und erneut anmelden
              </Button>
              <Button 
                onClick={handleRetry} 
                variant="outline"
                className="px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" /> 
                Verbindung wiederherstellen
              </Button>
            </div>
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
