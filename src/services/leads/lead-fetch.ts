
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { LeadFetchOptions } from './types/fetch-types';
import { fetchLeadsByProjectDirect } from './utils/project-access';
import { handleEmergencyFallback } from './utils/emergency-fallback';

export const fetchLeadsData = async (options: LeadFetchOptions = {}) => {
  try {
    // Start building the query - much simpler approach
    let query = supabase
      .from('leads')
      .select(`
        id,
        name,
        company,
        email,
        phone,
        position,
        status,
        notes,
        last_contact,
        created_at,
        updated_at,
        score,
        tags,
        project_id,
        extra_data,
        projects:project_id (
          id,
          name,
          company_id
        )
      `);
    
    // Apply filters
    if (options.projectId && options.projectId !== 'all') {
      console.log(`Filtering by specific project: ${options.projectId}`);
      query = query.eq('project_id', options.projectId);
    }
    
    if (options.status) {
      console.log(`Filtering by status: ${options.status}`);
      query = query.eq('status', options.status);
    }
    
    // Apply limit and order
    query = query.limit(options.limit || 100);
    query = query.order('created_at', { ascending: false });
    
    // Execute the query
    console.log('Executing leads query with filters:', options);
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      
      // If we get an RLS error, try the backup method immediately
      if (leadsError.code === '42P17' || leadsError.message?.includes('infinite recursion')) {
        console.warn('RLS policy error detected, falling back to direct project access');
        
        if (options.projectId && options.projectId !== 'all') {
          return fetchLeadsByProjectDirect(options.projectId);
        }
        
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          return handleEmergencyFallback(userData.user.id);
        }
      }
      
      throw new Error(leadsError.message || 'Error fetching leads from database');
    }
    
    console.log(`Found ${leadsData?.length || 0} leads matching criteria`);
    
    // Process leads to include project_name and ensure extra_data is correctly typed
    const leads = (leadsData || []).map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'Unassigned',
      extra_data: lead.extra_data ? 
        (typeof lead.extra_data === 'string' ? JSON.parse(lead.extra_data) : lead.extra_data) : 
        null,
      website: null
    }));
    
    return leads as Lead[];
  } catch (error) {
    console.error('Lead fetch error:', error);
    throw error instanceof Error ? error : new Error('Error fetching leads');
  }
};

// Re-export utility functions for direct access if needed
export { fetchLeadsByProjectDirect } from './utils/project-access';
