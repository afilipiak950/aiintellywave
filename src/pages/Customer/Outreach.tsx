
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
  
  const companyId = customers?.[0]?.id;
  const userId = user?.id;
  
  const { 
    data: campaignsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['customer-campaigns', userId, companyId],
    queryFn: async () => {
      try {
        if (!userId) {
          return { campaigns: [], dataSource: 'empty' };
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData?.session) {
          throw new Error('You need to be logged in to fetch campaigns');
        }
        
        const accessToken = sessionData.session.access_token;
        
        try {
          const response = await supabase.functions.invoke('instantly-ai', {
            body: { action: 'fetchCampaigns' },
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (response.error) {
            throw new Error(`Edge function error: ${response.error.message || JSON.stringify(response.error)}`);
          }
          
          const allCampaigns = response.data?.campaigns || [];
          
          // Fetch company campaign assignments
          const { data: companyAssignments, error: companyAssignmentsError } = await supabase
            .from('campaign_company_assignments')
            .select('campaign_id')
            .eq('company_id', companyId || '');
          
          if (companyAssignmentsError && companyId) {
            console.error('Error fetching company campaign assignments:', companyAssignmentsError);
          }
          
          // Fetch user campaign assignments
          const { data: userAssignments, error: userAssignmentsError } = await supabase
            .from('campaign_user_assignments')
            .select('campaign_id')
            .eq('user_id', userId);
          
          if (userAssignmentsError) {
            console.error('Error fetching user campaign assignments:', userAssignmentsError);
          }
          
          // Combine the assigned campaign IDs from both sources
          const companyAssignedIds = (companyAssignments || []).map((a: any) => a.campaign_id);
          const userAssignedIds = (userAssignments || []).map((a: any) => a.campaign_id);
          const allAssignedIds = [...new Set([...companyAssignedIds, ...userAssignedIds])];
          
          console.log('User ID:', userId);
          console.log('Company ID:', companyId);
          console.log('User assigned campaign IDs:', userAssignedIds);
          console.log('Company assigned campaign IDs:', companyAssignedIds);
          console.log('Combined assigned campaign IDs:', allAssignedIds);
          
          const matchingCampaigns = allCampaigns.filter((campaign: any) => 
            allAssignedIds.includes(campaign.id)
          );
          
          console.log('Matching campaigns:', matchingCampaigns);
          
          return {
            campaigns: matchingCampaigns,
            dataSource: response.data?.status === 'fallback' ? 'fallback' : 'api'
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
