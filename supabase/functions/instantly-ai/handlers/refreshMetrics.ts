
import { corsHeaders } from "../corsHeaders.ts";

export async function handleRefreshMetrics(
  INSTANTLY_API_KEY: string, 
  INSTANTLY_API_URL: string,
  supabaseClient: any
) {
  // Get all assigned campaigns from the database
  const { data: assignments, error: dbError } = await supabaseClient
    .from('instantly_customer_campaigns')
    .select('*');

  if (dbError) {
    console.error('Database error:', dbError);
    return new Response(
      JSON.stringify({ error: dbError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!assignments || assignments.length === 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'No campaigns to refresh', updatedCount: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update metrics for each campaign
  const updatePromises = assignments.map(async (assignment) => {
    try {
      // Fetch updated metrics from Instantly
      const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${assignment.campaign_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Error refreshing metrics for campaign ${assignment.campaign_id}:`, data);
        return { 
          status: 'error', 
          id: assignment.id, 
          error: data.message || 'Failed to fetch updated metrics' 
        };
      }

      // Update the database with new metrics
      const metrics = {
        emailsSent: data.data.stats?.sent || 0,
        openRate: data.data.stats?.open_rate || 0,
        clickRate: data.data.stats?.click_rate || 0,
        conversionRate: data.data.stats?.conversion_rate || 0,
        replies: data.data.stats?.replies || 0,
      };

      const { error: updateError } = await supabaseClient
        .from('instantly_customer_campaigns')
        .update({ 
          metrics, 
          campaign_status: data.data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.id);

      if (updateError) {
        console.error(`Error updating database for campaign ${assignment.campaign_id}:`, updateError);
        return { 
          status: 'error', 
          id: assignment.id, 
          error: updateError.message 
        };
      }

      return { status: 'updated', id: assignment.id };
    } catch (error) {
      console.error(`Exception in refreshing campaign ${assignment.campaign_id}:`, error);
      return { 
        status: 'error', 
        id: assignment.id, 
        error: error.message || 'Unknown error' 
      };
    }
  });

  const results = await Promise.all(updatePromises);
  
  // Count the results
  const updatedCount = results.filter(r => r.status === 'updated').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return new Response(
    JSON.stringify({
      success: true,
      message: `Updated metrics for ${updatedCount} campaigns${errorCount > 0 ? ` with ${errorCount} errors` : ''}`,
      updatedCount,
      errorCount,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
