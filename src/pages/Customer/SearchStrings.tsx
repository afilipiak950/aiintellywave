
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user's company
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('company_id, companies:company_id(id, enable_search_strings)')
          .eq('user_id', user.id)
          .single();
        
        if (userError) throw userError;
        
        if (userData?.company_id && userData?.companies) {
          setCompanyId(userData.company_id);
          setIsFeatureEnabled(userData.companies.enable_search_strings || false);
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [user, navigate]);

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

  if (!companyId) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Search Strings</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-60 p-6">
            <h2 className="text-lg font-semibold mb-2">No Company Found</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You must be associated with a company to use this feature.
              Please contact your administrator.
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
      
      <div className="grid grid-cols-1 gap-6">
        <SearchStringCreator companyId={companyId} />
        <SearchStringsList companyId={companyId} />
      </div>
    </div>
  );
};

export default SearchStringsPage;
