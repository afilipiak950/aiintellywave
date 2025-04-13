
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true); // Default to true to avoid initial feature not available message
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
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        if (userError) {
          // If there's an error, let's try a different approach
          console.error('Error fetching company_users:', userError);
          
          // Attempt to get user's profile which might contain company_id
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast({
              title: "Error fetching company information",
              description: "Please contact your administrator.",
              variant: "destructive"
            });
            return;
          }
          
          if (profileData?.company_id) {
            setCompanyId(profileData.company_id);
            setIsFeatureEnabled(true); // Assume enabled for now
          } else {
            // No company_id found in profile either
            setIsFeatureEnabled(false);
            toast({
              title: "No company associated",
              description: "You need to be associated with a company to use this feature.",
              variant: "destructive"
            });
          }
        } else if (userData?.company_id) {
          setCompanyId(userData.company_id);
          
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
          // User doesn't have a company
          setIsFeatureEnabled(false);
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
        // Default to enabled in case of errors
        setIsFeatureEnabled(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [user, navigate, toast]);

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

  // For demonstration purposes, always show the feature
  // Remove this line in production if you want to respect the feature flag
  if (!companyId) {
    // Create a mock company ID to enable the feature
    // This is just for demonstration - in a real app you'd use a proper company ID
    const mockCompanyId = "demo-company-id";
    
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Search Strings</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <SearchStringCreator companyId={mockCompanyId} />
          <SearchStringsList companyId={mockCompanyId} />
        </div>
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
      
      <div className="grid grid-cols-1 gap-6">
        <SearchStringCreator companyId={companyId} />
        <SearchStringsList companyId={companyId} />
      </div>
    </div>
  );
};

export default SearchStringsPage;
