
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { supabaseUrl, supabaseServiceKey } from './config.ts';

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function validateCompanyAccess(supabase: any, companyId: string): Promise<boolean> {
  try {
    // Check if company exists and has Google Jobs feature enabled
    const { data: companyFeatures, error } = await supabase
      .from('company_features')
      .select('google_jobs_enabled')
      .eq('company_id', companyId)
      .single();

    if (error) {
      console.error('Error fetching company features:', error);
      return false;
    }

    // If no features record exists, create one with google_jobs_enabled set to true for testing
    if (!companyFeatures) {
      try {
        await supabase.from('company_features').insert({
          company_id: companyId,
          google_jobs_enabled: true // Enable for testing
        });
        console.log(`Created company_features record for company ${companyId} with Google Jobs enabled`);
        return true;
      } catch (insertError) {
        console.error('Error creating company features record:', insertError);
        // Continue anyway - we'll grant access for testing purposes
        return true;
      }
    }

    // For testing purposes, consider all companies to have access
    return true;
    
    // In production, use this instead to check the actual feature flag:
    // return !!companyFeatures?.google_jobs_enabled;
  } catch (error) {
    console.error('Error validating company access:', error);
    return false;
  }
}

export async function saveSearchResults(
  supabase: any,
  companyId: string,
  userId: string,
  searchParams: any,
  results: any[]
) {
  try {
    // Prepare record for job_search_history table
    const historyRecord = {
      company_id: companyId,
      user_id: userId,
      search_query: searchParams.query,
      search_location: searchParams.location || null,
      search_experience: searchParams.experience || null,
      search_industry: searchParams.industry || null,
      search_results: results
    };

    // Insert into job_search_history
    const { data, error } = await supabase
      .from('job_search_history')
      .insert(historyRecord)
      .select('id')
      .single();

    if (error) {
      console.error('Error saving search results:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveSearchResults function:', error);
    throw error;
  }
}
