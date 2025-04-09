
import { corsHeaders } from "../corsHeaders.ts";

export async function handleFetchCampaignDetails(
  INSTANTLY_API_KEY: string, 
  INSTANTLY_API_URL: string,
  campaignId: string
) {
  // Validate the campaign ID
  if (!campaignId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch campaign details from Instantly
  const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Instantly API error:', data);
    return new Response(
      JSON.stringify({ error: data.message || 'Failed to fetch campaign details' }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get daily stats for the campaign
  const statsResponse = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}/stats/daily`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const statsData = await statsResponse.json();
  
  const campaign = {
    id: data.data.id,
    name: data.data.name,
    status: data.data.status,
    created_at: data.data.created_at,
    updated_at: data.data.updated_at,
    metrics: {
      emailsSent: data.data.stats?.sent || 0,
      openRate: data.data.stats?.open_rate || 0,
      clickRate: data.data.stats?.click_rate || 0,
      conversionRate: data.data.stats?.conversion_rate || 0,
      replies: data.data.stats?.replies || 0,
      dailyStats: statsData.ok ? statsData.data.map((day: any) => ({
        date: day.date,
        sent: day.sent || 0,
        opened: day.opened || 0,
        clicked: day.clicked || 0,
        replied: day.replied || 0,
      })) : []
    }
  };

  return new Response(
    JSON.stringify({ campaign }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
