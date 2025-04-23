
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isFixingRLS, setIsFixingRLS] = useState(false);
  
  // Check for stored errors when component mounts
  useEffect(() => {
    const storedError = localStorage.getItem('searchStrings_error');
    if (storedError) {
      setError(storedError);
    }
  }, []);
  
  // This function attempts to fix recursive RLS issues by temporarily working around them
  const handleFixRLS = async () => {
    setIsFixingRLS(true);
    try {
      // Check if we're authenticated
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw new Error('Not authenticated');
      }
      
      // First try to use the service function to directly fix auth issues
      try {
        await supabase.functions.invoke('check-rls', {});
      } catch (e) {
        console.warn('RLS check function failed:', e);
      }
      
      // Clear error indicators
      localStorage.removeItem('auth_policy_error');
      localStorage.removeItem('searchStrings_error');
      localStorage.removeItem('searchStrings_error_details');
      
      setError(null);
      window.location.reload(); // Reload page to apply fixes
    } catch (err: any) {
      console.error('Failed to fix RLS issues:', err);
    } finally {
      setIsFixingRLS(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Anmeldung erforderlich</AlertTitle>
          <AlertDescription>
            Bitte melden Sie sich an, um diese Seite zu nutzen.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Search Strings</h1>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <div>{error}</div>
            {error.includes('infinite recursion') && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFixRLS}
                  disabled={isFixingRLS}
                >
                  {isFixingRLS ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Fixing...
                    </>
                  ) : (
                    'Fix Database Access'
                  )}
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <SearchStringCreator onError={setError} />
        </Card>
        <Card className="p-6">
          <SearchStringsList onError={setError} />
        </Card>
      </div>
    </div>
  );
};

export default SearchStringsPage;
