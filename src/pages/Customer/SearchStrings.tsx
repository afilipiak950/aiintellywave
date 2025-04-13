
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true); // Default to true to avoid initial feature not available message
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    // Clear any previous errors when the component mounts
    setError(null);
    
    const fetchCompanyInfo = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user's company
        console.log('Fetching company information for user:', user.id);
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('company_id, role')
          .eq('user_id', user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching company_users:', userError);
          
          // Try to get company ID from profiles table as fallback
          console.log('Attempting to get company ID from profiles table');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*') // Changed from 'company_id' to '*' since 'company_id' doesn't exist in profiles
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            
            // Create a demo company ID
            const demoCompanyId = uuidv4();
            console.log('Using demo company ID (valid UUID):', demoCompanyId);
            setCompanyId(demoCompanyId);
            
            // Show a more user-friendly error message
            setError('Your account is not properly connected to a company. Please contact support.');
            toast({
              title: "Error fetching company information",
              description: "Using demo mode with generated company ID",
              variant: "destructive"
            });
          } 
          else {
            // The profiles table doesn't have company_id column, check if we need to use some other data
            console.log('Profile data found but no company ID present:', profileData);
            
            // Create a demo company ID since we couldn't find a legitimate one
            const demoCompanyId = uuidv4();
            console.log('No company ID in profile, using demo ID:', demoCompanyId);
            setCompanyId(demoCompanyId);
            
            // Show a more user-friendly error message
            setError('Your account is not properly connected to a company. Please contact support.');
          }
        } else if (userData?.company_id) {
          console.log('Found company ID in company_users:', userData.company_id);
          setCompanyId(userData.company_id);
          setError(null);
          
          // Check if feature is enabled for this company
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('enable_search_strings')
            .eq('id', userData.company_id)
            .single();
          
          if (companyError) {
            console.error('Error fetching company:', companyError);
            // Default to enabled if we can't check
            setIsFeatureEnabled(true);
          } else {
            setIsFeatureEnabled(companyData?.enable_search_strings !== false);
          }
        } else {
          // No company ID found in company_users
          console.log('No company ID found in company_users');
          const demoCompanyId = uuidv4();
          setCompanyId(demoCompanyId);
          setError('Your account is not properly connected to a company. Please contact support.');
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
        // Generate a valid UUID as fallback
        const demoCompanyId = uuidv4();
        console.log('Generated fallback UUID:', demoCompanyId);
        setCompanyId(demoCompanyId);
        // Default to enabled in case of errors
        setIsFeatureEnabled(true);
        setError('An unexpected error occurred. Please try again later or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay before fetching company info to ensure auth is fully initialized
    const timer = setTimeout(() => {
      fetchCompanyInfo();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate, toast, retryCount]);

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

  if (!isFeatureEnabled) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Search Strings</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-60 p-6">
            <h2 className="text-lg font-semibold mb-2">Feature Not Available</h2>
            <p className="text-muted-foreground text-center max-w-md">
              The search string generation feature is not enabled for your account. 
              Please contact your administrator to enable this feature.
            </p>
          </CardContent>
        </Card>
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
              className="text-white bg-destructive/90 hover:bg-destructive px-3 py-1 mt-2 rounded text-sm self-start"
            >
              Retry Connection
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <SearchStringCreator companyId={companyId || ''} onError={setError} />
        <SearchStringsList companyId={companyId || ''} onError={setError} />
      </div>
    </div>
  );
};

export default SearchStringsPage;
