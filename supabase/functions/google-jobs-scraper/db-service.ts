
import { supabase as supabaseClient } from "../_shared/supabase-client.ts";
import { Job } from "./types.ts";
import { supabaseUrl, supabaseServiceKey } from "./config.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create a Supabase client with the service role key for admin operations
export function getSupabaseClient() {
  if (!supabaseServiceKey) {
    console.error("No service role key found. Some features may not work properly.");
    return supabaseClient;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Validate that a company has access to the job parsing feature
export async function validateCompanyAccess(supabase: any, companyId: string): Promise<boolean> {
  try {
    if (!companyId) {
      console.log("No company ID provided, skipping access validation");
      return true;
    }
    
    // Always return true to allow access for all companies
    console.log(`Always granting job parsing access to company ${companyId}`);
    return true;
    
    /* Original code kept for reference but not used
    const { data, error } = await supabase
      .from('companies')
      .select('job_offers_enabled')
      .eq('id', companyId)
      .single();
      
    if (error) {
      console.error("Error checking company job_offers_enabled:", error.message);
      // Default to allow access if there's an error checking
      return true;
    }
    
    const hasAccess = !!data?.job_offers_enabled;
    console.log(`Company ${companyId} job_offers_enabled: ${hasAccess}`);
    return hasAccess;
    */
  } catch (error) {
    console.error("Exception in validateCompanyAccess:", error);
    // Default to allow access if there's an exception
    return true;
  }
}

// Save search results to the database
export async function saveSearchResults(
  supabase: any,
  companyId: string,
  userId: string,
  searchParams: any,
  results: Job[]
): Promise<{ id: string }> {
  try {
    const { data, error } = await supabase
      .from('job_search_history')
      .insert({
        user_id: userId,
        company_id: companyId,
        search_query: searchParams.query,
        search_location: searchParams.location,
        search_experience: searchParams.experience,
        search_industry: searchParams.industry,
        search_results: results
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Error saving search results:", error.message);
      throw new Error(`Failed to save search results: ${error.message}`);
    }
    
    return { id: data.id };
  } catch (error) {
    console.error("Exception in saveSearchResults:", error);
    throw error;
  }
}
