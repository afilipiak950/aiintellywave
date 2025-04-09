import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Types for Instantly.ai integration
 */
export interface InstantlyCampaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  replies: number;
  [key: string]: any; // Add index signature to allow additional properties
}

export interface InstantlyCampaignDetailedMetrics extends InstantlyCampaign {
  metrics: CampaignMetrics & {
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
  metrics?: CampaignMetrics;
}

// Custom error type for Instantly API errors
export class InstantlyApiError extends Error {
  status: number;
  details?: any;
  
  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'InstantlyApiError';
    this.status = status;
    this.details = details;
  }
}

// Error handling helper
const handleApiError = (error: any): never => {
  console.error('Instantly API Error:', error);
  
  // Format a user-friendly error message based on the error type
  let errorMessage = 'An unknown error occurred with the Instantly API';
  let errorStatus = 500;
  let errorDetails: any = {};
  
  if (error instanceof InstantlyApiError) {
    errorMessage = error.message;
    errorStatus = error.status;
    errorDetails = error.details;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    
    if (error.message.includes('Edge Function')) {
      errorMessage = 'Could not connect to the Instantly API Edge Function. Please check your configuration.';
    } else if (error.message.includes('timed out')) {
      errorMessage = 'Request timed out. The Edge Function might be taking too long to respond.';
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Network error occurred while connecting to the Instantly API.';
    } else if (error.message.includes('non-2xx status code')) {
      errorMessage = 'The Edge Function returned an error. This may be due to invalid request data or API key issues.';
    } else if (error.message.includes('parse') || error.message.includes('JSON')) {
      errorMessage = 'Request parsing error. The Edge Function could not process the request data.';
    }
  }
  
  // Throw a well-formatted error
  throw new InstantlyApiError(errorMessage, errorStatus, errorDetails);
};

/**
 * Fetches all available campaigns from Instantly.ai
 */
export const fetchInstantlyCampaigns = async (): Promise<InstantlyCampaign[]> => {
  try {
    console.log('Fetching campaigns from Instantly.ai');
    
    // Add a timeout for the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. The Edge Function might be taking too long to respond.')), 15000);
    });

    // Call the Edge Function with proper formatting and headers
    const fetchPromise = supabase.functions.invoke('instantly-ai', {
      body: { action: 'fetchCampaigns' },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Wait for either the fetch to complete or the timeout to occur
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log full response for debugging
    console.log('Edge function response:', response);
    
    // Check for errors in the response
    if (response.error) {
      console.error('Error response from Edge Function:', response.error);
      throw new InstantlyApiError(
        response.error.message || 'Failed to fetch campaigns',
        500,
        response.error
      );
    }
    
    // Check for missing data
    if (!response.data || !response.data.campaigns) {
      console.error('Invalid response format from Edge Function:', response);
      throw new InstantlyApiError(
        'Invalid response format received from API',
        500,
        { response }
      );
    }
    
    // Return the campaigns data
    return response.data.campaigns || [];
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * Fetches detailed metrics for a specific campaign
 */
export const fetchCampaignDetails = async (campaignId: string): Promise<InstantlyCampaignDetailedMetrics> => {
  try {
    console.log(`Fetching details for campaign: ${campaignId}`);
    
    // Add a timeout for the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. The Edge Function might be taking too long to respond.')), 15000);
    });

    // Call the Edge Function
    const fetchPromise = supabase.functions.invoke('instantly-ai', {
      body: { action: 'fetchCampaignDetails', campaignId },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Wait for either the fetch to complete or the timeout to occur
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log full response for debugging
    console.log('Campaign details response:', response);
    
    // Check for errors in the response
    if (response.error) {
      console.error('Error response from Edge Function:', response.error);
      throw new InstantlyApiError(
        response.error.message || 'Failed to fetch campaign details',
        500,
        response.error
      );
    }
    
    // Check for missing data
    if (!response.data || !response.data.campaign) {
      console.error('Invalid response format from Edge Function:', response);
      throw new InstantlyApiError(
        'Invalid response format received from API',
        500,
        { response }
      );
    }
    
    // Return the campaign details
    return response.data.campaign;
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * Assigns a campaign to a customer
 */
export const assignCampaignToCustomer = async (campaignId: string, customerId: string): Promise<InstantlyCustomerCampaign> => {
  try {
    console.log(`Assigning campaign ${campaignId} to customer ${customerId}`);
    
    // Validate input parameters
    if (!campaignId) throw new Error('Campaign ID is required');
    if (!customerId) throw new Error('Customer ID is required');
    
    // Add a timeout for the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. The Edge Function might be taking too long to respond.')), 15000);
    });

    // Call the Edge Function
    const fetchPromise = supabase.functions.invoke('instantly-ai', {
      body: { action: 'assignCampaign', campaignId, customerId },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Wait for either the fetch to complete or the timeout to occur
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log full response for debugging
    console.log('Assignment response:', response);
    
    // Check for errors in the response
    if (response.error) {
      console.error('Error response from Edge Function:', response.error);
      throw new InstantlyApiError(
        response.error.message || 'Failed to assign campaign',
        500,
        response.error
      );
    }
    
    // Check for missing data
    if (!response.data || !response.data.assignment) {
      console.error('Invalid response format from Edge Function:', response);
      throw new InstantlyApiError(
        'Invalid response format received from API',
        500,
        { response }
      );
    }
    
    // Store in Supabase database
    const assignment = response.data.assignment;
    const { data, error } = await supabase
      .from('instantly_customer_campaigns')
      .insert([assignment])
      .select()
      .single();

    if (error) {
      console.error('Database error storing assignment:', error);
      throw new Error(`Failed to store campaign assignment: ${error.message}`);
    }

    // Process and return the stored assignment data
    // Ensure metrics is properly typed
    const processedData: InstantlyCustomerCampaign = {
      id: data.id,
      campaign_id: data.campaign_id,
      customer_id: data.customer_id,
      assigned_at: data.assigned_at,
      campaign_name: data.campaign_name,
      campaign_status: data.campaign_status,
      metrics: data.metrics as CampaignMetrics
    };
    
    return processedData;
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * Fetches all campaigns assigned to a specific customer
 */
export const fetchCustomerCampaigns = async (customerId: string): Promise<InstantlyCustomerCampaign[]> => {
  try {
    console.log(`Fetching campaigns for customer ${customerId}`);
    
    // Validate input parameter
    if (!customerId) throw new Error('Customer ID is required');
    
    // Query the database for assigned campaigns
    const { data, error } = await supabase
      .from('instantly_customer_campaigns')
      .select('*')
      .eq('customer_id', customerId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Database error fetching customer campaigns:', error);
      throw new Error(`Failed to fetch customer campaigns: ${error.message}`);
    }

    // Parse the data with proper metrics typing
    const campaigns: InstantlyCustomerCampaign[] = data.map(item => ({
      id: item.id,
      campaign_id: item.campaign_id,
      customer_id: item.customer_id,
      assigned_at: item.assigned_at,
      campaign_name: item.campaign_name,
      campaign_status: item.campaign_status,
      metrics: item.metrics as unknown as CampaignMetrics
    }));
    
    return campaigns;
  } catch (error: any) {
    console.error('Error in fetchCustomerCampaigns:', error);
    
    // Format a user-friendly error message
    const errorMessage = error.message || 'Failed to fetch customer campaigns';
    throw new Error(errorMessage);
  }
};

/**
 * Refreshes campaign metrics for all assigned campaigns
 */
export const refreshCampaignMetrics = async (): Promise<void> => {
  try {
    console.log('Refreshing metrics for all campaigns');
    
    // Add a timeout for the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. The Edge Function might be taking too long to respond.')), 30000);
    });

    // Call the Edge Function
    const fetchPromise = supabase.functions.invoke('instantly-ai', {
      body: { action: 'refreshMetrics' },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Wait for either the fetch to complete or the timeout to occur
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log full response for debugging
    console.log('Refresh metrics response:', response);
    
    // Check for errors in the response
    if (response.error) {
      console.error('Error response from Edge Function:', response.error);
      throw new InstantlyApiError(
        response.error.message || 'Failed to refresh metrics',
        500,
        response.error
      );
    }
    
    // Fetch all assigned campaigns from the database
    const { data: assignments, error: fetchError } = await supabase
      .from('instantly_customer_campaigns')
      .select('id, campaign_id');
      
    if (fetchError) {
      console.error('Database error fetching assignments:', fetchError);
      throw new Error(`Failed to fetch campaign assignments: ${fetchError.message}`);
    }
    
    // For each assigned campaign, fetch the latest metrics
    const updatePromises = assignments.map(async (assignment) => {
      try {
        // Fetch updated campaign details
        const campaign = await fetchCampaignDetails(assignment.campaign_id);
        
        // Update the database record
        const { error: updateError } = await supabase
          .from('instantly_customer_campaigns')
          .update({ 
            metrics: campaign.metrics as unknown as Record<string, any>,
            campaign_status: campaign.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', assignment.id);
          
        if (updateError) {
          console.error(`Error updating metrics for assignment ${assignment.id}:`, updateError);
          return { id: assignment.id, status: 'error', error: updateError.message };
        }
        
        return { id: assignment.id, status: 'updated' };
      } catch (error: any) {
        console.error(`Error updating metrics for assignment ${assignment.id}:`, error);
        return { id: assignment.id, status: 'error', error: error.message };
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    
    // Count successful and failed updates
    const successCount = results.filter(r => r.status === 'updated').length;
    const failCount = results.filter(r => r.status === 'error').length;
    
    // Show appropriate toast message
    if (successCount > 0) {
      toast({
        title: "Metrics refreshed",
        description: `Successfully updated ${successCount} campaigns${failCount > 0 ? ` (${failCount} failed)` : ''}`,
        variant: failCount > 0 ? "destructive" : "default"
      });
    } else if (failCount > 0) {
      toast({
        title: "Failed to refresh metrics",
        description: `All ${failCount} campaign updates failed. Please check the logs.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "No campaigns to refresh",
        description: "No campaigns were found to refresh metrics for.",
      });
    }
  } catch (error: any) {
    console.error('Error in refreshCampaignMetrics:', error);
    
    // Format a user-friendly error message
    let errorMessage = 'Failed to refresh campaign metrics';
    
    if (error instanceof InstantlyApiError) {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Show error toast
    toast({
      title: "Error refreshing metrics",
      description: errorMessage,
      variant: "destructive"
    });
    
    throw error;
  }
};
