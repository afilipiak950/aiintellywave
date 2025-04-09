
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  metrics: {
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    replies: number;
  };
}

export interface InstantlyCampaignDetailedMetrics extends InstantlyCampaign {
  metrics: {
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    replies: number;
    dailyStats: Array<{
      date: string;
      sent: number;
      opened: number;
      clicked: number;
      replied: number;
    }>;
  };
}

export interface InstantlyCustomerCampaign {
  id: string;
  campaign_id: string;
  customer_id: string;
  assigned_at: string;
  campaign_name: string;
  campaign_status: string;
  metrics?: {
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    replies: number;
  };
}

/**
 * Fetches all available campaigns from Instantly.ai
 */
export const fetchInstantlyCampaigns = async (): Promise<InstantlyCampaign[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('instantly-api', {
      body: { action: 'fetchCampaigns' }
    });

    if (error) {
      console.error('Error in fetchInstantlyCampaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return data.campaigns || [];
  } catch (error: any) {
    console.error('Exception in fetchInstantlyCampaigns:', error);
    throw error;
  }
};

/**
 * Fetches detailed metrics for a specific campaign
 */
export const fetchCampaignDetails = async (campaignId: string): Promise<InstantlyCampaignDetailedMetrics> => {
  try {
    const { data, error } = await supabase.functions.invoke('instantly-api', {
      body: { action: 'fetchCampaignDetails', campaignId }
    });

    if (error) {
      console.error('Error in fetchCampaignDetails:', error);
      throw new Error(`Failed to fetch campaign details: ${error.message}`);
    }

    return data.campaign;
  } catch (error: any) {
    console.error('Exception in fetchCampaignDetails:', error);
    throw error;
  }
};

/**
 * Assigns a campaign to a customer
 */
export const assignCampaignToCustomer = async (campaignId: string, customerId: string): Promise<InstantlyCustomerCampaign> => {
  try {
    // Fetch campaign details first to get name and status
    const campaign = await fetchCampaignDetails(campaignId);
    
    // Create the assignment in the database
    const { data, error } = await supabase
      .from('instantly_customer_campaigns')
      .insert([
        { 
          campaign_id: campaignId, 
          customer_id: customerId,
          campaign_name: campaign.name,
          campaign_status: campaign.status,
          metrics: campaign.metrics,
          assigned_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error in assignCampaignToCustomer:', error);
      throw new Error(`Failed to assign campaign: ${error.message}`);
    }

    return data as InstantlyCustomerCampaign;
  } catch (error: any) {
    console.error('Exception in assignCampaignToCustomer:', error);
    throw error;
  }
};

/**
 * Fetches all campaigns assigned to a specific customer
 */
export const fetchCustomerCampaigns = async (customerId: string): Promise<InstantlyCustomerCampaign[]> => {
  try {
    const { data, error } = await supabase
      .from('instantly_customer_campaigns')
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error in fetchCustomerCampaigns:', error);
      throw new Error(`Failed to fetch customer campaigns: ${error.message}`);
    }

    return data as InstantlyCustomerCampaign[];
  } catch (error: any) {
    console.error('Exception in fetchCustomerCampaigns:', error);
    throw error;
  }
};

/**
 * Refreshes campaign metrics for all assigned campaigns
 */
export const refreshCampaignMetrics = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('instantly-api', {
      body: { action: 'refreshMetrics' }
    });

    if (error) {
      console.error('Error in refreshCampaignMetrics:', error);
      throw new Error(`Failed to refresh metrics: ${error.message}`);
    }

    if (data.success) {
      toast({
        title: "Success",
        description: `Refreshed metrics for ${data.updatedCount} campaigns`,
      });
    } else {
      toast({
        title: "Warning",
        description: data.message || "Some campaigns failed to refresh",
        variant: "destructive"
      });
    }
  } catch (error: any) {
    console.error('Exception in refreshCampaignMetrics:', error);
    throw error;
  }
};
