
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Tag, Edit } from 'lucide-react';
import { CampaignsGrid } from '@/components/workflows/CampaignsGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { CustomerTagsDisplay } from '@/components/ui/customer/CustomerTag';
import { CampaignDetailModal } from '@/components/workflows/CampaignDetailModal';
import { Badge } from '@/components/ui/badge';

const CustomerOutreach = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { customers } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false);
  
  // Get the customer's tags
  const customerTags = customers?.[0]?.tags || [];
  
  // Fetch campaigns that match the customer's tags
  const { 
    data: campaignsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['customer-campaigns', user?.id, customerTags],
    queryFn: async () => {
      try {
        // If no customer tags are available, don't try to fetch campaigns
        if (!customerTags.length) {
          return { campaigns: [], dataSource: 'empty' };
        }

        // Get the session for authentication
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData?.session) {
          throw new Error('You need to be logged in to fetch campaigns');
        }
        
        const accessToken = sessionData.session.access_token;
        
        try {
          // Get campaigns from the database that have tags matching our customer tags
          const { data: campaigns, error: dbError } = await supabase
            .rpc('get_instantly_campaigns');
          
          if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
          }
          
          // Get all campaigns from the API
          const response = await supabase.functions.invoke('instantly-ai', {
            body: { action: 'fetchCampaigns' },
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (response.error) {
            throw new Error(`Edge function error: ${response.error.message || JSON.stringify(response.error)}`);
          }
          
          // Merge API campaigns with database data
          const allCampaigns = response.data?.campaigns || [];
          
          // Create a map of campaign_id to tags from the database
          const campaignTagsMap = new Map();
          if (campaigns && Array.isArray(campaigns)) {
            campaigns.forEach((dbCampaign: any) => {
              if (dbCampaign.campaign_id) {
                campaignTagsMap.set(dbCampaign.campaign_id, dbCampaign.tags || []);
              }
            });
          }
          
          // Merge API campaigns with database tags
          const enrichedCampaigns = allCampaigns.map(campaign => {
            const dbTags = campaignTagsMap.get(campaign.id) || [];
            // Use API tags as fallback if available
            const campaignTags = dbTags.length > 0 ? dbTags : (Array.isArray(campaign.tags) ? campaign.tags : []);
            return {
              ...campaign,
              tags: campaignTags
            };
          });
          
          // Filter campaigns based on matching tags
          const matchingCampaigns = enrichedCampaigns.filter(campaign => {
            // Get campaign tags
            const campaignTags = Array.isArray(campaign.tags) ? campaign.tags : [];
            
            // Check if any tags match between customer and campaign
            return campaignTags.some(tag => customerTags.includes(tag));
          });
          
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
    enabled: !!user && customerTags.length > 0
  });
  
  const handleViewCampaign = async (campaign: any) => {
    try {
      setSelectedCampaign(campaign);
      setIsCampaignDetailOpen(true);
      
      // Get the session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.error('No active session found');
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      // Try fetching detailed campaign data
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
    
    // Refresh the campaign list to show updated tags
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
  
  // Check if customer has any tags
  const hasCustomerTags = customerTags && customerTags.length > 0;
  
  if (!hasCustomerTags) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Outreach Campaigns</CardTitle>
            <CardDescription>Campaigns matching your company tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tags configured</h3>
              <p className="text-muted-foreground mt-2">
                Your company doesn't have any tags configured. Please contact your administrator
                to set up tags for your company to view matching campaigns.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Your Outreach Campaigns</h1>
          <div className="flex items-center gap-2 mt-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Your company tags:
            </p>
          </div>
          <div className="mt-2">
            <CustomerTagsDisplay tags={customerTags} />
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
                Campaigns that match your company's tags
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
          ) : isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">Loading campaigns</h3>
              <p className="text-muted-foreground mt-2">
                Fetching campaigns matching your company tags...
              </p>
            </div>
          ) : !campaignsData?.campaigns?.length ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No matching campaigns</h3>
              <p className="text-muted-foreground mt-2">
                There are no campaigns matching your company tags: {' '}
                {customerTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="mr-1">{tag}</Badge>
                ))}
              </p>
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
