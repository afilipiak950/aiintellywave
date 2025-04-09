
import { corsHeaders } from "../corsHeaders.ts";

export async function handleAssignCampaign(
  INSTANTLY_API_KEY: string, 
  INSTANTLY_API_URL: string,
  campaignId: string,
  customerId: string
) {
  if (!campaignId || !customerId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID and Customer ID are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get campaign details from Instantly
    const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to fetch campaign details' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create assignment in database
    const createResponse = await fetch(
      `${supabaseUrl}/rest/v1/instantly_customer_campaigns`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          customer_id: customerId,
          campaign_name: data.data.name,
          campaign_status: data.data.status,
          metrics: {
            emailsSent: data.data.stats?.sent || 0,
            openRate: data.data.stats?.open_rate || 0,
            clickRate: data.data.stats?.click_rate || 0,
            conversionRate: data.data.stats?.conversion_rate || 0,
            replies: data.data.stats?.replies || 0,
          },
          assigned_at: new Date().toISOString()
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Error creating assignment:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to assign campaign', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assignment = await createResponse.json();

    return new Response(
      JSON.stringify({ success: true, assignment: assignment[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error assigning campaign:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to assign campaign' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
