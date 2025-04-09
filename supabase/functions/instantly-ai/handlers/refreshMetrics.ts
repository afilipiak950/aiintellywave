
import { corsHeaders } from "../corsHeaders.ts";

export async function handleRefreshMetrics(
  INSTANTLY_API_KEY: string, 
  INSTANTLY_API_URL: string,
  supabaseClient: any
) {
  try {
    // Fetch all customer campaign assignments from the database
    const { data: customerCampaigns, error: fetchError } = await supabaseClient
      .from('instantly_customer_campaigns')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching customer campaigns:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch customer campaigns', 
          message: fetchError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!customerCampaigns || customerCampaigns.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No customer campaigns to refresh', 
          updatedCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Track success and failures
    let successCount = 0;
    let failureCount = 0;
    
    // Process each campaign to update its metrics
    for (const customerCampaign of customerCampaigns) {
      try {
        // Fetch the latest campaign data from Instantly
        const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${customerCampaign.campaign_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`Failed to fetch campaign ${customerCampaign.campaign_id}:`, data);
          failureCount++;
          continue;
        }
        
        // Extract and format metrics
        const updatedMetrics = {
          emailsSent: data.data.stats?.sent || 0,
          openRate: data.data.stats?.open_rate || 0,
          clickRate: data.data.stats?.click_rate || 0,
          conversionRate: data.data.stats?.conversion_rate || 0,
          replies: data.data.stats?.replies || 0,
        };
        
        // Update the database record
        const { error: updateError } = await supabaseClient
          .from('instantly_customer_campaigns')
          .update({ 
            metrics: updatedMetrics,
            campaign_status: data.data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerCampaign.id);
        
        if (updateError) {
          console.error(`Failed to update campaign ${customerCampaign.campaign_id}:`, updateError);
          failureCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing campaign ${customerCampaign.campaign_id}:`, error);
        failureCount++;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: failureCount > 0 ? `Updated ${successCount} campaigns, ${failureCount} failed` : 'All campaigns updated successfully',
        updatedCount: successCount,
        failedCount: failureCount,
        totalCount: customerCampaigns.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refreshMetrics:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to refresh campaign metrics', 
        message: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
