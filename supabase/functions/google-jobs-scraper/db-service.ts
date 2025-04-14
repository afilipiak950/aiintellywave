
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { FormattedJob } from './types.ts';

// Initialize Supabase client
export const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );
};

export async function validateCompanyAccess(supabaseClient: any, companyId: string): Promise<boolean> {
  const { data: companyFeature, error: featureError } = await supabaseClient
    .from('company_features')
    .select('google_jobs_enabled')
    .eq('company_id', companyId)
    .single();

  if (featureError) {
    console.error('Error fetching company features:', featureError);
    if (featureError.code === 'PGRST116') {
      return false;
    }
    throw featureError;
  }

  return !!companyFeature?.google_jobs_enabled;
}

export async function saveSearchResults(
  supabaseClient: any,
  companyId: string,
  userId: string,
  searchParams: any,
  results: FormattedJob[]
): Promise<any> {
  const { data: jobOfferRecord, error: insertError } = await supabaseClient
    .from('job_search_history')
    .insert({
      company_id: companyId,
      user_id: userId,
      search_query: searchParams.query,
      search_location: searchParams.location,
      search_experience: searchParams.experience,
      search_industry: searchParams.industry,
      search_results: results,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('Error saving search results:', insertError);
    throw insertError;
  }
  
  return jobOfferRecord;
}
