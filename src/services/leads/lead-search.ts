
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

/**
 * Search leads including within the extra_data JSONB field
 * This allows searching across both standard fields and dynamic fields
 */
export const searchLeadsWithExtraData = async (
  searchTerm: string, 
  options: { projectId?: string; status?: Lead['status']; assignedToUser?: boolean } = {}
): Promise<Lead[]> => {
  if (!searchTerm || searchTerm.trim() === '') {
    // If no search term, use regular fetch
    const { fetchLeadsData } = await import('./lead-fetch');
    return fetchLeadsData(options);
  }
  
  try {
    const lowercaseSearch = searchTerm.toLowerCase();
    
    // Build query with filters
    let query = supabase
      .from('leads')
      .select(`
        id, name, company, email, phone, position, status, notes, last_contact,
        created_at, updated_at, score, tags, project_id, extra_data,
        projects:project_id (id, name, company_id, assigned_to)
      `);
    
    // Apply project filter if specified
    if (options.projectId) {
      query = options.projectId === 'unassigned' 
        ? query.is('project_id', null) 
        : query.eq('project_id', options.projectId);
    }
    
    // Apply status filter if specified
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    // Build complex OR filter for searching across multiple columns
    // including the JSONB extra_data field
    query = query.or(`
      name.ilike.%${lowercaseSearch}%,
      email.ilike.%${lowercaseSearch}%,
      phone.ilike.%${lowercaseSearch}%,
      position.ilike.%${lowercaseSearch}%,
      company.ilike.%${lowercaseSearch}%,
      notes.ilike.%${lowercaseSearch}%,
      extra_data::text.ilike.%${lowercaseSearch}%
    `);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process leads to include project_name
    const leads = (data || []).map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'Unassigned',
    }));
    
    return leads;
    
  } catch (error) {
    console.error('Error searching leads with extra data:', error);
    return [];
  }
};
