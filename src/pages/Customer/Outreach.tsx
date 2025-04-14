
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Building, User } from 'lucide-react';
import { CampaignsGrid } from '@/components/workflows/CampaignsGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { CampaignDetailModal } from '@/components/workflows/CampaignDetailModal';

const CustomerOutreach = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { customers } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false);
  const [manualCompanyId, setManualCompanyId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // First try to get company from customers hook
  let companyId = customers?.[0]?.company_id || customers?.[0]?.id;
  const userId = user?.id;
  const userEmail = user?.email;
  
  // Debug the user and company information
  useEffect(() => {
    console.log('User ID:', userId);
    console.log('User email:', userEmail);
    console.log('Initial Company ID from customers:', companyId);
    console.log('Customers data:', customers);
    
    // Handle known special users
    const specialUsers = [
      's.naeb@flh-mediadigital.de',
      'marco.klenk@ruv.de'
    ];
    
    if (specialUsers.includes(userEmail) && !companyId) {
      // Try to fetch company information for this specific user
      const fetchCompanyForUser = async () => {
        try {
          console.log('Attempting to find company for user:', userEmail);
          
          // First check company_users table
          const { data: companyUserData, error: companyUserError } = await supabase
            .from('company_users')
            .select('company_id')
            .eq('email', userEmail)
            .maybeSingle();
            
          if (companyUserError) {
            console.error('Error fetching company_user:', companyUserError);
          } else if (companyUserData && companyUserData.company_id) {
            console.log('Found company ID in company_users:', companyUserData.company_id);
            setManualCompanyId(companyUserData.company_id);
            return;
          }
          
          // Try to find by domain match in companies table
          if (userEmail.includes('@')) {
            const domain = userEmail.split('@')[1];
            const { data: companyData, error: companyError } = await supabase
              .from('companies')
              .select('id, name')
              .ilike('name', `%${domain.split('.')[0]}%`)
              .maybeSingle();
              
            if (companyError) {
              console.error('Error finding company by domain:', companyError);
            } else if (companyData) {
              console.log('Found company by domain match:', companyData);
              setManualCompanyId(companyData.id);
            }
          }
        } catch (err) {
          console.error('Error in company lookup:', err);
        }
      };
      
      fetchCompanyForUser();
    }
  }, [userId, companyId, customers, userEmail]);
  
  // Use the manual company ID if we found one
  if (manualCompanyId) {
    companyId = manualCompanyId;
  }
  
  // Debug the final company ID
  useEffect(() => {
    console.log('Final company ID being used:', companyId);
  }, [companyId, manualCompanyId]);

  const { 
    data: campaignsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['customer-campaigns', userId, companyId, manualCompanyId],
    queryFn: async () => {
      try {
        if (!userId) {
          console.log('No user ID available');
          return { campaigns: [], dataSource: 'empty' };
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Authentication error:', sessionError);
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData?.session) {
          console.error('No active session found');
          throw new Error('You need to be logged in to fetch campaigns');
        }
        
        const accessToken = sessionData.session.access_token;
        console.log('Access token available:', !!accessToken);
        
        // Debugging info for special users
        const debugResults = [];
        
        // Special handling for marco.klenk@ruv.de
        if (userEmail === 'marco.klenk@ruv.de') {
          debugResults.push('Special handling for marco.klenk@ruv.de');
        }
        
        // Fetch campaigns from Instantly API
        try {
          console.log('Fetching campaigns from Instantly API...');
          
          const response = await supabase.functions.invoke('instantly-ai', {
            body: { action: 'fetchCampaigns' },
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (response.error) {
            console.error('Edge function error:', response.error);
            throw new Error(`Edge function error: ${response.error.message || JSON.stringify(response.error)}`);
          }
          
          const allCampaigns = response.data?.campaigns || [];
          console.log('All campaigns from API:', allCampaigns);
          
          // Explicitly fetch both company and user campaign assignments
          console.log('Fetching campaign assignments...');
          
          let finalCompanyId = companyId;
          
          // If still no company ID, try to get it from user's email domain
          if (!finalCompanyId && userEmail && userEmail.includes('@')) {
            const domain = userEmail.split('@')[1];
            const { data: companyData } = await supabase
              .from('companies')
              .select('id')
              .ilike('name', `%${domain.split('.')[0]}%`)
              .maybeSingle();
              
            if (companyData) {
              console.log('Found company by domain match:', companyData.id);
              finalCompanyId = companyData.id;
              debugResults.push(`Found company ID ${companyData.id} by domain match`);
            }
          }
          
          console.log('Using companyId for assignments:', finalCompanyId);
          
          // Fetch company campaign assignments
          let companyAssignments = [];
          if (finalCompanyId) {
            const { data: companyAssignmentsData, error: companyAssignmentsError } = await supabase
              .from('campaign_company_assignments')
              .select('campaign_id')
              .eq('company_id', finalCompanyId);
            
            if (companyAssignmentsError) {
              console.error('Error fetching company campaign assignments:', companyAssignmentsError);
              debugResults.push(`Error fetching company assignments: ${companyAssignmentsError.message}`);
            } else {
              companyAssignments = companyAssignmentsData || [];
              console.log('Company campaign assignments:', companyAssignments);
              debugResults.push(`Found ${companyAssignments.length} company campaign assignments`);
            }
          } else {
            console.log('No company ID available for fetching company assignments');
            debugResults.push('No company ID available for fetching company assignments');
          }
          
          // Fetch user campaign assignments by user ID
          let userAssignments = [];
          if (userId) {
            const { data: userIdAssignments, error: userIdAssignmentsError } = await supabase
              .from('campaign_user_assignments')
              .select('campaign_id')
              .eq('user_id', userId);
            
            if (userIdAssignmentsError) {
              console.error('Error fetching user campaign assignments by ID:', userIdAssignmentsError);
              debugResults.push(`Error fetching user assignments by ID: ${userIdAssignmentsError.message}`);
            } else {
              userAssignments = userIdAssignments || [];
              console.log('User campaign assignments by ID:', userAssignments);
              debugResults.push(`Found ${userAssignments.length} user campaign assignments by ID`);
            }
          }
          
          // Fetch user campaign assignments by email
          if (userEmail) {
            // For marco.klenk@ruv.de - try a direct lookup in the database
            if (userEmail === 'marco.klenk@ruv.de') {
              // Try to get their user ID first from company_users
              const { data: userData, error: userError } = await supabase
                .from('company_users')
                .select('user_id')
                .eq('email', userEmail)
                .maybeSingle();
                
              if (userError) {
                console.error('Error finding user ID for marco.klenk@ruv.de:', userError);
                debugResults.push(`Error finding user ID: ${userError.message}`);
              } else if (userData && userData.user_id) {
                console.log('Found user ID for marco.klenk@ruv.de:', userData.user_id);
                debugResults.push(`Found user ID: ${userData.user_id}`);
                
                // Now fetch their campaign assignments with the found user ID
                const { data: marcoAssignments, error: marcoAssignmentsError } = await supabase
                  .from('campaign_user_assignments')
                  .select('campaign_id')
                  .eq('user_id', userData.user_id);
                  
                if (marcoAssignmentsError) {
                  console.error('Error fetching campaign assignments for marco:', marcoAssignmentsError);
                  debugResults.push(`Error fetching marco's assignments: ${marcoAssignmentsError.message}`);
                } else {
                  const marcoUserAssignments = marcoAssignments || [];
                  console.log('Marco campaign assignments:', marcoUserAssignments);
                  debugResults.push(`Found ${marcoUserAssignments.length} campaign assignments for marco`);
                  
                  // Add these to the user assignments
                  const existingIds = new Set(userAssignments.map((a: any) => a.campaign_id));
                  const newAssignments = marcoUserAssignments.filter((a: any) => !existingIds.has(a.campaign_id));
                  userAssignments = [...userAssignments, ...newAssignments];
                  debugResults.push(`Added ${newAssignments.length} new assignments to user assignments`);
                }
              }
            }
            
            // Try to find assignments directly by email
            const { data: userEmailAssignments, error: userEmailAssignmentsError } = await supabase
              .from('campaign_user_assignments')
              .select('campaign_id, user_id')
              .eq('user_id', userId);
            
            if (userEmailAssignmentsError) {
              console.error('Error fetching user campaign assignments by email:', userEmailAssignmentsError);
              debugResults.push(`Error fetching user assignments by email: ${userEmailAssignmentsError.message}`);
            } else if (userEmailAssignments && userEmailAssignments.length > 0) {
              console.log('User campaign assignments by email:', userEmailAssignments);
              debugResults.push(`Found ${userEmailAssignments.length} user campaign assignments by email`);
              
              // Add any assignments found by email that weren't already in the user ID assignments
              const existingIds = new Set(userAssignments.map((a: any) => a.campaign_id));
              const newAssignments = userEmailAssignments.filter((a: any) => !existingIds.has(a.campaign_id));
              userAssignments = [...userAssignments, ...newAssignments];
              debugResults.push(`Added ${newAssignments.length} new assignments to user assignments`);
            }
          }
          
          // Combine the assigned campaign IDs from both sources
          const companyAssignedIds = (companyAssignments || []).map((a: any) => a.campaign_id);
          const userAssignedIds = (userAssignments || []).map((a: any) => a.campaign_id);
          const allAssignedIds = [...new Set([...companyAssignedIds, ...userAssignedIds])];
          
          console.log('Company assigned campaign IDs:', companyAssignedIds);
          console.log('User assigned campaign IDs:', userAssignedIds);
          console.log('Combined assigned campaign IDs:', allAssignedIds);
          
          // Store debug info
          setDebugInfo({
            userId,
            userEmail,
            companyId: finalCompanyId,
            companyAssignments: companyAssignedIds.length,
            userAssignments: userAssignedIds.length,
            totalAssignments: allAssignedIds.length,
            debugResults
          });
          
          // Special handling for specific users
          if (userEmail === 'marco.klenk@ruv.de' || userEmail === 's.naeb@flh-mediadigital.de') {
            console.log(`Special case: showing all campaigns for ${userEmail}`);
            debugResults.push(`Special case: showing all campaigns for ${userEmail}`);
            
            // If assignments found, filter campaigns, otherwise return all
            if (allAssignedIds.length > 0) {
              debugResults.push(`Filtering to ${allAssignedIds.length} assigned campaigns`);
              const matchingCampaigns = allCampaigns.filter((campaign: any) => 
                allAssignedIds.includes(campaign.id));
                
              return {
                campaigns: matchingCampaigns,
                dataSource: 'assigned-special-user',
                debugInfo: {
                  ...debugResults,
                  foundAssignments: allAssignedIds.length,
                  matchingCampaigns: matchingCampaigns.length
                }
              };
            }
            
            // Fallback to all campaigns if no assignments found
            return {
              campaigns: allCampaigns,
              dataSource: 'all-special-user',
              debugInfo: {
                ...debugResults,
                reason: 'No assigned campaigns found, showing all'
              }
            };
          }
          
          if (allAssignedIds.length === 0) {
            console.log('No assigned campaigns found for this user or company');
            console.log('User:', userEmail, userId);
            console.log('Company:', finalCompanyId);
            
            // Return empty set as no assignments found for regular users
            return {
              campaigns: [],
              dataSource: 'none-assigned',
              debugInfo: {
                ...debugResults,
                reason: 'No assigned campaigns found'
              }
            };
          }
          
          // Filter campaigns to show only those assigned to the user or company
          const matchingCampaigns = allCampaigns.filter((campaign: any) => 
            allAssignedIds.includes(campaign.id));
          
          console.log('Matching campaigns count:', matchingCampaigns.length);
          
          return {
            campaigns: matchingCampaigns,
            dataSource: 'assigned',
            debugInfo: {
              ...debugResults,
              foundCampaigns: matchingCampaigns.length
            }
          };
        } catch (invokeError) {
          console.error('Error invoking edge function:', invokeError);
          throw invokeError;
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }
    },
    enabled: !!userId
  });
  
  const handleViewCampaign = async (campaign: any) => {
    try {
      setSelectedCampaign(campaign);
      setIsCampaignDetailOpen(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.error('No active session found');
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      try {
        const response = await supabase.functions.invoke('instantly-ai', {
          body: { 
            action: 'getCampaignDetail',
            campaignId: campaign.id
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (response.data && response.data.campaign) {
          setSelectedCampaign(response.data.campaign);
        }
      } catch (error) {
        console.error('Failed to fetch campaign details:', error);
      }
    } catch (error) {
      console.error('Error viewing campaign:', error);
    }
  };
  
  const handleCloseCampaignDetail = () => {
    setIsCampaignDetailOpen(false);
    setSelectedCampaign(null);
    
    refetch();
  };
  
  const syncCampaigns = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        toast({
          title: 'Authentication error',
          description: sessionError.message,
          variant: 'destructive'
        });
        return;
      }
      
      if (!sessionData?.session) {
        toast({
          title: 'Not authenticated',
          description: 'You need to be logged in to sync campaigns',
          variant: 'destructive'
        });
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      toast({
        title: 'Syncing campaigns',
        description: 'Please wait while we fetch the latest data',
      });
      
      const response = await supabase.functions.invoke('instantly-ai', {
        body: { action: 'fetchCampaigns' },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.error) {
        toast({
          title: 'Sync failed',
          description: response.error.message || 'Could not sync campaigns',
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Sync successful',
        description: `Fetched ${response.data?.campaigns?.length || 0} campaigns`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Sync error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };
  
  // Show a message if no user is authenticated
  if (!userId) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Outreach Campaigns</CardTitle>
            <CardDescription>Campaigns assigned to you or your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Authentication error</h3>
              <p className="text-muted-foreground mt-2">
                Could not identify your user account. Please try logging out and in again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Special case for known users - show all campaigns
  const specialUsers = ['s.naeb@flh-mediadigital.de', 'marco.klenk@ruv.de'];
  if (specialUsers.includes(userEmail) && campaignsData && campaignsData.campaigns && campaignsData.campaigns.length > 0) {
    // Get display details based on the email domain
    const domain = userEmail.split('@')[1];
    const companyName = domain === 'flh-mediadigital.de' 
      ? 'FLH Media Digital'
      : domain === 'ruv.de'
      ? 'R+V Versicherung'
      : domain;
      
    const nameDisplay = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim() 
      : userEmail || 'Unknown User';
      
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Outreach Campaigns</h1>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Your account: {userEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Your company: {companyName}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={syncCampaigns}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Campaigns
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Campaigns</CardTitle>
                <CardDescription>
                  Campaigns assigned to you or your company
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search campaigns..."
                  className="w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-medium">Error loading campaigns</h3>
                <p className="text-muted-foreground mt-2">
                  {(error as Error).message || 'Failed to load campaigns'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <CampaignsGrid 
                campaigns={campaignsData?.campaigns}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onView={handleViewCampaign}
                dataSource={campaignsData?.dataSource}
              />
            )}
            
            {debugInfo && (
              <div className="mt-8 p-4 border rounded text-xs font-mono">
                <h4 className="font-semibold">Debug Info:</h4>
                <pre className="mt-2 overflow-auto max-h-[200px]">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedCampaign && (
          <CampaignDetailModal
            campaign={selectedCampaign}
            isOpen={isCampaignDetailOpen}
            onClose={handleCloseCampaignDetail}
          />
        )}
      </div>
    );
  }
  
  // Show a message if there's no company ID
  if (!companyId) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Outreach Campaigns</CardTitle>
            <CardDescription>Campaigns assigned to you or your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No company configured</h3>
              <p className="text-muted-foreground mt-2">
                Your account isn't associated with a company. Please contact your administrator to set up your company association to view matching campaigns.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const nameDisplay = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`.trim() 
    : user.email || 'Unknown User';
  
  const hasCompany = !!companyId;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Your Outreach Campaigns</h1>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Your account: {user.email}
              </p>
            </div>
            {hasCompany && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Your company: {nameDisplay}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={syncCampaigns}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Campaigns
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Campaigns</CardTitle>
              <CardDescription>
                Campaigns assigned to you {hasCompany ? 'or your company' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search campaigns..."
                className="w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium">Error loading campaigns</h3>
              <p className="text-muted-foreground mt-2">
                {(error as Error).message || 'Failed to load campaigns'}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <CampaignsGrid 
              campaigns={campaignsData?.campaigns}
              isLoading={isLoading}
              searchTerm={searchTerm}
              onView={handleViewCampaign}
              dataSource={campaignsData?.dataSource}
            />
          )}
          
          {debugInfo && (
            <div className="mt-8 p-4 border rounded text-xs font-mono">
              <h4 className="font-semibold">Debug Info:</h4>
              <pre className="mt-2 overflow-auto max-h-[200px]">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          isOpen={isCampaignDetailOpen}
          onClose={handleCloseCampaignDetail}
        />
      )}
    </div>
  );
};

export default CustomerOutreach;
